import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import axios, { AxiosInstance } from 'axios';

const VIRTUAL_TRYON_PROMPT = `You are an expert virtual try-on AI. You will be given a 'model image' and a 'garment image'. Your task is to create a new photorealistic image where the person from the 'model image' is wearing the clothing from the 'garment image'.

**Crucial Rules:**
1.  **Complete Garment Replacement:** You MUST completely REMOVE and REPLACE the clothing item worn by the person in the 'model image' with the new garment. No part of the original clothing (e.g., collars, sleeves, patterns) should be visible in the final image.
2.  **Preserve the Model:** The person's face, hair, body shape, and pose from the 'model image' MUST remain unchanged.
3.  **Preserve the Background:** The entire background from the 'model image' MUST be preserved perfectly.
4.  **Preserve the Features of 'garment image':** Ensure that the features of 'garment image' MUST be preserved perfectly.
5.  **Apply the Garment:** Realistically fit the new garment onto the person. It should adapt to their pose with natural folds, shadows.
5.  **Output:** Return ONLY the final, edited image. Do not include any text.`;

export interface GeminiVirtualTryonOptions {
  modelImagePath?: string;
  garmentImagePath?: string;
  modelImageBuffer?: Buffer;
  garmentImageBuffer?: Buffer;
  seed?: number;
  timeout?: number;
}

export interface GeminiVirtualTryonResult {
  imageBuffer: Buffer;
  mimeType: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private httpClient: AxiosInstance;
  private apiKey: string;
  private apiBaseUrl: string;
  private model: string;
  private timeout: number;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('gemini.apiKey') || '';
    this.apiBaseUrl =
      this.configService.get<string>('gemini.baseUrl') ||
      'https://generativelanguage.googleapis.com';
    this.model =
      this.configService.get<string>('gemini.model') ||
      'gemini-2.5-flash-image-preview';
    this.timeout = this.configService.get<number>('gemini.timeout') || 60;

    if (!this.apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not configured. Virtual try-on feature will not work.',
      );
    }

    // Create axios instance
    this.httpClient = axios.create({
      timeout: this.timeout * 1000,
    });
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Perform virtual try-on using Gemini API
   * Accepts either file paths or buffers
   */
  async virtualTryon(
    options: GeminiVirtualTryonOptions,
  ): Promise<GeminiVirtualTryonResult> {
    const { modelImagePath, garmentImagePath, modelImageBuffer, garmentImageBuffer, seed, timeout } = options;

    this.logger.log(
      `Starting virtual try-on: model=${modelImagePath || 'buffer'}, garment=${garmentImagePath || 'buffer'}`,
    );

    try {
      // Get images from either path or buffer
      let modelImage: Buffer;
      let garmentImage: Buffer;

      if (modelImageBuffer && garmentImageBuffer) {
        // Use provided buffers
        modelImage = modelImageBuffer;
        garmentImage = garmentImageBuffer;
      } else if (modelImagePath && garmentImagePath) {
        // Read from file paths
        [modelImage, garmentImage] = await Promise.all([
          fs.readFile(modelImagePath),
          fs.readFile(garmentImagePath),
        ]);
      } else {
        throw new Error('Must provide either image paths or image buffers');
      }

      // Encode images to base64
      const modelBase64 = modelImage.toString('base64');
      const garmentBase64 = garmentImage.toString('base64');

      // Build API endpoint
      const url = this.buildApiEndpoint();

      // Build request payload (following Python implementation)
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: VIRTUAL_TRYON_PROMPT },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: modelBase64,
                },
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: garmentBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'image/png',
          ...(seed !== undefined && { seed, random_seed: seed }),
        },
        responseModalities: ['IMAGE', 'TEXT'],
      };

      // Build headers and params
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const params: Record<string, string> = {};

      // Apply authentication (query param or header)
      this.applyAuth(headers, params);

      this.logger.log(`Calling Gemini API: ${url}`);

      // Call Gemini API
      const response = await this.httpClient.post(url, payload, {
        headers,
        params,
        timeout: (timeout || this.timeout) * 1000,
      });

      // Extract image from response
      const imageBuffer = this.extractImageFromResponse(response.data);

      this.logger.log('Virtual try-on completed successfully');

      return {
        imageBuffer,
        mimeType: 'image/png',
      };
    } catch (error) {
      this.logger.error('Virtual try-on failed');
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * Build full API endpoint URL
   */
  private buildApiEndpoint(): string {
    const base = this.apiBaseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    return `${base}/v1beta/models/${this.model}:generateContent`;
  }

  /**
   * Apply authentication to headers or query params
   * Following Python implementation pattern
   */
  private applyAuth(
    headers: Record<string, string>,
    params: Record<string, string>,
  ): void {
    // For standard Google API, use query param
    // For custom proxies, they might use header authentication
    const authHeader = this.configService.get<string>('gemini.authHeader');

    if (authHeader) {
      // Custom auth header (for proxies)
      headers[authHeader] = `Bearer ${this.apiKey}`;
    } else {
      // Standard Google API - use query param
      params['key'] = this.apiKey;
    }
  }

  /**
   * Extract image bytes from Gemini API response
   * Following Python implementation pattern
   */
  private extractImageFromResponse(responseData: any): Buffer {
    const candidates = responseData.candidates || [];

    if (!candidates || candidates.length === 0) {
      // Check for block reason
      const feedback = responseData.promptFeedback || {};
      const blockReason = feedback.blockReason || feedback.block_reason;
      if (blockReason) {
        throw new Error(`Gemini blocked the request: ${blockReason}`);
      }
      throw new Error('Gemini API returned no candidates');
    }

    // Look for inline image data in candidates
    for (const candidate of candidates) {
      const content = candidate.content || {};
      const parts = content.parts || [];

      for (const part of parts) {
        // Check inline_data format
        const inline = part.inline_data || part.inlineData;
        if (inline && typeof inline === 'object') {
          const mimeType = inline.mime_type || inline.mimeType || '';
          const dataBase64 = inline.data;

          if (dataBase64 && mimeType.startsWith('image/')) {
            return Buffer.from(dataBase64, 'base64');
          }
        }

        // Check for text format with embedded data URL
        const text = part.text;
        if (text && typeof text === 'string') {
          const match = text.match(
            /data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/,
          );
          if (match) {
            try {
              return Buffer.from(match[1], 'base64');
            } catch {
              // Continue to next part if decode fails
            }
          }
        }
      }
    }

    // If we reach here, no image found
    const finishReason = candidates[0]?.finishReason;
    throw new Error(
      `No image found in response. finishReason=${finishReason}, response=${JSON.stringify(responseData).slice(0, 800)}`,
    );
  }
}

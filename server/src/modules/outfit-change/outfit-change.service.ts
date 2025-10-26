import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from './storage/storage.service';
import { GeminiService } from './gemini/gemini.service';
import { CreditService } from '../credit/credit.service';
import { randomUUID } from 'crypto';
import { join } from 'path';

@Injectable()
export class OutfitChangeService {
  private readonly logger = new Logger(OutfitChangeService.name);
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  private readonly CREDITS_PER_TRYON = 10;

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private geminiService: GeminiService,
    private creditService: CreditService,
  ) {}

  /**
   * Upload model photo
   */
  async uploadModelPhoto(
    userId: string,
    file: Express.Multer.File,
    width?: number,
    height?: number,
  ) {
    // Validate file
    await this.validateFile(file.buffer);

    // Generate unique filename
    const fileExtension = file.mimetype.split('/')[1];
    const filename = `${randomUUID()}.${fileExtension}`;

    // Save file to local storage
    const filePath = await this.storageService.saveFile(
      file.buffer,
      'models',
      filename,
    );

    // Create database record
    const modelPhoto = await this.prisma.modelPhoto.create({
      data: {
        userId,
        imageUrl: filePath,
        originalFileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: width || 0,
        height: height || 0,
      },
    });

    this.logger.log(`Model photo uploaded: ${modelPhoto.id}`);

    // Add file URL to response
    return {
      ...modelPhoto,
      url: this.storageService.getFileUrl(modelPhoto.imageUrl),
    };
  }

  /**
   * Get user's model photos
   */
  async getModelPhotos(userId: string) {
    const photos = await this.prisma.modelPhoto.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    // Add file URLs
    return photos.map((photo) => ({
      ...photo,
      url: this.storageService.getFileUrl(photo.imageUrl),
    }));
  }

  /**
   * Upload clothing item photo
   */
  async uploadClothingItem(
    userId: string,
    file: Express.Multer.File,
    width?: number,
    height?: number,
  ) {
    // Validate file
    await this.validateFile(file.buffer);

    // Generate unique filename
    const fileExtension = file.mimetype.split('/')[1];
    const filename = `${randomUUID()}.${fileExtension}`;

    // Save file to local storage (in clothing subdirectory)
    const filePath = await this.storageService.saveFile(
      file.buffer,
      'clothing',
      filename,
    );

    // Create database record
    const clothingItem = await this.prisma.clothingItem.create({
      data: {
        userId,
        imageUrl: filePath,
        originalFileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: width || 0,
        height: height || 0,
      },
    });

    this.logger.log(`Clothing item uploaded: ${clothingItem.id}`);

    // Add file URL to response
    return {
      ...clothingItem,
      url: this.storageService.getFileUrl(clothingItem.imageUrl),
    };
  }

  /**
   * Get user's clothing items
   */
  async getClothingItems(userId: string) {
    const items = await this.prisma.clothingItem.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    // Add file URLs
    return items.map((item) => ({
      ...item,
      url: this.storageService.getFileUrl(item.imageUrl),
    }));
  }

  /**
   * Start virtual try-on processing
   */
  async startVirtualTryon(
    userId: string,
    modelPhotoId: string,
    clothingItemId: string,
    seed?: number,
  ) {
    // Validate that both model photo and clothing item exist and belong to user
    const modelPhoto = await this.prisma.modelPhoto.findFirst({
      where: {
        id: modelPhotoId,
        userId,
        deletedAt: null,
      },
    });

    if (!modelPhoto) {
      throw new BadRequestException('Model photo not found');
    }

    const clothingItem = await this.prisma.clothingItem.findFirst({
      where: {
        id: clothingItemId,
        userId,
        deletedAt: null,
      },
    });

    if (!clothingItem) {
      throw new BadRequestException('Clothing item not found');
    }

    // Check if Gemini API is configured
    if (!this.geminiService.isConfigured()) {
      throw new BadRequestException(
        'Gemini API is not configured. Please set GEMINI_API_KEY in environment variables.',
      );
    }

    // Check if user has enough credits
    const hasEnoughCredits = await this.creditService.hasEnoughCredits(
      userId,
      this.CREDITS_PER_TRYON,
    );

    if (!hasEnoughCredits) {
      throw new BadRequestException(
        `Insufficient credits. You need ${this.CREDITS_PER_TRYON} credits to start virtual try-on.`,
      );
    }

    // Deduct credits and create processing session in a transaction
    const { session, creditTransaction } = await this.prisma.$transaction(
      async (tx) => {
        // Create processing session first (without credit transaction ID)
        const newSession = await tx.processingSession.create({
          data: {
            userId,
            modelPhotoId,
            clothingItemId,
            status: 'processing',
          },
        });

        // Deduct credits using CreditService (which has its own transaction)
        const transaction = await this.creditService.deductCredits(
          userId,
          this.CREDITS_PER_TRYON,
          newSession.id,
          'Virtual try-on processing',
        );

        // Update session with credit transaction ID
        await tx.processingSession.update({
          where: { id: newSession.id },
          data: { creditTransactionId: transaction.id },
        });

        return { session: newSession, creditTransaction: transaction };
      },
    );

    this.logger.log(
      `Virtual try-on started: session=${session.id}, credits deducted=${this.CREDITS_PER_TRYON}`,
    );

    // Process in background (don't await)
    this.processVirtualTryon(
      session.id,
      modelPhoto.imageUrl,
      clothingItem.imageUrl,
      seed,
    ).catch((error) => {
      this.logger.error(`Virtual try-on failed: session=${session.id}`, error);
    });

    return {
      sessionId: session.id,
      status: session.status,
    };
  }

  /**
   * Get processing session status
   */
  async getSessionStatus(userId: string, sessionId: string) {
    const session = await this.prisma.processingSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        result: true,
      },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    const response: any = {
      sessionId: session.id,
      status: session.status,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
    };

    if (session.errorMessage) {
      response.errorMessage = session.errorMessage;
    }

    if (session.result) {
      response.result = {
        ...session.result,
        url: this.storageService.getFileUrl(session.result.resultImageUrl),
      };
    }

    return response;
  }

  /**
   * Get user's outfit results
   */
  async getOutfitResults(userId: string) {
    const results = await this.prisma.outfitResult.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        modelPhoto: true,
        clothingItem: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return results.map((result) => ({
      ...result,
      url: this.storageService.getFileUrl(result.resultImageUrl),
      modelPhoto: {
        ...result.modelPhoto,
        url: this.storageService.getFileUrl(result.modelPhoto.imageUrl),
      },
      clothingItem: {
        ...result.clothingItem,
        url: this.storageService.getFileUrl(result.clothingItem.imageUrl),
      },
    }));
  }

  /**
   * Process virtual try-on (background task)
   */
  private async processVirtualTryon(
    sessionId: string,
    modelImageUrl: string,
    garmentImageUrl: string,
    seed?: number,
  ) {
    const startTime = Date.now();

    try {
      // Get full file paths
      const modelImagePath = join(process.cwd(), modelImageUrl);
      const garmentImagePath = join(process.cwd(), garmentImageUrl);

      this.logger.log(
        `Processing virtual try-on: session=${sessionId}, model=${modelImagePath}, garment=${garmentImagePath}`,
      );

      // Call Gemini API
      const result = await this.geminiService.virtualTryon({
        modelImagePath,
        garmentImagePath,
        seed,
      });

      // Generate unique filename for result
      const filename = `${randomUUID()}.png`;

      // Save result image
      const resultPath = await this.storageService.saveFile(
        result.imageBuffer,
        'results',
        filename,
      );

      // Get session to access userId and other info
      const session = await this.prisma.processingSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const processingDuration = Date.now() - startTime;

      // Create outfit result record
      const outfitResult = await this.prisma.outfitResult.create({
        data: {
          userId: session.userId,
          modelPhotoId: session.modelPhotoId,
          clothingItemId: session.clothingItemId,
          resultImageUrl: resultPath,
          fileSize: result.imageBuffer.length,
          mimeType: result.mimeType,
          width: 0, // TODO: Get actual dimensions from image
          height: 0,
          processingDuration,
          creditsUsed: this.CREDITS_PER_TRYON,
        },
      });

      // Update session status
      await this.prisma.processingSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          resultId: outfitResult.id,
        },
      });

      this.logger.log(
        `Virtual try-on completed: session=${sessionId}, result=${outfitResult.id}, duration=${processingDuration}ms`,
      );
    } catch (error) {
      this.logger.error(`Virtual try-on failed: session=${sessionId}`, error);

      // Get session to refund credits
      const session = await this.prisma.processingSession.findUnique({
        where: { id: sessionId },
      });

      if (session) {
        try {
          // Refund credits on failure
          const refundTransaction = await this.creditService.refundCredits(
            session.userId,
            this.CREDITS_PER_TRYON,
            sessionId,
            `Refund for failed processing: ${error.message}`,
          );

          // Update session with refund transaction ID and error status
          await this.prisma.processingSession.update({
            where: { id: sessionId },
            data: {
              status: 'failed',
              completedAt: new Date(),
              errorMessage: error.message || 'Unknown error',
              creditRefundTransactionId: refundTransaction.id,
            },
          });

          this.logger.log(
            `Credits refunded for failed session: session=${sessionId}, credits=${this.CREDITS_PER_TRYON}`,
          );
        } catch (refundError) {
          this.logger.error(
            `Failed to refund credits: session=${sessionId}`,
            refundError,
          );

          // Still update session status even if refund fails
          await this.prisma.processingSession.update({
            where: { id: sessionId },
            data: {
              status: 'failed',
              completedAt: new Date(),
              errorMessage: error.message || 'Unknown error',
            },
          });
        }
      }

      throw error;
    }
  }

  /**
   * Delete clothing item (soft delete)
   */
  async deleteClothingItem(userId: string, clothingItemId: string) {
    const clothingItem = await this.prisma.clothingItem.findFirst({
      where: {
        id: clothingItemId,
        userId,
        deletedAt: null,
      },
    });

    if (!clothingItem) {
      throw new BadRequestException('Clothing item not found');
    }

    await this.prisma.clothingItem.update({
      where: { id: clothingItemId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      id: clothingItemId,
      message: 'Clothing item deleted successfully',
    };
  }

  /**
   * Delete model photo (soft delete)
   */
  async deleteModelPhoto(userId: string, modelPhotoId: string) {
    const modelPhoto = await this.prisma.modelPhoto.findFirst({
      where: {
        id: modelPhotoId,
        userId,
        deletedAt: null,
      },
    });

    if (!modelPhoto) {
      throw new BadRequestException('Model photo not found');
    }

    await this.prisma.modelPhoto.update({
      where: { id: modelPhotoId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      id: modelPhotoId,
      message: 'Model photo deleted successfully',
    };
  }

  /**
   * Validate uploaded file
   */
  private async validateFile(buffer: Buffer): Promise<void> {
    // Check file size
    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds 10MB limit. Uploaded: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Check MIME type using magic number
    const fileType = await import('file-type');
    const type = await fileType.fromBuffer(buffer);
    if (!type || !this.ALLOWED_MIME_TYPES.includes(type.mime)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: JPEG, PNG, WebP. Detected: ${type?.mime || 'unknown'}`,
      );
    }
  }
}

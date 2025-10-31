import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from './storage/storage.service';
import { GeminiService } from './gemini/gemini.service';
import { CreditService } from '../credit/credit.service';
import { randomUUID } from 'crypto';

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

    // Save file using configured storage provider
    const storageUrl = await this.storageService.saveFile(
      file.buffer,
      'models',
      filename,
    );

    // Determine storage type and keys
    const storageType = this.storageService.getStorageType();
    const isTos = storageType === 'tos';

    // Create database record with storage information
    const modelPhoto = await this.prisma.modelPhoto.create({
      data: {
        userId,
        imageUrl: isTos ? `models/${filename}` : storageUrl,
        originalFileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: width || 0,
        height: height || 0,
        storageType,
        tosKey: isTos ? `models/${filename}` : null,
        cdnUrl: isTos ? storageUrl : null,
      },
    });

    this.logger.log(`Model photo uploaded: ${modelPhoto.id}`);

    // Add file URL to response (use CDN URL if available, otherwise construct from imageUrl)
    const displayUrl = modelPhoto.cdnUrl || this.storageService.getFileUrl(modelPhoto.imageUrl);

    return {
      ...modelPhoto,
      url: displayUrl,
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

    // Add file URLs (use CDN URL if available, otherwise construct from imageUrl)
    return photos.map((photo) => ({
      ...photo,
      url: photo.cdnUrl || this.storageService.getFileUrl(photo.imageUrl),
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

    // Save file using configured storage provider
    const storageUrl = await this.storageService.saveFile(
      file.buffer,
      'clothing',
      filename,
    );

    // Determine storage type and keys
    const storageType = this.storageService.getStorageType();
    const isTos = storageType === 'tos';

    // Create database record with storage information
    const clothingItem = await this.prisma.clothingItem.create({
      data: {
        userId,
        imageUrl: isTos ? `clothing/${filename}` : storageUrl,
        originalFileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: width || 0,
        height: height || 0,
        storageType,
        tosKey: isTos ? `clothing/${filename}` : null,
        cdnUrl: isTos ? storageUrl : null,
      },
    });

    this.logger.log(`Clothing item uploaded: ${clothingItem.id}`);

    // Add file URL to response (use CDN URL if available, otherwise construct from imageUrl)
    const displayUrl = clothingItem.cdnUrl || this.storageService.getFileUrl(clothingItem.imageUrl);

    return {
      ...clothingItem,
      url: displayUrl,
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

    // Add file URLs (use CDN URL if available, otherwise construct from imageUrl)
    return items.map((item) => ({
      ...item,
      url: item.cdnUrl || this.storageService.getFileUrl(item.imageUrl),
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
    isRetry?: boolean,
    retryFromId?: string,
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
      isRetry,
      retryFromId,
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
        url: session.result.cdnUrl || this.storageService.getFileUrl(session.result.resultImageUrl),
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
      url: result.cdnUrl || this.storageService.getFileUrl(result.resultImageUrl),
      modelPhoto: {
        ...result.modelPhoto,
        url: result.modelPhoto.cdnUrl || this.storageService.getFileUrl(result.modelPhoto.imageUrl),
      },
      clothingItem: {
        ...result.clothingItem,
        url: result.clothingItem.cdnUrl || this.storageService.getFileUrl(result.clothingItem.imageUrl),
      },
    }));
  }

  /**
   * Process virtual try-on (background task)
   */
  private async processVirtualTryon(
    sessionId: string,
    modelImageKey: string,
    garmentImageKey: string,
    seed?: number,
    isRetry?: boolean,
    retryFromId?: string,
  ) {
    const startTime = Date.now();

    try {
      this.logger.log(
        `Processing virtual try-on: session=${sessionId}, model=${modelImageKey}, garment=${garmentImageKey}`,
      );

      // Get file buffers from storage (works with both local and TOS)
      const [modelImageBuffer, garmentImageBuffer] = await Promise.all([
        this.storageService.getFileBuffer(modelImageKey),
        this.storageService.getFileBuffer(garmentImageKey),
      ]);

      this.logger.log(
        `Files loaded: model size=${modelImageBuffer.length}, garment size=${garmentImageBuffer.length}`,
      );

      // Call Gemini API with buffers
      const result = await this.geminiService.virtualTryon({
        modelImageBuffer,
        garmentImageBuffer,
        seed,
      });

      // Generate unique filename for result
      const filename = `${randomUUID()}.png`;

      // Save result image using configured storage provider
      const storageUrl = await this.storageService.saveFile(
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

      // Determine storage type and keys
      const storageType = this.storageService.getStorageType();
      const isTos = storageType === 'tos';

      // Create outfit result record with storage information
      const outfitResult = await this.prisma.outfitResult.create({
        data: {
          userId: session.userId,
          modelPhotoId: session.modelPhotoId,
          clothingItemId: session.clothingItemId,
          resultImageUrl: isTos ? `results/${filename}` : storageUrl,
          fileSize: result.imageBuffer.length,
          mimeType: result.mimeType,
          width: 0, // TODO: Get actual dimensions from image
          height: 0,
          processingDuration,
          creditsUsed: this.CREDITS_PER_TRYON,
          isRetry: isRetry || false,
          retryFromId: retryFromId || null,
          storageType,
          tosKey: isTos ? `results/${filename}` : null,
          cdnUrl: isTos ? storageUrl : null,
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
   * Replace model photo with a new one
   */
  async replaceModelPhoto(
    userId: string,
    modelPhotoId: string,
    file: Express.Multer.File,
    width?: number,
    height?: number,
  ) {
    // Find the existing model photo
    const existingPhoto = await this.prisma.modelPhoto.findFirst({
      where: {
        id: modelPhotoId,
        userId,
        deletedAt: null,
      },
    });

    if (!existingPhoto) {
      throw new BadRequestException('Model photo not found');
    }

    // Validate new file
    await this.validateFile(file.buffer);

    // Check if the old photo is referenced by any history records
    const historyCount = await this.prisma.outfitResult.count({
      where: {
        modelPhotoId: modelPhotoId,
        deletedAt: null,
      },
    });

    const isReferenced = historyCount > 0;

    this.logger.log(
      `Replacing model photo ${modelPhotoId}, isReferenced: ${isReferenced}, historyCount: ${historyCount}`,
    );

    // Generate unique filename for new photo
    const fileExtension = file.mimetype.split('/')[1];
    const filename = `${randomUUID()}.${fileExtension}`;

    // Save new file to local storage
    const newFilePath = await this.storageService.saveFile(
      file.buffer,
      'models',
      filename,
    );

    // Prepare replacement history entry
    const replacementEntry = {
      timestamp: new Date().toISOString(),
      oldImageUrl: existingPhoto.imageUrl,
      oldVersion: existingPhoto.version,
      reason: 'User replacement',
    };

    const existingHistory = (existingPhoto.replacementHistory as any[]) || [];
    const updatedHistory = [...existingHistory, replacementEntry];

    let result;

    if (isReferenced) {
      // If referenced by history, archive old record and create new one
      this.logger.log(
        `Old photo is referenced, archiving old record and creating new one`,
      );

      result = await this.prisma.$transaction(async (tx) => {
        // Archive old photo
        await tx.modelPhoto.update({
          where: { id: modelPhotoId },
          data: {
            isArchived: true,
          },
        });

        // Create new photo record
        const newPhoto = await tx.modelPhoto.create({
          data: {
            userId,
            imageUrl: newFilePath,
            originalFileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            width: width || 0,
            height: height || 0,
            version: existingPhoto.version + 1,
            replacementHistory: updatedHistory,
          },
        });

        return newPhoto;
      });

      this.logger.log(
        `Old photo archived, new photo created: ${result.id}, old file preserved`,
      );
    } else {
      // If not referenced, delete old file and update record
      this.logger.log(
        `Old photo not referenced, deleting old file and updating record`,
      );

      result = await this.prisma.$transaction(async (tx) => {
        // Delete old file
        try {
          await this.storageService.deleteFile(existingPhoto.imageUrl);
          this.logger.log(`Old file deleted: ${existingPhoto.imageUrl}`);
        } catch (error) {
          this.logger.warn(
            `Failed to delete old file: ${existingPhoto.imageUrl}`,
            error,
          );
          // Continue even if file deletion fails
        }

        // Update record with new file
        const updatedPhoto = await tx.modelPhoto.update({
          where: { id: modelPhotoId },
          data: {
            imageUrl: newFilePath,
            originalFileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            width: width || 0,
            height: height || 0,
            version: existingPhoto.version + 1,
            replacementHistory: updatedHistory,
          },
        });

        return updatedPhoto;
      });

      this.logger.log(
        `Model photo updated: ${result.id}, old file deleted`,
      );
    }

    // Add file URL to response
    return {
      ...result,
      url: this.storageService.getFileUrl(result.imageUrl),
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

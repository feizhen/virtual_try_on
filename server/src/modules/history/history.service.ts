import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { StorageService } from '@/modules/outfit-change/storage/storage.service';
import { OutfitChangeService } from '@/modules/outfit-change/outfit-change.service';
import {
  HistoryListResponseDto,
  HistoryDetailResponseDto,
  HistoryItemDto,
  DeleteHistoryResponseDto,
} from './dto/history-response.dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => OutfitChangeService))
    private readonly outfitChangeService: OutfitChangeService,
  ) {}

  /**
   * Get paginated history of outfit results
   * Uses cursor-based pagination for efficient querying
   */
  async getHistory(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<HistoryListResponseDto> {
    // Validate limit
    const validLimit = Math.min(Math.max(limit, 1), 50);

    // Build query options
    const queryOptions: any = {
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
      take: validLimit + 1, // Fetch one extra to determine if there are more items
    };

    // Add cursor if provided
    if (cursor) {
      queryOptions.cursor = {
        id: cursor,
      };
      queryOptions.skip = 1; // Skip the cursor item itself
    }

    // Execute query
    const results = await this.prisma.outfitResult.findMany(queryOptions);

    // Determine if there are more items
    const hasMore = results.length > validLimit;
    const items = hasMore ? results.slice(0, validLimit) : results;

    // Get next cursor
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Get total count
    const total = await this.prisma.outfitResult.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    // Transform data
    const transformedItems: HistoryItemDto[] = items.map((item) =>
      this.transformHistoryItem(item),
    );

    this.logger.log(
      `Retrieved ${items.length} history items for user ${userId}`,
    );

    return {
      data: transformedItems,
      total,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Get single history item detail
   */
  async getHistoryDetail(
    userId: string,
    historyId: string,
  ): Promise<HistoryDetailResponseDto> {
    const result = await this.prisma.outfitResult.findFirst({
      where: {
        id: historyId,
        userId,
        deletedAt: null,
      },
      include: {
        modelPhoto: true,
        clothingItem: true,
      },
    });

    if (!result) {
      throw new NotFoundException('History item not found');
    }

    this.logger.log(
      `Retrieved history detail: ${historyId} for user ${userId}`,
    );

    return {
      data: this.transformHistoryItem(result),
    };
  }

  /**
   * Soft delete history item
   */
  async deleteHistory(
    userId: string,
    historyId: string,
  ): Promise<DeleteHistoryResponseDto> {
    // Verify ownership and existence
    const result = await this.prisma.outfitResult.findFirst({
      where: {
        id: historyId,
        userId,
        deletedAt: null,
      },
    });

    if (!result) {
      throw new NotFoundException('History item not found');
    }

    // Soft delete
    await this.prisma.outfitResult.update({
      where: { id: historyId },
      data: {
        deletedAt: new Date(),
      },
    });

    this.logger.log(`Soft deleted history item: ${historyId} by user ${userId}`);

    return {
      id: historyId,
      message: 'History item deleted successfully',
    };
  }

  /**
   * Retry a failed or completed try-on
   * Creates a new processing session with the same model and clothing
   */
  async retryTryon(userId: string, historyId: string) {
    // Get the original history record
    const originalRecord = await this.prisma.outfitResult.findFirst({
      where: {
        id: historyId,
        userId,
        deletedAt: null,
      },
      include: {
        modelPhoto: true,
        clothingItem: true,
      },
    });

    if (!originalRecord) {
      throw new NotFoundException('History item not found');
    }

    // Check if model photo and clothing item still exist
    if (originalRecord.modelPhoto.deletedAt) {
      throw new BadRequestException(
        'Cannot retry: original model photo no longer exists',
      );
    }

    if (originalRecord.clothingItem.deletedAt) {
      throw new BadRequestException(
        'Cannot retry: original clothing item no longer exists',
      );
    }

    this.logger.log(
      `Retrying try-on: original=${historyId}, user=${userId}, model=${originalRecord.modelPhotoId}, clothing=${originalRecord.clothingItemId}`,
    );

    // Start new virtual try-on with same model and clothing
    // Pass isRetry=true and retryFromId to mark this as a retry
    const result = await this.outfitChangeService.startVirtualTryon(
      userId,
      originalRecord.modelPhotoId,
      originalRecord.clothingItemId,
      undefined, // seed - let it be random for retry
      true, // isRetry
      historyId, // retryFromId
    );

    this.logger.log(
      `Retry initiated: session=${result.sessionId}, original=${historyId}`,
    );

    return result;
  }

  /**
   * Transform database result to DTO
   */
  private transformHistoryItem(item: any): HistoryItemDto {
    return {
      ...item,
      url: this.storageService.getFileUrl(item.resultImageUrl),
      modelPhoto: {
        ...item.modelPhoto,
        url: this.storageService.getFileUrl(item.modelPhoto.imageUrl),
      },
      clothingItem: {
        ...item.clothingItem,
        url: this.storageService.getFileUrl(item.clothingItem.imageUrl),
      },
    };
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ModelPhotoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  originalFileName: string;
}

class ClothingItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  originalFileName: string;
}

export class HistoryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  modelPhotoId: string;

  @ApiProperty()
  clothingItemId: string;

  @ApiProperty()
  resultImageUrl: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  processingDuration: number;

  @ApiProperty()
  creditsUsed: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  modelPhoto: ModelPhotoDto;

  @ApiProperty()
  clothingItem: ClothingItemDto;
}

export class HistoryListResponseDto {
  @ApiProperty({ type: [HistoryItemDto] })
  data: HistoryItemDto[];

  @ApiProperty()
  total: number;

  @ApiPropertyOptional({
    description: 'Cursor for the next page (null if no more items)',
  })
  nextCursor: string | null;

  @ApiProperty()
  hasMore: boolean;
}

export class HistoryDetailResponseDto {
  @ApiProperty()
  data: HistoryItemDto;
}

export class DeleteHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  message: string;
}

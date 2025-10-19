import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class StartVirtualTryonDto {
  @IsString()
  modelPhotoId: string;

  @IsString()
  clothingItemId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  seed?: number;
}

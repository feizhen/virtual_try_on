import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UploadClothingDto {
  @IsOptional()
  @IsString()
  originalFileName?: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;
}

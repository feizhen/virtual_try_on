import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class UploadModelDto {
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

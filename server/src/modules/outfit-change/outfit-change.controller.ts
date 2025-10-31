import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
  Logger,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OutfitChangeService } from './outfit-change.service';
import { UploadModelDto } from './dto/upload-model.dto';
import { UploadClothingDto } from './dto/upload-clothing.dto';
import { StartVirtualTryonDto } from './dto/start-virtual-tryon.dto';

@Controller('outfit-change')
@UseGuards(JwtAuthGuard)
export class OutfitChangeController {
  private readonly logger = new Logger(OutfitChangeController.name);

  constructor(private outfitChangeService: OutfitChangeService) {}

  /**
   * Upload model photo
   * POST /api/outfit-change/models/upload
   */
  @Post('models/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadModel(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadModelDto,
  ) {
    const userId = req.user.sub;
    this.logger.log(`User ${userId} uploading model photo`);

    const modelPhoto = await this.outfitChangeService.uploadModelPhoto(
      userId,
      file,
      dto.width,
      dto.height,
    );

    return {
      success: true,
      data: modelPhoto,
    };
  }

  /**
   * Get user's model photos
   * GET /api/outfit-change/models
   */
  @Get('models')
  async getModels(@Request() req: any) {
    const userId = req.user.sub;
    const photos = await this.outfitChangeService.getModelPhotos(userId);

    return {
      success: true,
      data: photos,
      total: photos.length,
    };
  }

  /**
   * Upload clothing item photo
   * POST /api/outfit-change/clothing/upload
   */
  @Post('clothing/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadClothing(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadClothingDto,
  ) {
    const userId = req.user.sub;
    this.logger.log(`User ${userId} uploading clothing item`);

    const clothingItem = await this.outfitChangeService.uploadClothingItem(
      userId,
      file,
      dto.width,
      dto.height,
    );

    return {
      success: true,
      data: clothingItem,
    };
  }

  /**
   * Get user's clothing items
   * GET /api/outfit-change/clothing
   */
  @Get('clothing')
  async getClothing(@Request() req: any) {
    const userId = req.user.sub;
    const items = await this.outfitChangeService.getClothingItems(userId);

    return {
      success: true,
      data: items,
      total: items.length,
    };
  }

  /**
   * Start virtual try-on
   * POST /api/outfit-change/tryon
   */
  @Post('tryon')
  async startTryon(@Request() req: any, @Body() dto: StartVirtualTryonDto) {
    const userId = req.user.sub;
    this.logger.log(
      `User ${userId} starting virtual try-on: model=${dto.modelPhotoId}, clothing=${dto.clothingItemId}`,
    );

    const result = await this.outfitChangeService.startVirtualTryon(
      userId,
      dto.modelPhotoId,
      dto.clothingItemId,
      dto.seed,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get processing session status
   * GET /api/outfit-change/sessions/:sessionId
   */
  @Get('sessions/:sessionId')
  async getSessionStatus(@Request() req: any, @Param('sessionId') sessionId: string) {
    const userId = req.user.sub;
    const status = await this.outfitChangeService.getSessionStatus(userId, sessionId);

    return {
      success: true,
      data: status,
    };
  }

  /**
   * Get user's outfit results
   * GET /api/outfit-change/results
   */
  @Get('results')
  async getResults(@Request() req: any) {
    const userId = req.user.sub;
    const results = await this.outfitChangeService.getOutfitResults(userId);

    return {
      success: true,
      data: results,
      total: results.length,
    };
  }

  /**
   * Delete clothing item
   * DELETE /api/outfit-change/clothing/:id
   */
  @Delete('clothing/:id')
  async deleteClothing(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    this.logger.log(`User ${userId} deleting clothing item ${id}`);

    const result = await this.outfitChangeService.deleteClothingItem(userId, id);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Delete model photo
   * DELETE /api/outfit-change/models/:id
   */
  @Delete('models/:id')
  async deleteModel(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    this.logger.log(`User ${userId} deleting model photo ${id}`);

    const result = await this.outfitChangeService.deleteModelPhoto(userId, id);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Replace model photo with a new one
   * PUT /api/outfit-change/models/:id/replace
   */
  @Put('models/:id/replace')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async replaceModel(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadModelDto,
  ) {
    const userId = req.user.sub;
    this.logger.log(`User ${userId} replacing model photo ${id}`);

    const modelPhoto = await this.outfitChangeService.replaceModelPhoto(
      userId,
      id,
      file,
      dto.width,
      dto.height,
    );

    return {
      success: true,
      data: modelPhoto,
    };
  }
}

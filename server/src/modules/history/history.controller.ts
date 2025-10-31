import {
  Controller,
  Get,
  Delete,
  Post,
  Query,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtPayload } from '@/common/decorators/current-user.decorator';
import { HistoryQueryDto } from './dto/history-query.dto';
import {
  HistoryListResponseDto,
  HistoryDetailResponseDto,
  DeleteHistoryResponseDto,
} from './dto/history-response.dto';

@ApiTags('History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  private readonly logger = new Logger(HistoryController.name);

  constructor(private readonly historyService: HistoryService) {}

  /**
   * Get paginated history of try-on results
   * GET /api/history
   */
  @Get()
  @ApiOperation({ summary: 'Get user try-on history with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated history items',
    type: HistoryListResponseDto,
  })
  async getHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: HistoryQueryDto,
  ): Promise<HistoryListResponseDto> {
    this.logger.log(
      `User ${user.sub} requesting history (cursor: ${query.cursor}, limit: ${query.limit})`,
    );

    return this.historyService.getHistory(
      user.sub,
      query.cursor,
      query.limit,
    );
  }

  /**
   * Get single history item detail
   * GET /api/history/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get single history item detail' })
  @ApiParam({
    name: 'id',
    description: 'History item ID',
    example: 'cm123abc456def',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns history item detail',
    type: HistoryDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'History item not found',
  })
  async getHistoryDetail(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<HistoryDetailResponseDto> {
    this.logger.log(`User ${user.sub} requesting history detail: ${id}`);

    return this.historyService.getHistoryDetail(user.sub, id);
  }

  /**
   * Delete history item (soft delete)
   * DELETE /api/history/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete history item (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'History item ID',
    example: 'cm123abc456def',
  })
  @ApiResponse({
    status: 200,
    description: 'History item deleted successfully',
    type: DeleteHistoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'History item not found',
  })
  async deleteHistory(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<DeleteHistoryResponseDto> {
    this.logger.log(`User ${user.sub} deleting history item: ${id}`);

    return this.historyService.deleteHistory(user.sub, id);
  }

  /**
   * Retry a try-on from history
   * POST /api/history/:id/retry
   */
  @Post(':id/retry')
  @ApiOperation({
    summary: 'Retry a try-on using the same model and clothing',
  })
  @ApiParam({
    name: 'id',
    description: 'History item ID to retry',
    example: 'cm123abc456def',
  })
  @ApiResponse({
    status: 200,
    description: 'Retry initiated successfully, returns new session info',
  })
  @ApiResponse({
    status: 404,
    description: 'History item not found',
  })
  @ApiResponse({
    status: 400,
    description:
      'Cannot retry - model photo or clothing item no longer exists, or insufficient credits',
  })
  async retryTryon(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    this.logger.log(`User ${user.sub} retrying history item: ${id}`);

    return this.historyService.retryTryon(user.sub, id);
  }
}

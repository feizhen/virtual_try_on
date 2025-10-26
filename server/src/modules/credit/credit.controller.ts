import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtPayload } from '@/common/decorators/current-user.decorator';
import { CreditBalanceDto } from './dto/credit-balance.dto';
import { CreditTransactionsResponseDto } from './dto/credit-transaction.dto';

@ApiTags('Credit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get user credit balance' })
  async getBalance(@CurrentUser() user: JwtPayload): Promise<CreditBalanceDto> {
    return this.creditService.getBalance(user.sub);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get user credit transaction history' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Cursor for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  async getTransactions(
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<CreditTransactionsResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.creditService.getTransactions(user.sub, cursor, limitNum);
  }
}

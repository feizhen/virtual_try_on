import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreditTransactionDto {
  @ApiProperty({ example: 'uuid-123', description: 'Transaction ID' })
  id: string;

  @ApiProperty({ example: 'uuid-456', description: 'User ID' })
  userId: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.DEDUCT,
    description: 'Transaction type',
  })
  type: TransactionType;

  @ApiProperty({ example: -10, description: 'Transaction amount (negative for deductions)' })
  amount: number;

  @ApiProperty({ example: 100, description: 'Balance before transaction' })
  balanceBefore: number;

  @ApiProperty({ example: 90, description: 'Balance after transaction' })
  balanceAfter: number;

  @ApiProperty({
    example: 'uuid-789',
    description: 'Related session ID',
    nullable: true,
  })
  sessionId: string | null;

  @ApiProperty({
    example: 'Virtual try-on processing',
    description: 'Transaction description',
  })
  description: string;

  @ApiProperty({
    example: {},
    description: 'Additional metadata',
    nullable: true,
  })
  metadata: any;

  @ApiProperty({
    example: '2025-10-25T04:00:00.000Z',
    description: 'Transaction timestamp',
  })
  createdAt: Date;
}

export class CreditTransactionsResponseDto {
  @ApiProperty({ type: [CreditTransactionDto], description: 'List of transactions' })
  items: CreditTransactionDto[];

  @ApiProperty({
    example: 'uuid-next',
    description: 'Cursor for next page',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({ example: true, description: 'Whether there are more items' })
  hasMore: boolean;
}

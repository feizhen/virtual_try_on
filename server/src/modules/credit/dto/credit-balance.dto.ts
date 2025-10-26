import { ApiProperty } from '@nestjs/swagger';

export class CreditBalanceDto {
  @ApiProperty({ example: 100, description: 'Current credit balance' })
  creditBalance: number;

  @ApiProperty({ example: 50, description: 'Total credits spent' })
  totalCreditsSpent: number;

  @ApiProperty({ example: 150, description: 'Total credits earned' })
  totalCreditsEarned: number;

  @ApiProperty({
    example: '2025-10-25T04:00:00.000Z',
    description: 'Last update timestamp',
  })
  creditUpdatedAt: Date;
}

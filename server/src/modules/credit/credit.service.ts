import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户的 credit 余额
   */
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        creditBalance: true,
        totalCreditsSpent: true,
        totalCreditsEarned: true,
        creditUpdatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * 获取用户的 credit 交易历史
   */
  async getTransactions(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ) {
    const transactions = await this.prisma.creditTransaction.findMany({
      where: { userId },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = transactions.length > limit;
    const items = hasMore ? transactions.slice(0, -1) : transactions;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  /**
   * 扣除 credits（用于试衣服务）
   */
  async deductCredits(
    userId: string,
    amount: number,
    sessionId?: string,
    description?: string,
  ) {
    return await this.prisma.$transaction(async (tx: any) => {
      // 获取当前余额
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { creditBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.creditBalance < amount) {
        throw new Error('Insufficient credits');
      }

      const balanceBefore = user.creditBalance;
      const balanceAfter = balanceBefore - amount;

      // 更新用户余额
      await tx.user.update({
        where: { id: userId },
        data: {
          creditBalance: balanceAfter,
          totalCreditsSpent: { increment: amount },
        },
      });

      // 创建交易记录
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type: TransactionType.DEDUCT,
          amount: -amount,
          balanceBefore,
          balanceAfter,
          sessionId,
          description: description || 'Virtual try-on processing',
        },
      });

      return transaction;
    });
  }

  /**
   * 退还 credits（用于失败的试衣服务）
   */
  async refundCredits(
    userId: string,
    amount: number,
    sessionId?: string,
    description?: string,
  ) {
    return await this.prisma.$transaction(async (tx: any) => {
      // 获取当前余额
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { creditBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.creditBalance;
      const balanceAfter = balanceBefore + amount;

      // 更新用户余额
      await tx.user.update({
        where: { id: userId },
        data: {
          creditBalance: balanceAfter,
          totalCreditsSpent: { decrement: amount },
        },
      });

      // 创建交易记录
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type: TransactionType.REFUND,
          amount,
          balanceBefore,
          balanceAfter,
          sessionId,
          description: description || 'Refund for failed processing',
        },
      });

      return transaction;
    });
  }

  /**
   * 检查用户是否有足够的 credits
   */
  async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true },
    });

    return user ? user.creditBalance >= amount : false;
  }
}

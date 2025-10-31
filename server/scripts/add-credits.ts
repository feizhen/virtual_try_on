/**
 * Script to add credits to a user account
 * Usage: npx ts-node scripts/add-credits.ts <email> <amount>
 */

import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function addCredits(email: string, amount: number) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        creditBalance: true,
        totalCreditsEarned: true,
      },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n📧 Found user: ${user.name} (${user.email})`);
    console.log(`💰 Current balance: ${user.creditBalance} credits`);

    // Add credits in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const balanceBefore = user.creditBalance;
      const balanceAfter = balanceBefore + amount;

      // Create credit transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount,
          type: TransactionType.ADMIN_ADJUSTMENT,
          balanceBefore,
          balanceAfter,
          description: `Manual credit recharge via admin script`,
        },
      });

      // Update user balance and total earned
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          creditBalance: {
            increment: amount,
          },
          totalCreditsEarned: {
            increment: amount,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          creditBalance: true,
          totalCreditsEarned: true,
        },
      });

      return { transaction, updatedUser };
    });

    console.log(`\n✅ Credits added successfully!`);
    console.log(`💵 Added amount: +${amount} credits`);
    console.log(`💰 New balance: ${result.updatedUser.creditBalance} credits`);
    console.log(`📈 Total earned: ${result.updatedUser.totalCreditsEarned} credits`);
    console.log(`📝 Transaction ID: ${result.transaction.id}\n`);
  } catch (error) {
    console.error('❌ Error adding credits:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const email = process.argv[2];
const amount = parseInt(process.argv[3], 10);

if (!email || !amount || isNaN(amount) || amount <= 0) {
  console.error('Usage: npx ts-node scripts/add-credits.ts <email> <amount>');
  console.error('Example: npx ts-node scripts/add-credits.ts test@example.com 50');
  process.exit(1);
}

addCredits(email, amount);

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeCredits() {
  console.log('开始初始化用户 credits...');

  // 获取所有没有 INITIAL_GRANT 交易记录的用户
  const users = await prisma.user.findMany({
    where: {
      creditTransactions: {
        none: {
          type: 'INITIAL_GRANT',
        },
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  console.log(`找到 ${users.length} 个需要初始化的用户`);

  for (const user of users) {
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: 'INITIAL_GRANT',
        amount: 100,
        balanceBefore: 0,
        balanceAfter: 100,
        description: 'Initial credit grant for existing user',
      },
    });
    console.log(`✅ 已为用户 ${user.email} 创建初始 credit 交易记录`);
  }

  console.log('✅ 初始化完成！');
}

initializeCredits()
  .catch((error) => {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

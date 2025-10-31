import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function monitorSession(sessionId?: string) {
  try {
    // 如果没有提供 sessionId，获取最新的处理中会话
    let targetSessionId = sessionId;

    if (!targetSessionId) {
      const latestProcessing = await prisma.processingSession.findFirst({
        where: { status: 'processing' },
        orderBy: { createdAt: 'desc' },
      });

      if (!latestProcessing) {
        console.log('没有找到正在处理中的会话');
        return;
      }

      targetSessionId = latestProcessing.id;
    }

    console.log(`=== 监控会话: ${targetSessionId} ===\n`);

    // 每 3 秒检查一次
    const checkInterval = 3000;
    const maxChecks = 60; // 最多检查 60 次（3 分钟）

    for (let i = 0; i < maxChecks; i++) {
      const session = await prisma.processingSession.findUnique({
        where: { id: targetSessionId },
        include: {
          result: true,
        },
      });

      if (!session) {
        console.log('❌ 会话不存在');
        break;
      }

      const elapsed = Date.now() - new Date(session.createdAt).getTime();
      const elapsedSeconds = (elapsed / 1000).toFixed(1);

      // 清屏（可选）
      // process.stdout.write('\x1Bc');

      console.log(`[${new Date().toLocaleTimeString()}] 状态: ${session.status} | 已耗时: ${elapsedSeconds}秒`);

      if (session.status === 'completed') {
        console.log('\n✅ 处理完成！');
        if (session.result) {
          console.log(`结果图片: ${session.result.resultImageUrl}`);
          console.log(`文件大小: ${(session.result.fileSize / 1024).toFixed(2)} KB`);
          console.log(`处理耗时: ${session.result.processingDuration}ms`);
        }
        break;
      } else if (session.status === 'failed') {
        console.log('\n❌ 处理失败');
        console.log(`错误信息: ${session.errorMessage}`);
        break;
      } else {
        // 显示提示
        if (elapsed < 60000) {
          console.log('   ⏳ 预计还需要 1-3 分钟...');
        } else if (elapsed < 180000) {
          console.log('   ⏳ 正在处理中，请耐心等待...');
        } else {
          console.log('   ⚠️  处理时间较长，可能遇到问题');
        }
      }

      // 等待下一次检查
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

  } catch (error) {
    console.error('监控失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 从命令行参数获取 sessionId
const sessionId = process.argv[2];

monitorSession(sessionId).catch(console.error);

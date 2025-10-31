import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkLatestSession() {
  console.log('=== 检查最新的处理会话 ===\n');

  try {
    // 获取最新的 5 个会话
    const sessions = await prisma.processingSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        modelPhoto: {
          select: {
            id: true,
            imageUrl: true,
            storageType: true,
            originalFileName: true,
          },
        },
        clothingItem: {
          select: {
            id: true,
            imageUrl: true,
            storageType: true,
            originalFileName: true,
          },
        },
        result: {
          select: {
            id: true,
            resultImageUrl: true,
            storageType: true,
            fileSize: true,
            processingDuration: true,
          },
        },
      },
    });

    if (sessions.length === 0) {
      console.log('❌ 没有找到任何处理会话\n');
      return;
    }

    console.log(`找到 ${sessions.length} 个最新会话:\n`);

    sessions.forEach((session, index) => {
      const isLatest = index === 0;
      const prefix = isLatest ? '🔥 [最新]' : `   [${index + 1}]`;

      console.log(`${prefix} Session ID: ${session.id}`);
      console.log(`      状态: ${session.status}`);
      console.log(`      创建时间: ${session.createdAt}`);

      if (session.completedAt) {
        const duration = new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime();
        console.log(`      完成时间: ${session.completedAt}`);
        console.log(`      总耗时: ${(duration / 1000).toFixed(1)}秒`);
      } else {
        const elapsed = Date.now() - new Date(session.createdAt).getTime();
        console.log(`      进行中，已耗时: ${(elapsed / 1000).toFixed(1)}秒`);
      }

      console.log(`      模特照片: ${session.modelPhoto?.originalFileName || 'N/A'}`);
      console.log(`      模特 URL: ${session.modelPhoto?.imageUrl || 'N/A'}`);
      console.log(`      服装照片: ${session.clothingItem?.originalFileName || 'N/A'}`);
      console.log(`      服装 URL: ${session.clothingItem?.imageUrl || 'N/A'}`);

      if (session.status === 'failed') {
        console.log(`      ❌ 错误: ${session.errorMessage || '未知错误'}`);
      }

      if (session.status === 'completed' && session.result) {
        console.log(`      ✅ 结果图片: ${session.result.resultImageUrl}`);
        console.log(`      结果大小: ${(session.result.fileSize / 1024).toFixed(2)} KB`);
        if (session.result.processingDuration) {
          console.log(`      处理耗时: ${session.result.processingDuration}ms`);
        }
      }

      console.log('');
    });

    // 统计最新会话
    const latest = sessions[0];
    console.log('=== 最新会话分析 ===\n');

    if (latest.status === 'processing') {
      const elapsed = Date.now() - new Date(latest.createdAt).getTime();
      console.log(`⏳ 当前正在处理中...`);
      console.log(`   已运行: ${(elapsed / 1000).toFixed(1)}秒`);
      console.log(`   预计还需要: 1-3 分钟`);
      console.log('\n💡 建议:');
      console.log('   1. 继续等待几分钟');
      console.log('   2. 查看后端日志了解进度');
      console.log('   3. 如果超过 5 分钟仍未完成，可能需要重试');
    } else if (latest.status === 'completed') {
      console.log(`✅ 最新会话已成功完成！`);
      if (latest.result) {
        console.log(`   结果文件: ${latest.result.resultImageUrl}`);
        console.log(`   文件大小: ${(latest.result.fileSize / 1024).toFixed(2)} KB`);
      }
    } else if (latest.status === 'failed') {
      console.log(`❌ 最新会话失败`);
      console.log(`   错误信息: ${latest.errorMessage || '未知错误'}`);
      console.log('\n💡 可能的原因:');

      if (latest.errorMessage?.includes('ETIMEDOUT')) {
        console.log('   - 网络连接超时（从 TOS 下载文件失败）');
        console.log('   - 建议: 重试，或者检查网络连接');
      } else if (latest.errorMessage?.includes('aborted')) {
        console.log('   - 请求被中断（可能是超时）');
        console.log('   - Gemini API 调用时间过长');
      } else if (latest.errorMessage?.includes('ENOENT')) {
        console.log('   - 文件不存在（已经修复的旧问题）');
        console.log('   - 如果是新会话出现此错误，请联系开发者');
      } else {
        console.log('   - 未知错误');
        console.log('   - 建议查看详细日志');
      }
    }

    // 成功率统计
    console.log('\n=== 成功率统计 ===\n');
    const totalCount = await prisma.processingSession.count();
    const completedCount = await prisma.processingSession.count({ where: { status: 'completed' } });
    const failedCount = await prisma.processingSession.count({ where: { status: 'failed' } });
    const processingCount = await prisma.processingSession.count({ where: { status: 'processing' } });

    console.log(`总会话数: ${totalCount}`);
    console.log(`成功: ${completedCount} (${((completedCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`失败: ${failedCount} (${((failedCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`处理中: ${processingCount}`);

    if (completedCount > 0) {
      // 计算平均处理时间
      const completedSessions = await prisma.processingSession.findMany({
        where: { status: 'completed', completedAt: { not: null } },
        select: { createdAt: true, completedAt: true },
      });

      const durations = completedSessions.map(s =>
        new Date(s.completedAt!).getTime() - new Date(s.createdAt).getTime()
      );

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

      console.log(`平均处理时间: ${(avgDuration / 1000).toFixed(1)}秒`);
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestSession().catch(console.error);

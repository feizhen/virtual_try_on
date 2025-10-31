import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('=== 检查数据库数据 ===\n');

  try {
    // 1. 检查最近的模特照片
    console.log('1️⃣  最近上传的模特照片:');
    const modelPhotos = await prisma.modelPhoto.findMany({
      where: { deletedAt: null },
      orderBy: { uploadedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        imageUrl: true,
        storageType: true,
        tosKey: true,
        cdnUrl: true,
        originalFileName: true,
        uploadedAt: true,
      },
    });

    if (modelPhotos.length === 0) {
      console.log('   ❌ 没有找到模特照片');
    } else {
      modelPhotos.forEach((photo, index) => {
        console.log(`\n   [${index + 1}] ID: ${photo.id}`);
        console.log(`      文件名: ${photo.originalFileName}`);
        console.log(`      imageUrl: ${photo.imageUrl}`);
        console.log(`      storageType: ${photo.storageType}`);
        console.log(`      tosKey: ${photo.tosKey || 'null'}`);
        console.log(`      cdnUrl: ${photo.cdnUrl ? photo.cdnUrl.substring(0, 100) + '...' : 'null'}`);
        console.log(`      上传时间: ${photo.uploadedAt}`);

        // 分析格式
        if (photo.storageType === 'tos') {
          if (photo.imageUrl.startsWith('http')) {
            console.log(`      ⚠️  警告: imageUrl 是完整 URL，应该是 TOS key`);
          } else if (photo.imageUrl.startsWith('models/') || photo.imageUrl.startsWith('clothing/')) {
            console.log(`      ✅ imageUrl 格式正确（TOS key）`);
          } else {
            console.log(`      ❌ imageUrl 格式可能不正确`);
          }
        }
      });
    }

    // 2. 检查最近的服装照片
    console.log('\n\n2️⃣  最近上传的服装照片:');
    const clothingItems = await prisma.clothingItem.findMany({
      where: { deletedAt: null },
      orderBy: { uploadedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        imageUrl: true,
        storageType: true,
        tosKey: true,
        cdnUrl: true,
        originalFileName: true,
        uploadedAt: true,
      },
    });

    if (clothingItems.length === 0) {
      console.log('   ❌ 没有找到服装照片');
    } else {
      clothingItems.forEach((item, index) => {
        console.log(`\n   [${index + 1}] ID: ${item.id}`);
        console.log(`      文件名: ${item.originalFileName}`);
        console.log(`      imageUrl: ${item.imageUrl}`);
        console.log(`      storageType: ${item.storageType}`);
        console.log(`      tosKey: ${item.tosKey || 'null'}`);
        console.log(`      cdnUrl: ${item.cdnUrl ? item.cdnUrl.substring(0, 100) + '...' : 'null'}`);
        console.log(`      上传时间: ${item.uploadedAt}`);

        // 分析格式
        if (item.storageType === 'tos') {
          if (item.imageUrl.startsWith('http')) {
            console.log(`      ⚠️  警告: imageUrl 是完整 URL，应该是 TOS key`);
          } else if (item.imageUrl.startsWith('models/') || item.imageUrl.startsWith('clothing/')) {
            console.log(`      ✅ imageUrl 格式正确（TOS key）`);
          } else {
            console.log(`      ❌ imageUrl 格式可能不正确`);
          }
        }
      });
    }

    // 3. 检查最近的处理会话
    console.log('\n\n3️⃣  最近的处理会话:');
    const sessions = await prisma.processingSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        modelPhoto: {
          select: { imageUrl: true, storageType: true },
        },
        clothingItem: {
          select: { imageUrl: true, storageType: true },
        },
        result: {
          select: { resultImageUrl: true, storageType: true },
        },
      },
    });

    if (sessions.length === 0) {
      console.log('   ❌ 没有找到处理会话');
    } else {
      sessions.forEach((session, index) => {
        console.log(`\n   [${index + 1}] Session ID: ${session.id}`);
        console.log(`      状态: ${session.status}`);
        console.log(`      创建时间: ${session.createdAt}`);
        console.log(`      完成时间: ${session.completedAt || '未完成'}`);
        console.log(`      模特照片 URL: ${session.modelPhoto?.imageUrl || 'N/A'}`);
        console.log(`      服装照片 URL: ${session.clothingItem?.imageUrl || 'N/A'}`);

        if (session.status === 'failed' && session.errorMessage) {
          console.log(`      ❌ 错误信息: ${session.errorMessage}`);
        }

        if (session.result) {
          console.log(`      ✅ 结果图片 URL: ${session.result.resultImageUrl}`);
        }
      });
    }

    // 4. 统计信息
    console.log('\n\n4️⃣  统计信息:');
    const [modelCount, clothingCount, sessionCount] = await Promise.all([
      prisma.modelPhoto.count({ where: { deletedAt: null } }),
      prisma.clothingItem.count({ where: { deletedAt: null } }),
      prisma.processingSession.count(),
    ]);

    const [processingCount, completedCount, failedCount] = await Promise.all([
      prisma.processingSession.count({ where: { status: 'processing' } }),
      prisma.processingSession.count({ where: { status: 'completed' } }),
      prisma.processingSession.count({ where: { status: 'failed' } }),
    ]);

    console.log(`   模特照片总数: ${modelCount}`);
    console.log(`   服装照片总数: ${clothingCount}`);
    console.log(`   处理会话总数: ${sessionCount}`);
    console.log(`   - 处理中: ${processingCount}`);
    console.log(`   - 已完成: ${completedCount}`);
    console.log(`   - 已失败: ${failedCount}`);

    console.log('\n✅ 数据库检查完成\n');

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(console.error);

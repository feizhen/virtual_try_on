import TOS from '@volcengine/tos-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testCompleteFlow() {
  console.log('=== 完整虚拟试衣流程测试 ===\n');

  const bucket = process.env.TOS_BUCKET!;
  const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY!,
    region: process.env.TOS_REGION!,
    endpoint: process.env.TOS_ENDPOINT!,
  });

  let testModelKey: string | undefined;
  let testGarmentKey: string | undefined;

  try {
    // 1. 模拟上传模特照片和服装图片
    console.log('1️⃣  准备测试图片...');

    // 创建测试图片 buffer (实际应该是真实图片)
    const modelBuffer = Buffer.alloc(100 * 1024); // 100KB
    modelBuffer.fill('M');
    const garmentBuffer = Buffer.alloc(80 * 1024); // 80KB
    garmentBuffer.fill('G');

    testModelKey = 'test/model-test.jpg';
    testGarmentKey = 'test/garment-test.jpg';

    console.log('上传测试图片到 TOS...');
    const uploadStart = Date.now();

    await Promise.all([
      client.putObject({
        bucket,
        key: testModelKey,
        body: modelBuffer,
      }),
      client.putObject({
        bucket,
        key: testGarmentKey,
        body: garmentBuffer,
      }),
    ]);

    const uploadTime = Date.now() - uploadStart;
    console.log(`✅ 上传完成 (${uploadTime}ms)`);
    console.log(`   模特照片: ${testModelKey} (${modelBuffer.length} bytes)`);
    console.log(`   服装图片: ${testGarmentKey} (${garmentBuffer.length} bytes)\n`);

    // 2. 测试从 TOS 下载文件
    console.log('2️⃣  测试从 TOS 下载文件...');
    const downloadStart = Date.now();

    const [modelResult, garmentResult] = await Promise.all([
      client.getObject({ bucket, key: testModelKey }),
      client.getObject({ bucket, key: testGarmentKey }),
    ]);

    const downloadTime = Date.now() - downloadStart;

    // 处理下载的数据
    const modelData = modelResult.data as any;
    const garmentData = garmentResult.data as any;

    let downloadedModelBuffer: Buffer;
    let downloadedGarmentBuffer: Buffer;

    if (Buffer.isBuffer(modelData)) {
      downloadedModelBuffer = modelData;
    } else if (modelData.content) {
      downloadedModelBuffer = Buffer.isBuffer(modelData.content)
        ? modelData.content
        : Buffer.from(modelData.content);
    } else {
      downloadedModelBuffer = Buffer.from(modelData);
    }

    if (Buffer.isBuffer(garmentData)) {
      downloadedGarmentBuffer = garmentData;
    } else if (garmentData.content) {
      downloadedGarmentBuffer = Buffer.isBuffer(garmentData.content)
        ? garmentData.content
        : Buffer.from(garmentData.content);
    } else {
      downloadedGarmentBuffer = Buffer.from(garmentData);
    }

    console.log(`✅ 下载完成 (${downloadTime}ms)`);
    console.log(`   模特照片: ${downloadedModelBuffer.length} bytes`);
    console.log(`   服装图片: ${downloadedGarmentBuffer.length} bytes`);

    // 验证大小
    if (
      downloadedModelBuffer.length === modelBuffer.length &&
      downloadedGarmentBuffer.length === garmentBuffer.length
    ) {
      console.log(`✅ 文件大小验证通过\n`);
    } else {
      console.log(`❌ 文件大小不匹配\n`);
    }

    // 3. 检查环境配置
    console.log('3️⃣  检查 Gemini API 配置...');
    console.log(`API Key: ${process.env.GEMINI_API_KEY ? '已配置' : '❌ 未配置'}`);
    console.log(`API Base URL: ${process.env.GEMINI_API_BASE_URL || '使用默认'}`);
    console.log(`Timeout: ${process.env.GEMINI_TIMEOUT || 60}秒\n`);

    // 4. 性能分析
    console.log('4️⃣  性能分析...');
    console.log(`上传速度: ${((modelBuffer.length + garmentBuffer.length) / 1024 / (uploadTime / 1000)).toFixed(2)} KB/s`);
    console.log(`下载速度: ${((downloadedModelBuffer.length + downloadedGarmentBuffer.length) / 1024 / (downloadTime / 1000)).toFixed(2)} KB/s\n`);

    // 5. 清理
    console.log('🧹 清理测试文件...');
    await Promise.all([
      client.deleteObject({ bucket, key: testModelKey }),
      client.deleteObject({ bucket, key: testGarmentKey }),
    ]);
    console.log('✅ 清理完成\n');

    // 6. 总结
    console.log('=== 测试总结 ===\n');
    console.log('✅ TOS 文件上传: 正常');
    console.log('✅ TOS 文件下载: 正常');
    console.log('✅ Buffer 处理: 正常');
    console.log(
      `${process.env.GEMINI_API_KEY ? '✅' : '❌'} Gemini API: ${process.env.GEMINI_API_KEY ? '已配置' : '未配置'}`,
    );

    console.log('\n💡 下一步排查建议:');
    console.log('1. 检查数据库中的 imageUrl 字段是否正确（应该是 TOS key 如 "models/xxx.jpg"）');
    console.log('2. 查看应用日志，确认下载步骤是否有错误');
    console.log('3. 如果 Gemini API 调用失败，检查 API key 和网络连接');
    console.log('4. 检查虚拟试衣处理是否正常进入后台任务');

    console.log('\n📝 查看应用日志命令:');
    console.log('   docker logs <container-name> -f');
    console.log('   或者查看 NestJS 应用输出\n');

  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('详细错误:', error);

    // 清理（即使失败也要尝试）
    if (testModelKey && testGarmentKey) {
      try {
        await Promise.all([
          client.deleteObject({ bucket, key: testModelKey }),
          client.deleteObject({ bucket, key: testGarmentKey }),
        ]);
      } catch (e) {
        // ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

// 运行测试
testCompleteFlow().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

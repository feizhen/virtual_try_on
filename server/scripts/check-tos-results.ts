import TOS from '@volcengine/tos-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkTosResults() {
  console.log('=== 检查 TOS 中的结果文件 ===\n');

  const bucket = process.env.TOS_BUCKET!;
  const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY!,
    region: process.env.TOS_REGION!,
    endpoint: process.env.TOS_ENDPOINT!,
  });

  try {
    // 1. 列出 results 目录中的所有文件
    console.log('1️⃣  检查 results/ 目录...');
    const resultsListing = await client.listObjects({
      bucket,
      prefix: 'results/',
      maxKeys: 100,
    });

    const resultFiles = resultsListing.data.Contents || [];
    console.log(`找到 ${resultFiles.length} 个结果文件:\n`);

    if (resultFiles.length === 0) {
      console.log('   ❌ results/ 目录为空，没有成功生成的图片\n');
    } else {
      resultFiles.forEach((file, index) => {
        console.log(`   [${index + 1}] ${file.Key}`);
        console.log(`      大小: ${(file.Size / 1024).toFixed(2)} KB`);
        console.log(`      最后修改: ${file.LastModified}`);
        console.log('');
      });
    }

    // 2. 列出 models 目录
    console.log('2️⃣  检查 models/ 目录...');
    const modelsListing = await client.listObjects({
      bucket,
      prefix: 'models/',
      maxKeys: 10,
    });

    const modelFiles = modelsListing.data.Contents || [];
    console.log(`找到 ${modelFiles.length} 个模特照片\n`);

    // 3. 列出 clothing 目录
    console.log('3️⃣  检查 clothing/ 目录...');
    const clothingListing = await client.listObjects({
      bucket,
      prefix: 'clothing/',
      maxKeys: 10,
    });

    const clothingFiles = clothingListing.data.Contents || [];
    console.log(`找到 ${clothingFiles.length} 个服装照片\n`);

    // 4. 尝试下载最新的结果文件
    if (resultFiles.length > 0) {
      const latestResult = resultFiles[resultFiles.length - 1];
      console.log('4️⃣  尝试下载最新的结果文件...');
      console.log(`   文件: ${latestResult.Key}`);
      console.log(`   大小: ${(latestResult.Size / 1024).toFixed(2)} KB\n`);

      try {
        const downloadStart = Date.now();
        const result = await client.getObject({
          bucket,
          key: latestResult.Key,
        });

        const data = result.data as any;
        let buffer: Buffer;

        if (Buffer.isBuffer(data)) {
          buffer = data;
        } else if (data.content) {
          buffer = Buffer.isBuffer(data.content) ? data.content : Buffer.from(data.content);
        } else {
          buffer = Buffer.from(data);
        }

        const downloadTime = Date.now() - downloadStart;

        console.log(`   ✅ 下载成功！`);
        console.log(`      实际大小: ${(buffer.length / 1024).toFixed(2)} KB`);
        console.log(`      下载时间: ${downloadTime}ms`);
        console.log(`      下载速度: ${((buffer.length / 1024) / (downloadTime / 1000)).toFixed(2)} KB/s\n`);

        // 检查是否是有效的图片文件
        const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
        const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;

        if (isPNG) {
          console.log('   ✅ 文件格式: PNG (有效图片文件)');
        } else if (isJPEG) {
          console.log('   ✅ 文件格式: JPEG (有效图片文件)');
        } else {
          console.log(`   ⚠️  文件格式未知，前几个字节: ${buffer.slice(0, 10).toString('hex')}`);
        }

      } catch (error: any) {
        console.log(`   ❌ 下载失败: ${error.message}`);
      }
    }

    // 5. 总结
    console.log('\n=== 总结 ===\n');
    console.log(`TOS Bucket: ${bucket}`);
    console.log(`模特照片: ${modelFiles.length} 个`);
    console.log(`服装照片: ${clothingFiles.length} 个`);
    console.log(`结果图片: ${resultFiles.length} 个`);
    console.log('');

    if (resultFiles.length === 0) {
      console.log('💡 建议:');
      console.log('1. 检查虚拟试衣是否真的完成（查看数据库 processing_session 表）');
      console.log('2. 检查后端日志，看是否有错误');
      console.log('3. 确认 Gemini API 是否被正常调用');
      console.log('4. 运行 check-database.ts 查看处理会话状态');
    } else {
      console.log('✅ 有成功的结果文件保存到 TOS！');
    }

  } catch (error: any) {
    console.error('\n❌ 检查失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行检查
checkTosResults().catch(console.error);

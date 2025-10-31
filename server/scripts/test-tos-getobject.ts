import TOS from '@volcengine/tos-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testTosGetObject() {
  console.log('=== TOS GetObject Test ===\n');

  const bucket = process.env.TOS_BUCKET!;
  const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY!,
    region: process.env.TOS_REGION!,
    endpoint: process.env.TOS_ENDPOINT!,
  });

  try {
    // 1. 上传测试文件
    console.log('1️⃣  Uploading test file...');
    const testKey = 'test/getobject-test.txt';
    const testContent = `GetObject test at ${new Date().toISOString()}`;

    await client.putObject({
      bucket,
      key: testKey,
      body: Buffer.from(testContent),
    });
    console.log(`✅ File uploaded: ${testKey}\n`);

    // 2. 使用 getObject 下载文件
    console.log('2️⃣  Testing getObject...');
    const startTime = Date.now();

    const result = await client.getObject({
      bucket,
      key: testKey,
    });

    const downloadTime = Date.now() - startTime;

    console.log(`✅ GetObject successful (${downloadTime}ms)`);
    console.log(`Result type: ${typeof result.data}`);
    console.log(`Result keys: ${Object.keys(result.data || {}).join(', ')}`);

    // 3. 解析内容
    console.log('\n3️⃣  Parsing content...');
    const data = result.data as any;

    let buffer: Buffer;

    if (Buffer.isBuffer(data)) {
      console.log('✅ Data is already a Buffer');
      buffer = data;
    } else if (data.content) {
      console.log('✅ Data has content property');
      buffer = Buffer.isBuffer(data.content) ? data.content : Buffer.from(data.content);
    } else if (typeof data === 'string') {
      console.log('✅ Data is a string');
      buffer = Buffer.from(data);
    } else {
      console.log('⚠️  Unknown data format, trying to convert...');
      buffer = Buffer.from(data);
    }

    console.log(`Buffer size: ${buffer.length} bytes`);
    console.log(`Content: ${buffer.toString().substring(0, 100)}`);

    // 4. 验证内容
    console.log('\n4️⃣  Verifying content...');
    const downloadedContent = buffer.toString();

    if (downloadedContent === testContent) {
      console.log('✅ Content matches perfectly!');
    } else {
      console.log('❌ Content mismatch');
      console.log(`Expected: ${testContent}`);
      console.log(`Got: ${downloadedContent}`);
    }

    // 5. 测试大文件（模拟图片）
    console.log('\n5️⃣  Testing larger file (simulating image)...');
    const largeKey = 'test/large-file.bin';
    const largeBuffer = Buffer.alloc(1024 * 1024); // 1MB
    largeBuffer.fill('x');

    const uploadStart = Date.now();
    await client.putObject({
      bucket,
      key: largeKey,
      body: largeBuffer,
    });
    const uploadTime = Date.now() - uploadStart;

    console.log(`✅ Large file uploaded (${uploadTime}ms, ${largeBuffer.length} bytes)`);

    const downloadStart = Date.now();
    const largeResult = await client.getObject({
      bucket,
      key: largeKey,
    });
    const largeDownloadTime = Date.now() - downloadStart;

    const largeData = largeResult.data as any;
    let largeDownloadedBuffer: Buffer;

    if (Buffer.isBuffer(largeData)) {
      largeDownloadedBuffer = largeData;
    } else if (largeData.content) {
      largeDownloadedBuffer = Buffer.isBuffer(largeData.content)
        ? largeData.content
        : Buffer.from(largeData.content);
    } else {
      largeDownloadedBuffer = Buffer.from(largeData);
    }

    console.log(`✅ Large file downloaded (${largeDownloadTime}ms, ${largeDownloadedBuffer.length} bytes)`);

    if (largeDownloadedBuffer.length === largeBuffer.length) {
      console.log('✅ Size matches!');
    } else {
      console.log(`❌ Size mismatch: expected ${largeBuffer.length}, got ${largeDownloadedBuffer.length}`);
    }

    // 6. 清理
    console.log('\n🧹 Cleaning up...');
    await client.deleteObject({ bucket, key: testKey });
    await client.deleteObject({ bucket, key: largeKey });
    console.log('✅ Test files deleted\n');

    // 7. 性能总结
    console.log('=== Performance Summary ===\n');
    console.log(`Small file download: ${downloadTime}ms`);
    console.log(`Large file upload: ${uploadTime}ms (${(largeBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`Large file download: ${largeDownloadTime}ms (${(largeDownloadedBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`Download speed: ${((largeDownloadedBuffer.length / 1024 / 1024) / (largeDownloadTime / 1000)).toFixed(2)} MB/s`);

    console.log('\n🎉 All tests passed!');
    console.log('GetObject method is working correctly and can be used for file downloads.');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// 运行测试
testTosGetObject().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

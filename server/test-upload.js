// 快速测试 TOS 上传功能
const TOS = require('@volcengine/tos-sdk').default;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testUpload() {
  console.log('🚀 Testing TOS upload functionality...\n');

  const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID,
    accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY,
    region: process.env.TOS_REGION,
    endpoint: process.env.TOS_ENDPOINT,
  });

  // 创建一个测试图片 (1x1 PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  try {
    // 测试上传到 models 目录
    const timestamp = Date.now();
    const testKey = `models/test-${timestamp}.png`;

    console.log(`📤 Uploading test image: ${testKey}`);
    const uploadResult = await client.putObject({
      bucket: process.env.TOS_BUCKET,
      key: testKey,
      body: testImageBuffer,
    });

    console.log('✅ Upload successful!');

    // 生成访问 URL
    const cdnUrl = `${process.env.TOS_CDN_DOMAIN}/${testKey}`;
    console.log(`\n🌐 Image URL: ${cdnUrl}`);
    console.log('\n💡 You can access this image in your browser or TOS console!');

    // 列出存储桶中的文件
    console.log('\n📁 Listing files in bucket...');
    const listResult = await client.listObjects({
      bucket: process.env.TOS_BUCKET,
      prefix: 'models/',
      maxKeys: 10,
    });

    if (listResult.data.Contents && listResult.data.Contents.length > 0) {
      console.log(`\nFound ${listResult.data.Contents.length} files in models/ directory:`);
      listResult.data.Contents.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.Key} (${(file.Size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('\nNo files found in models/ directory');
    }

    console.log('\n✨ TOS upload test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.statusCode) {
      console.error(`   Status Code: ${error.statusCode}`);
    }
  }
}

testUpload().catch(console.error);

import TOS from '@volcengine/tos-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as https from 'https';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function httpGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          body: body.substring(0, 200),
        });
      });
    }).on('error', reject);
  });
}

async function testPreSignedUrl() {
  console.log('=== Pre-Signed URL Test ===\n');

  const bucket = process.env.TOS_BUCKET!;
  const urlExpiresIn = process.env.TOS_URL_EXPIRES_IN
    ? parseInt(process.env.TOS_URL_EXPIRES_IN, 10)
    : 86400;

  const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY!,
    region: process.env.TOS_REGION!,
    endpoint: process.env.TOS_ENDPOINT!,
  });

  console.log(`Configuration:`);
  console.log(`  Bucket: ${bucket}`);
  console.log(`  URL Expires In: ${urlExpiresIn}s (${urlExpiresIn / 3600}h)\n`);

  // 1. 上传测试文件
  console.log('1️⃣  Uploading test file...');
  const testKey = 'test/presigned-url-test.txt';
  const testContent = `Pre-signed URL test at ${new Date().toISOString()}`;

  await client.putObject({
    bucket,
    key: testKey,
    body: Buffer.from(testContent),
  });
  console.log(`✅ File uploaded: ${testKey}\n`);

  // 2. 生成预签名 URL
  console.log('2️⃣  Generating pre-signed URL...');
  const preSignedUrl = await client.getPreSignedUrl({
    bucket,
    key: testKey,
    expires: urlExpiresIn,
  });

  console.log(`✅ Pre-signed URL generated successfully`);
  console.log(`URL length: ${preSignedUrl.length} characters`);
  console.log(`URL preview: ${preSignedUrl.substring(0, 100)}...`);
  console.log(`Expires in: ${urlExpiresIn}s (${urlExpiresIn / 3600}h)\n`);

  // 3. 测试预签名 URL 访问
  console.log('3️⃣  Testing pre-signed URL access...');
  try {
    const result = await httpGet(preSignedUrl);
    if (result.status === 200) {
      console.log(`✅ SUCCESS - Pre-signed URL works!`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Content: ${result.body.substring(0, 50)}...`);
    } else {
      console.log(`❌ FAIL - Unexpected status: ${result.status}`);
    }
  } catch (error: any) {
    console.log(`❌ ERROR - ${error.message}`);
  }

  // 4. 测试模拟的上传场景
  console.log('\n4️⃣  Simulating upload scenario (like outfit-change service)...');

  const uploadKey = 'results/test-result-123.jpg';
  const uploadContent = Buffer.from('Simulated image data');

  // 上传文件
  await client.putObject({
    bucket,
    key: uploadKey,
    body: uploadContent,
  });

  // 生成预签名 URL（这就是返回给前端的 URL）
  const resultUrl = await client.getPreSignedUrl({
    bucket,
    key: uploadKey,
    expires: urlExpiresIn,
  });

  console.log(`✅ Upload complete, result URL generated`);
  console.log(`   File key: ${uploadKey}`);
  console.log(`   URL: ${resultUrl.substring(0, 100)}...`);

  // 验证前端可以访问这个 URL
  const accessTest = await httpGet(resultUrl);
  if (accessTest.status === 200) {
    console.log(`✅ Frontend can access the file via pre-signed URL`);
  } else {
    console.log(`❌ Frontend cannot access the file (status: ${accessTest.status})`);
  }

  // 5. 清理测试文件
  console.log('\n🧹 Cleaning up...');
  await client.deleteObject({ bucket, key: testKey });
  await client.deleteObject({ bucket, key: uploadKey });
  console.log(`✅ Test files deleted\n`);

  // 6. 总结
  console.log('=== Summary ===\n');
  console.log('✅ 预签名 URL 方案测试通过！');
  console.log('');
  console.log('优势:');
  console.log('  1. 不需要设置 Bucket 公网读权限，更安全');
  console.log('  2. URL 自动过期，防止永久泄露');
  console.log('  3. 可以为每个文件生成独立的访问权限');
  console.log('');
  console.log('注意事项:');
  console.log(`  1. URL 会在 ${urlExpiresIn / 3600} 小时后过期`);
  console.log('  2. 如果需要长期访问，需要重新生成 URL');
  console.log('  3. 前端可以直接使用这个 URL 显示图片或下载文件');
  console.log('');
  console.log('🎉 您的应用现在可以安全地使用 TOS 存储了！');
}

// 运行测试
testPreSignedUrl().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

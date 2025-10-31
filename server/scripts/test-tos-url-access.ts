import TOS from '@volcengine/tos-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function httpGet(url: string): Promise<{ status: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          body: body.substring(0, 200),
        });
      });
    }).on('error', reject);
  });
}

async function testTosUrlAccess() {
  console.log('=== TOS URL Access Test ===\n');

  const bucket = process.env.TOS_BUCKET!;
  const region = process.env.TOS_REGION!;
  const endpoint = process.env.TOS_ENDPOINT!;
  const cdnDomain = process.env.TOS_CDN_DOMAIN!;

  const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY!,
    region,
    endpoint,
  });

  // 1. 上传测试文件
  console.log('1️⃣  Uploading test file...');
  const testKey = 'test/url-access-test.txt';
  const testContent = `Test file created at ${new Date().toISOString()}`;

  await client.putObject({
    bucket,
    key: testKey,
    body: Buffer.from(testContent),
  });
  console.log(`✅ File uploaded: ${testKey}\n`);

  // 2. 测试不同的 URL 格式
  const urls = [
    {
      name: 'CDN Domain URL',
      url: `${cdnDomain}/${testKey}`,
      description: '使用配置的 CDN 域名',
    },
    {
      name: 'TOS Public URL',
      url: `https://${bucket}.${endpoint}/${testKey}`,
      description: 'TOS 原生公网 URL',
    },
    {
      name: 'TOS Direct URL',
      url: `https://${endpoint}/${bucket}/${testKey}`,
      description: 'TOS 直接访问 URL',
    },
  ];

  console.log('2️⃣  Testing different URL formats:\n');

  for (const urlTest of urls) {
    console.log(`Testing: ${urlTest.name}`);
    console.log(`Description: ${urlTest.description}`);
    console.log(`URL: ${urlTest.url}`);

    try {
      const result = await httpGet(urlTest.url);
      if (result.status === 200) {
        console.log(`✅ SUCCESS - Status: ${result.status}`);
        console.log(`   Content preview: ${result.body.substring(0, 50)}...`);
      } else if (result.status === 403) {
        console.log(`❌ FAIL - Status: ${result.status} (Access Denied)`);
        console.log(`   这是您遇到的错误！`);
        console.log(`   原因: Bucket 或对象没有配置公网读取权限`);
      } else {
        console.log(`⚠️  UNEXPECTED - Status: ${result.status}`);
      }
    } catch (error: any) {
      console.log(`❌ ERROR - ${error.message}`);
    }
    console.log('');
  }

  // 3. 检查 Bucket 的公网访问配置
  console.log('3️⃣  Checking bucket configuration...\n');

  try {
    const bucketInfo = await client.headBucket(bucket);
    console.log('✅ Bucket exists and is accessible via API');
  } catch (error: any) {
    console.log(`❌ Cannot access bucket: ${error.message}`);
  }

  // 4. 生成预签名 URL (临时访问链接)
  console.log('\n4️⃣  Generating pre-signed URL...\n');

  try {
    const preSignedUrl = await client.getPreSignedUrl({
      bucket,
      key: testKey,
      expires: 3600, // 1 小时有效期
    });

    console.log('✅ Pre-signed URL generated successfully');
    console.log(`URL: ${preSignedUrl}\n`);
    console.log('Testing pre-signed URL access...');

    const result = await httpGet(preSignedUrl);
    if (result.status === 200) {
      console.log(`✅ Pre-signed URL works! Status: ${result.status}`);
      console.log(`   Content preview: ${result.body.substring(0, 50)}...`);
    } else {
      console.log(`❌ Pre-signed URL failed with status: ${result.status}`);
    }
  } catch (error: any) {
    console.log(`❌ Failed to generate pre-signed URL: ${error.message}`);
  }

  // 5. 清理测试文件
  console.log('\n🧹 Cleaning up...');
  await client.deleteObject({ bucket, key: testKey });

  // 6. 总结和建议
  console.log('\n=== Summary & Recommendations ===\n');
  console.log('如果您遇到 403 Access Denied 错误，可能的原因是：');
  console.log('');
  console.log('1️⃣  Bucket 未开启公网读权限');
  console.log('   解决方案:');
  console.log('   - 登录火山引擎控制台');
  console.log('   - 进入 TOS 服务，找到您的 Bucket');
  console.log('   - 在【权限管理】->【Bucket ACL】中设置为【公共读】');
  console.log('   - 或者在【权限管理】->【Bucket Policy】中添加公网读取策略');
  console.log('');
  console.log('2️⃣  对象未设置公网读权限');
  console.log('   解决方案:');
  console.log('   - 可以在上传时设置 ACL (在代码中添加 acl: "public-read")');
  console.log('   - 或者使用预签名 URL 方式访问（不需要公网权限）');
  console.log('');
  console.log('3️⃣  推荐方案（根据您的需求选择）:');
  console.log('   A. 公网访问方案: 设置 Bucket 为公共读，适合需要分享图片 URL 的场景');
  console.log('   B. 预签名 URL 方案: 保持 Bucket 私有，使用临时签名 URL 访问，更安全');
  console.log('');
}

// 运行测试
testTosUrlAccess().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

import TOS from '@volcengine/tos-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testTosConnection() {
  console.log('=== TOS Connection Test ===\n');

  // 检查环境变量
  const requiredEnvVars = [
    'TOS_ACCESS_KEY_ID',
    'TOS_SECRET_ACCESS_KEY',
    'TOS_REGION',
    'TOS_ENDPOINT',
    'TOS_BUCKET',
  ];

  console.log('Checking environment variables...');
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missingVars.join(', ')}`,
    );
    console.log('\nPlease configure these variables in server/.env file.');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set\n');

  // 初始化 TOS 客户端
  console.log('Initializing TOS client...');
  const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY!,
    region: process.env.TOS_REGION!,
    endpoint: process.env.TOS_ENDPOINT!,
  });

  console.log(`✅ TOS client initialized`);
  console.log(`   Region: ${process.env.TOS_REGION}`);
  console.log(`   Endpoint: ${process.env.TOS_ENDPOINT}`);
  console.log(`   Bucket: ${process.env.TOS_BUCKET}\n`);

  try {
    // 测试上传小文件
    console.log('Testing TOS upload...');
    const testKey = 'test/connection-test.txt';
    const testContent = `TOS connection test successful at ${new Date().toISOString()}`;

    await client.putObject({
      bucket: process.env.TOS_BUCKET!,
      key: testKey,
      body: Buffer.from(testContent),
    });
    console.log(`✅ Upload successful: ${testKey}\n`);

    // 测试读取文件
    console.log('Testing TOS download...');
    const getResult = await client.getObject({
      bucket: process.env.TOS_BUCKET!,
      key: testKey,
    });

    const content = getResult.data as any;
    const contentStr = content.content ? content.content.toString() : content.toString();
    console.log(
      `✅ Download successful: ${contentStr.substring(0, 50)}...\n`,
    );

    // 测试删除文件
    console.log('Testing TOS delete...');
    await client.deleteObject({
      bucket: process.env.TOS_BUCKET!,
      key: testKey,
    });
    console.log(`✅ Delete successful: ${testKey}\n`);

    console.log('🎉 All TOS connection tests passed!');
    console.log('\nYour TOS configuration is working correctly.');
  } catch (error) {
    console.error('\n❌ TOS connection test failed:');
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    if (error.statusCode) {
      console.error(`   Status Code: ${error.statusCode}`);
    }
    console.error(`   Error Message: ${error.message}`);

    if (error.statusCode === 403) {
      console.error(
        '\n💡 Hint: Check if your TOS AccessKey and SecretKey are correct.',
      );
      console.error(
        '   Also verify that the IAM user has permission to access this bucket.',
      );
    } else if (error.statusCode === 404) {
      console.error(
        '\n💡 Hint: The bucket may not exist. Please create it in the Volcengine console.',
      );
    } else if (error.code === 'NetworkError' || error.code === 'ECONNREFUSED') {
      console.error(
        '\n💡 Hint: Check your network connection and TOS endpoint configuration.',
      );
    }

    console.error('\nError Stack:', error.stack);
    process.exit(1);
  }
}

// 运行测试
testTosConnection().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

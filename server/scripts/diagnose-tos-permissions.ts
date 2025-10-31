import TOS from '@volcengine/tos-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface TestResult {
  operation: string;
  success: boolean;
  error?: any;
  details?: string;
}

async function testOperation(
  name: string,
  operation: () => Promise<any>,
): Promise<TestResult> {
  try {
    await operation();
    return {
      operation: name,
      success: true,
    };
  } catch (error) {
    return {
      operation: name,
      success: false,
      error: {
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
        ec: error.EC,
        detailErrCode: error.DetailErrCode,
      },
    };
  }
}

async function diagnoseTosPermissions() {
  console.log('=== TOS Permissions Diagnostic Tool ===\n');

  const bucket = process.env.TOS_BUCKET!;
  const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY!,
    region: process.env.TOS_REGION!,
    endpoint: process.env.TOS_ENDPOINT!,
  });

  const results: TestResult[] = [];

  console.log('Testing different TOS operations...\n');

  // 1. Test PutObject (写入权限)
  console.log('1️⃣  Testing PutObject permission...');
  results.push(
    await testOperation('PutObject', async () => {
      await client.putObject({
        bucket,
        key: 'diagnostic-test/write-test.txt',
        body: Buffer.from('test'),
      });
    }),
  );

  // 2. Test GetObject (读取权限)
  console.log('2️⃣  Testing GetObject permission...');
  results.push(
    await testOperation('GetObject', async () => {
      await client.getObject({
        bucket,
        key: 'diagnostic-test/write-test.txt',
      });
    }),
  );

  // 3. Test ListObjects (列出对象权限)
  console.log('3️⃣  Testing ListObjects permission...');
  results.push(
    await testOperation('ListObjects', async () => {
      await client.listObjects({
        bucket,
        prefix: 'diagnostic-test/',
      });
    }),
  );

  // 4. Test HeadObject (查看对象元数据权限)
  console.log('4️⃣  Testing HeadObject permission...');
  results.push(
    await testOperation('HeadObject', async () => {
      await client.headObject({
        bucket,
        key: 'diagnostic-test/write-test.txt',
      });
    }),
  );

  // 5. Test CopyObject (复制权限)
  console.log('5️⃣  Testing CopyObject permission...');
  results.push(
    await testOperation('CopyObject', async () => {
      await client.copyObject({
        bucket,
        key: 'diagnostic-test/copy-test.txt',
        srcBucket: bucket,
        srcKey: 'diagnostic-test/write-test.txt',
      });
    }),
  );

  // 6. Test DeleteObject (删除权限)
  console.log('6️⃣  Testing DeleteObject permission...');
  results.push(
    await testOperation('DeleteObject (original)', async () => {
      await client.deleteObject({
        bucket,
        key: 'diagnostic-test/write-test.txt',
      });
    }),
  );

  results.push(
    await testOperation('DeleteObject (copy)', async () => {
      await client.deleteObject({
        bucket,
        key: 'diagnostic-test/copy-test.txt',
      });
    }),
  );

  // 7. Test GetObjectACL (获取对象 ACL 权限)
  console.log('7️⃣  Testing GetObjectACL permission...');
  // 先上传一个测试文件
  try {
    await client.putObject({
      bucket,
      key: 'diagnostic-test/acl-test.txt',
      body: Buffer.from('test'),
    });
  } catch (e) {
    // Ignore
  }

  results.push(
    await testOperation('GetObjectACL', async () => {
      await client.getObjectAcl({
        bucket,
        key: 'diagnostic-test/acl-test.txt',
      });
    }),
  );

  // 8. Test PutObjectACL (设置对象 ACL 权限)
  console.log('8️⃣  Testing PutObjectACL permission...');
  results.push(
    await testOperation('PutObjectACL', async () => {
      await client.putObjectAcl({
        bucket,
        key: 'diagnostic-test/acl-test.txt',
        acl: 'private' as any,
      });
    }),
  );

  // 清理测试文件
  console.log('🧹 Cleaning up test files...');
  try {
    await client.deleteObject({ bucket, key: 'diagnostic-test/acl-test.txt' });
  } catch (e) {
    // Ignore
  }

  // 打印结果
  console.log('\n=== Diagnostic Results ===\n');

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ ${result.operation}: PASS`);
    } else {
      console.log(`❌ ${result.operation}: FAIL`);
      console.log(`   Status Code: ${result.error?.statusCode || 'N/A'}`);
      console.log(`   Error Code: ${result.error?.code || 'N/A'}`);
      console.log(`   EC: ${result.error?.ec || 'N/A'}`);
      console.log(`   Detail Error Code: ${result.error?.detailErrCode || 'N/A'}`);
      console.log(`   Message: ${result.error?.message || 'N/A'}`);
      console.log('');
    }
  });

  console.log(`\nSummary: ${successCount} passed, ${failCount} failed`);

  // 根据结果给出建议
  if (failCount > 0) {
    console.log('\n=== Recommendations ===\n');

    const failedOps = results.filter((r) => !r.success);

    if (failedOps.some((op) => op.operation.includes('ACL'))) {
      console.log(
        '⚠️  ACL 相关操作失败: 您的 AccessKey 可能没有管理对象 ACL 的权限',
      );
      console.log(
        '   这通常不影响基本的上传下载功能，可以忽略（除非您需要设置公开访问）',
      );
    }

    if (failedOps.some((op) => op.operation === 'ListObjects')) {
      console.log(
        '⚠️  ListObjects 失败: 您的 AccessKey 可能没有列出 Bucket 对象的权限',
      );
      console.log('   这可能影响文件列表功能');
    }

    if (
      failedOps.some(
        (op) =>
          op.operation === 'PutObject' ||
          op.operation === 'GetObject' ||
          op.operation === 'DeleteObject',
      )
    ) {
      console.log(
        '⚠️  基本操作失败: 请检查您的 AccessKey 权限配置',
      );
      console.log('   在火山引擎控制台中，确保 IAM 用户拥有以下权限：');
      console.log('   - tos:PutObject');
      console.log('   - tos:GetObject');
      console.log('   - tos:DeleteObject');
      console.log('   - tos:ListBucket');
    }

    console.log(
      '\n💡 如何修复权限问题:',
    );
    console.log('   1. 登录火山引擎控制台');
    console.log('   2. 进入 IAM (访问控制) 服务');
    console.log('   3. 找到您的 AccessKey 对应的用户');
    console.log('   4. 为该用户添加 TOS 相关权限策略');
    console.log(
      '   5. 或者直接为该用户授予 TOSFullAccess 权限（开发环境推荐）',
    );
  } else {
    console.log('\n✨ 所有权限检查通过！您的 TOS 配置完全正常。');
  }
}

// 运行诊断
diagnoseTosPermissions().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

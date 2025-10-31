import { registerAs } from '@nestjs/config';
import { TosConfig } from '../common/interfaces/storage-config.interface';

/**
 * TOS configuration factory
 * TOS 配置工厂函数
 */
export default registerAs(
  'tos',
  (): TosConfig => ({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.TOS_SECRET_ACCESS_KEY || '',
    region: process.env.TOS_REGION || 'cn-beijing',
    endpoint: process.env.TOS_ENDPOINT || 'tos-cn-beijing.volces.com',
    bucket: process.env.TOS_BUCKET || '',
    cdnDomain: process.env.TOS_CDN_DOMAIN || '',
    urlExpiresIn: process.env.TOS_URL_EXPIRES_IN
      ? parseInt(process.env.TOS_URL_EXPIRES_IN, 10)
      : 86400, // 默认 24 小时
  }),
);

import { StorageType } from '../enums/storage-type.enum';

/**
 * Storage configuration interface
 * 存储配置接口
 */
export interface StorageConfig {
  /**
   * Storage type (local or tos)
   * 存储类型
   */
  type: StorageType;

  /**
   * Upload directory (for local storage)
   * 上传目录(本地存储使用)
   */
  uploadDir?: string;
}

/**
 * TOS (Volcengine Object Storage) configuration
 * TOS 配置接口
 */
export interface TosConfig {
  /**
   * TOS Access Key ID
   */
  accessKeyId: string;

  /**
   * TOS Secret Access Key
   */
  secretAccessKey: string;

  /**
   * TOS Region (e.g., 'cn-beijing')
   * TOS 区域
   */
  region: string;

  /**
   * TOS Endpoint (e.g., 'tos-cn-beijing.volces.com')
   * TOS 服务端点
   */
  endpoint: string;

  /**
   * TOS Bucket name
   * TOS 存储桶名称
   */
  bucket: string;

  /**
   * CDN Domain (e.g., 'https://cdn.example.com')
   * CDN 域名
   * @deprecated 使用预签名 URL 时不再需要此字段
   */
  cdnDomain: string;

  /**
   * Pre-signed URL expiration time in seconds
   * 预签名 URL 过期时间（秒）
   * @default 86400 (24 hours)
   */
  urlExpiresIn?: number;
}

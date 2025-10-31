import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TOS from '@volcengine/tos-sdk';
import { IStorageProvider } from '../interfaces/storage-provider.interface';
import { StorageType } from '../../../../common/enums/storage-type.enum';
import { TosConfig } from '../../../../common/interfaces/storage-config.interface';

/**
 * TOS (Volcengine Object Storage) Storage Provider
 * TOS 云存储提供者
 */
@Injectable()
export class TosStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(TosStorageProvider.name);
  private readonly tosClient: TOS;
  private readonly bucket: string;
  private readonly urlExpiresIn: number;

  constructor(private configService: ConfigService) {
    const tosConfig = this.configService.get<TosConfig>('tos');

    if (!tosConfig || !tosConfig.accessKeyId || !tosConfig.bucket) {
      throw new Error('TOS configuration is incomplete. Please check your environment variables.');
    }

    this.bucket = tosConfig.bucket;
    this.urlExpiresIn = tosConfig.urlExpiresIn || 86400; // 默认 24 小时

    // Initialize TOS client
    this.tosClient = new TOS({
      accessKeyId: tosConfig.accessKeyId,
      accessKeySecret: tosConfig.secretAccessKey,
      region: tosConfig.region,
      endpoint: tosConfig.endpoint,
    });

    this.logger.log(
      `TosStorageProvider initialized with bucket: ${this.bucket}, region: ${tosConfig.region}, urlExpiresIn: ${this.urlExpiresIn}s`,
    );
  }

  /**
   * Upload file to TOS and return pre-signed URL
   * 上传文件到 TOS 并返回预签名 URL
   */
  async upload(buffer: Buffer, category: string, filename: string): Promise<string> {
    const key = `${category}/${filename}`;

    try {
      // Upload file to TOS
      await this.tosClient.putObject({
        bucket: this.bucket,
        key,
        body: buffer,
      });

      this.logger.log(`File uploaded to TOS: ${key}, size: ${buffer.length} bytes`);

      // Generate pre-signed URL for secure access
      const preSignedUrl = await this.tosClient.getPreSignedUrl({
        bucket: this.bucket,
        key,
        expires: this.urlExpiresIn,
      });

      this.logger.log(`Pre-signed URL generated for ${key}, expires in ${this.urlExpiresIn}s`);

      return preSignedUrl;
    } catch (error) {
      this.logger.error(`Failed to upload file to TOS: ${key}`, error.stack);
      throw new Error(`Failed to upload file to TOS: ${error.message}`);
    }
  }

  /**
   * Delete file from TOS
   * 从 TOS 删除文件
   */
  async delete(key: string): Promise<void> {
    // Remove leading slash if present
    const normalizedKey = key.startsWith('/') ? key.slice(1) : key;

    try {
      await this.tosClient.deleteObject({
        bucket: this.bucket,
        key: normalizedKey,
      });

      this.logger.log(`File deleted from TOS: ${normalizedKey}`);
    } catch (error) {
      // TOS returns 404 if object doesn't exist, we treat this as success (idempotent)
      if (error.statusCode === 404) {
        this.logger.warn(`File not found for deletion in TOS: ${normalizedKey}`);
      } else {
        this.logger.error(`Failed to delete file from TOS: ${normalizedKey}`, error.stack);
        throw new Error(`Failed to delete file from TOS: ${error.message}`);
      }
    }
  }

  /**
   * Archive file (move to archived directory in TOS)
   * 归档文件(在 TOS 中移动到归档目录)
   */
  async archive(key: string): Promise<string> {
    const normalizedKey = key.startsWith('/') ? key.slice(1) : key;
    const archivedKey = `archived/${normalizedKey}`;

    try {
      // Copy object to archived location
      await this.tosClient.copyObject({
        bucket: this.bucket,
        key: archivedKey,
        srcBucket: this.bucket,
        srcKey: normalizedKey,
      });

      // Delete original object
      await this.tosClient.deleteObject({
        bucket: this.bucket,
        key: normalizedKey,
      });

      this.logger.log(`File archived in TOS: ${normalizedKey} → ${archivedKey}`);

      return archivedKey;
    } catch (error) {
      this.logger.error(`Failed to archive file in TOS: ${normalizedKey}`, error.stack);
      throw new Error(`Failed to archive file in TOS: ${error.message}`);
    }
  }

  /**
   * Check if file exists in TOS
   * 检查文件是否存在于 TOS
   */
  async exists(key: string): Promise<boolean> {
    const normalizedKey = key.startsWith('/') ? key.slice(1) : key;

    try {
      await this.tosClient.headObject({
        bucket: this.bucket,
        key: normalizedKey,
      });

      return true;
    } catch (error) {
      if (error.statusCode === 404) {
        return false;
      }

      // For other errors, log and return false
      this.logger.warn(`Error checking file existence in TOS: ${normalizedKey}`, error.message);
      return false;
    }
  }

  /**
   * Get storage type identifier
   * 获取存储类型标识
   */
  getType(): string {
    return StorageType.TOS;
  }

  /**
   * Get pre-signed URL for accessing a file
   * 获取文件访问的预签名 URL
   */
  async getAccessUrl(key: string): Promise<string> {
    // Remove leading slash if present
    const normalizedKey = key.startsWith('/') ? key.slice(1) : key;

    try {
      const preSignedUrl = await this.tosClient.getPreSignedUrl({
        bucket: this.bucket,
        key: normalizedKey,
        expires: this.urlExpiresIn,
      });

      this.logger.log(`Pre-signed URL generated for ${normalizedKey}, expires in ${this.urlExpiresIn}s`);

      return preSignedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate pre-signed URL for: ${normalizedKey}`, error.stack);
      throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
    }
  }

  /**
   * Get file content as Buffer from TOS with retry logic
   * 从 TOS 获取文件内容为 Buffer（带重试机制）
   */
  async getObject(key: string, maxRetries = 3): Promise<Buffer> {
    // Remove leading slash if present
    const normalizedKey = key.startsWith('/') ? key.slice(1) : key;

    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Downloading file from TOS (attempt ${attempt}/${maxRetries}): ${normalizedKey}`);

        const startTime = Date.now();

        const result = await this.tosClient.getObject({
          bucket: this.bucket,
          key: normalizedKey,
        });

        const downloadTime = Date.now() - startTime;

        // TOS SDK returns data in result.data
        const data = result.data as any;

        // The content can be in different formats depending on SDK version
        let buffer: Buffer;

        if (Buffer.isBuffer(data)) {
          buffer = data;
        } else if (data.content) {
          buffer = Buffer.isBuffer(data.content) ? data.content : Buffer.from(data.content);
        } else if (typeof data === 'string') {
          buffer = Buffer.from(data);
        } else {
          // Try to convert to buffer
          buffer = Buffer.from(data);
        }

        this.logger.log(
          `File downloaded from TOS: ${normalizedKey}, size: ${buffer.length} bytes, time: ${downloadTime}ms`,
        );

        return buffer;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `Download attempt ${attempt}/${maxRetries} failed for ${normalizedKey}: ${error.message}`,
        );

        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          const waitTime = attempt * 1000; // 递增等待时间: 1s, 2s, 3s
          this.logger.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // 所有重试都失败
    this.logger.error(`Failed to download file from TOS after ${maxRetries} attempts: ${normalizedKey}`, lastError?.stack);
    throw new Error(`Failed to download file from TOS after ${maxRetries} attempts: ${lastError?.message}`);
  }
}

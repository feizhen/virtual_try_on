import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { IStorageProvider } from '../interfaces/storage-provider.interface';
import { StorageType } from '../../../../common/enums/storage-type.enum';

/**
 * Local Filesystem Storage Provider
 * 本地文件系统存储提供者
 */
@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
    this.logger.log(`LocalStorageProvider initialized with uploadDir: ${this.uploadDir}`);
  }

  /**
   * Upload file to local filesystem
   * 上传文件到本地文件系统
   */
  async upload(buffer: Buffer, category: string, filename: string): Promise<string> {
    const relativePath = path.join(category, filename);
    const categoryPath = path.join(this.uploadDir, category);
    const filePath = path.join(categoryPath, filename);
    const fullPath = path.join(process.cwd(), filePath);

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      // Write file
      await fs.writeFile(fullPath, buffer);

      this.logger.log(`File saved: ${filePath}, size: ${buffer.length} bytes`);

      // Return URL path for local access
      return `/${this.uploadDir}/${relativePath}`;
    } catch (error) {
      this.logger.error(`Failed to save file: ${filePath}`, error.stack);
      throw new Error(`Failed to save file to local storage: ${error.message}`);
    }
  }

  /**
   * Delete file from local filesystem
   * 从本地文件系统删除文件
   */
  async delete(key: string): Promise<void> {
    // key format: 'models/uuid.jpg' or 'uploads/models/uuid.jpg'
    // Normalize to absolute path
    const filePath = key.startsWith(this.uploadDir)
      ? key
      : path.join(this.uploadDir, key);
    const fullPath = path.join(process.cwd(), filePath);

    try {
      await fs.unlink(fullPath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`File not found for deletion: ${filePath}`);
        // Don't throw error if file doesn't exist (idempotent operation)
      } else {
        this.logger.error(`Failed to delete file: ${filePath}`, error.stack);
        throw new Error(`Failed to delete file from local storage: ${error.message}`);
      }
    }
  }

  /**
   * Archive file (move to archived directory)
   * 归档文件(移动到归档目录)
   */
  async archive(key: string): Promise<string> {
    const originalPath = key.startsWith(this.uploadDir)
      ? key
      : path.join(this.uploadDir, key);
    const archivedKey = `archived/${key}`;
    const archivedPath = path.join(this.uploadDir, 'archived', key);

    const originalFullPath = path.join(process.cwd(), originalPath);
    const archivedFullPath = path.join(process.cwd(), archivedPath);

    try {
      // Ensure archived directory exists
      await fs.mkdir(path.dirname(archivedFullPath), { recursive: true });

      // Move file
      await fs.rename(originalFullPath, archivedFullPath);

      this.logger.log(`File archived: ${originalPath} → ${archivedPath}`);

      return archivedKey;
    } catch (error) {
      this.logger.error(`Failed to archive file: ${originalPath}`, error.stack);
      throw new Error(`Failed to archive file in local storage: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * 检查文件是否存在
   */
  async exists(key: string): Promise<boolean> {
    const filePath = key.startsWith(this.uploadDir)
      ? key
      : path.join(this.uploadDir, key);
    const fullPath = path.join(process.cwd(), filePath);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage type identifier
   * 获取存储类型标识
   */
  getType(): string {
    return StorageType.LOCAL;
  }

  /**
   * Get access URL for local file
   * 获取本地文件的访问 URL
   */
  async getAccessUrl(key: string): Promise<string> {
    // For local storage, return direct URL path
    // key format: 'models/uuid.jpg' or 'uploads/models/uuid.jpg'

    // If key already starts with upload directory, use it as-is
    if (key.startsWith(`/${this.uploadDir}/`) || key.startsWith(this.uploadDir)) {
      return key.startsWith('/') ? key : `/${key}`;
    }

    // Otherwise, prepend upload directory
    return `/${this.uploadDir}/${key}`;
  }
}

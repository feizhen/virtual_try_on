import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { StorageFactory } from './storage.factory';
import { IStorageProvider } from './interfaces/storage-provider.interface';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly storageProvider: IStorageProvider;

  constructor(
    private configService: ConfigService,
    private storageFactory: StorageFactory,
  ) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
    this.storageProvider = this.storageFactory.getStorageProvider();
  }

  /**
   * Save uploaded file using configured storage provider
   * 使用配置的存储提供者保存上传的文件
   * @param buffer - File buffer
   * @param category - Category (models, clothing, results)
   * @param filename - Target filename
   * @returns Storage URL (local path or CDN URL)
   */
  async saveFile(
    buffer: Buffer,
    category: 'models' | 'clothing' | 'results',
    filename: string,
  ): Promise<string> {
    try {
      const url = await this.storageProvider.upload(buffer, category, filename);
      this.logger.log(`File saved using ${this.storageProvider.getType()} storage: ${filename}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to save file: ${filename}`, error.stack);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Generate file URL (kept for backward compatibility)
   * 生成文件 URL(保留以向后兼容)
   * @param filePath - Relative file path or CDN URL
   * @returns URL path for accessing the file
   */
  getFileUrl(filePath: string): string {
    // If it's already a full URL (TOS/CDN), return as-is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    // For local storage, ensure leading slash
    return filePath.startsWith('/') ? filePath : `/${filePath}`;
  }

  /**
   * Delete file using configured storage provider
   * 使用配置的存储提供者删除文件
   * @param key - Storage key or file path
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.storageProvider.delete(key);
      this.logger.log(`File deleted using ${this.storageProvider.getType()} storage: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error.stack);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Read file from storage (works with both local and TOS)
   * 从存储读取文件（支持本地和 TOS）
   * @param key - Storage key or file path
   * @returns File buffer
   */
  async getFileBuffer(key: string): Promise<Buffer> {
    const storageType = this.storageProvider.getType();

    try {
      if (storageType === 'local') {
        // For local storage, read from file system
        const fullPath = path.join(process.cwd(), key);
        return await fs.readFile(fullPath);
      } else {
        // For TOS, use the provider's getObject method
        // Cast to TosStorageProvider to access getObject
        const tosProvider = this.storageProvider as any;

        if (typeof tosProvider.getObject === 'function') {
          return await tosProvider.getObject(key);
        } else {
          throw new Error('Storage provider does not support getObject method');
        }
      }
    } catch (error) {
      this.logger.error(`Failed to get file buffer: ${key}`, error.stack);
      throw new Error(`Failed to get file buffer: ${error.message}`);
    }
  }

  /**
   * Read file from local file system (deprecated, use getFileBuffer instead)
   * 从本地文件系统读取文件(已弃用，请使用 getFileBuffer)
   * @param filePath - Relative file path
   * @returns File buffer
   * @deprecated Use getFileBuffer instead
   */
  async readFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(process.cwd(), filePath);

    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error.stack);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Get current storage type
   * 获取当前存储类型
   * @returns 'local' or 'tos'
   */
  getStorageType(): string {
    return this.storageProvider.getType();
  }

  /**
   * Check if file exists
   * 检查文件是否存在
   * @param key - Storage key or file path
   * @returns true if file exists, false otherwise
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      return await this.storageProvider.exists(key);
    } catch (error) {
      this.logger.error(`Failed to check file existence: ${key}`, error.stack);
      return false;
    }
  }
}

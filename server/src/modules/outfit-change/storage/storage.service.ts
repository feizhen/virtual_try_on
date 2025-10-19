import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
  }

  /**
   * Save uploaded file to local file system
   * @param buffer - File buffer
   * @param category - Category (models, clothing, results)
   * @param filename - Target filename
   * @returns Relative file path
   */
  async saveFile(
    buffer: Buffer,
    category: 'models' | 'clothing' | 'results',
    filename: string,
  ): Promise<string> {
    const categoryPath = path.join(this.uploadDir, category);
    const filePath = path.join(categoryPath, filename);
    const fullPath = path.join(process.cwd(), filePath);

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      // Write file
      await fs.writeFile(fullPath, buffer);

      this.logger.log(`File saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`Failed to save file: ${filePath}`, error.stack);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Generate local file URL
   * @param filePath - Relative file path
   * @returns URL path for serving the file
   */
  getFileUrl(filePath: string): string {
    // Return URL path (e.g., /uploads/models/uuid.jpg)
    return `/${filePath}`;
  }

  /**
   * Delete file from local file system
   * @param filePath - Relative file path
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);

    try {
      await fs.unlink(fullPath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`File not found for deletion: ${filePath}`);
      } else {
        this.logger.error(`Failed to delete file: ${filePath}`, error.stack);
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    }
  }

  /**
   * Read file from local file system
   * @param filePath - Relative file path
   * @returns File buffer
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
}

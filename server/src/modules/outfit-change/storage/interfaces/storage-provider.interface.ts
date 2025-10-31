/**
 * Storage Provider Interface
 * 存储提供者接口 - 抽象存储层,支持多种存储实现
 */
export interface IStorageProvider {
  /**
   * Upload a file to storage
   * 上传文件到存储
   *
   * @param buffer - File buffer content
   * @param category - File category (e.g., 'models', 'clothing', 'results')
   * @param filename - File name with extension (e.g., 'uuid.jpg')
   * @returns Promise resolving to the file access URL
   */
  upload(buffer: Buffer, category: string, filename: string): Promise<string>;

  /**
   * Delete a file from storage
   * 从存储删除文件
   *
   * @param key - File key/path (e.g., 'models/uuid.jpg')
   * @returns Promise that resolves when deletion is complete
   */
  delete(key: string): Promise<void>;

  /**
   * Archive a file (move to archived directory)
   * 归档文件(移动到归档目录)
   *
   * @param key - Original file key/path
   * @returns Promise resolving to the archived file key
   */
  archive(key: string): Promise<string>;

  /**
   * Check if a file exists in storage
   * 检查文件是否存在
   *
   * @param key - File key/path to check
   * @returns Promise resolving to true if file exists, false otherwise
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get the storage type identifier
   * 获取存储类型标识
   *
   * @returns Storage type string ('local' or 'tos')
   */
  getType(): string;

  /**
   * Get a pre-signed URL for accessing a file (for TOS) or direct URL (for local)
   * 获取文件访问 URL（TOS 返回预签名 URL，本地存储返回直接 URL）
   *
   * @param key - File key/path (e.g., 'models/uuid.jpg')
   * @returns Promise resolving to the access URL
   */
  getAccessUrl(key: string): Promise<string>;
}

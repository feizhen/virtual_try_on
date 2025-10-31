/**
 * Storage type enumeration
 * 存储类型枚举
 */
export enum StorageType {
  /**
   * Local filesystem storage
   * 本地文件系统存储
   */
  LOCAL = 'local',

  /**
   * Volcengine TOS (Object Storage) cloud storage
   * 火山引擎 TOS 对象存储
   */
  TOS = 'tos',
}

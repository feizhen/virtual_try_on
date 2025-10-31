import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageProvider } from './interfaces/storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { TosStorageProvider } from './providers/tos-storage.provider';
import { StorageType } from '../../../common/enums/storage-type.enum';

/**
 * Storage Factory
 * 存储工厂 - 根据配置创建对应的存储提供者实例
 */
@Injectable()
export class StorageFactory {
  private readonly logger = new Logger(StorageFactory.name);
  private storageProvider: IStorageProvider;

  constructor(
    private configService: ConfigService,
    private localStorageProvider: LocalStorageProvider,
    private tosStorageProvider: TosStorageProvider,
  ) {
    this.initializeStorageProvider();
  }

  /**
   * Initialize storage provider based on configuration
   * 根据配置初始化存储提供者
   */
  private initializeStorageProvider(): void {
    const storageType = this.configService.get<string>('STORAGE_TYPE') || StorageType.LOCAL;

    switch (storageType) {
      case StorageType.TOS:
        this.storageProvider = this.tosStorageProvider;
        this.logger.log('Using TOS storage provider');
        break;
      case StorageType.LOCAL:
      default:
        this.storageProvider = this.localStorageProvider;
        this.logger.log('Using local storage provider');
        break;
    }
  }

  /**
   * Get the configured storage provider
   * 获取配置的存储提供者
   */
  getStorageProvider(): IStorageProvider {
    return this.storageProvider;
  }

  /**
   * Get current storage type
   * 获取当前存储类型
   */
  getStorageType(): string {
    return this.storageProvider.getType();
  }
}

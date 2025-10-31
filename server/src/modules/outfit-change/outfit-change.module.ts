import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OutfitChangeController } from './outfit-change.controller';
import { OutfitChangeService } from './outfit-change.service';
import { StorageService } from './storage/storage.service';
import { GeminiService } from './gemini/gemini.service';
import { DatabaseModule } from '../../database/database.module';
import { CreditModule } from '../credit/credit.module';
import { LocalStorageProvider } from './storage/providers/local-storage.provider';
import { TosStorageProvider } from './storage/providers/tos-storage.provider';
import { StorageFactory } from './storage/storage.factory';

@Module({
  imports: [
    DatabaseModule,
    CreditModule,
    // TODO: Enable Bull queue when implementing US3 (AI processing)
    // BullModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     redis: {
    //       host: configService.get('REDIS_HOST') || 'localhost',
    //       port: configService.get('REDIS_PORT') || 6379,
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    // BullModule.registerQueue({
    //   name: 'outfit-processing',
    // }),
  ],
  controllers: [OutfitChangeController],
  providers: [
    OutfitChangeService,
    StorageService,
    GeminiService,
    LocalStorageProvider,
    TosStorageProvider,
    StorageFactory,
    // TODO: Enable OutfitProcessor when implementing US3 (AI processing)
    // OutfitProcessor,
  ],
  exports: [OutfitChangeService, StorageService],
})
export class OutfitChangeModule {}

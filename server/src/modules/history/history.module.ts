import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { OutfitChangeModule } from '@/modules/outfit-change/outfit-change.module';

@Module({
  imports: [OutfitChangeModule],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}

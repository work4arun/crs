import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

import { NotificationsController } from './notifications.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [NotificationsController],
  providers: [CleanupService, NotificationsService, PrismaService],
  exports: [CleanupService, NotificationsService],
})
export class SystemModule {}

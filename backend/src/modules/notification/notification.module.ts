import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../db/database.module';
import { NOTIFICATION_CAPABILITY } from './contracts/notification.contract';
import {
  NOTIFICATION_RECORD_REPOSITORY,
  RecordNotification,
} from './application/record-notification';
import { DrizzleNotificationRepository } from './infrastructure/drizzle-notification.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    DrizzleNotificationRepository,
    { provide: NOTIFICATION_RECORD_REPOSITORY, useExisting: DrizzleNotificationRepository },
    { provide: NOTIFICATION_CAPABILITY, useClass: RecordNotification },
  ],
  exports: [NOTIFICATION_CAPABILITY],
})
export class NotificationModule {}

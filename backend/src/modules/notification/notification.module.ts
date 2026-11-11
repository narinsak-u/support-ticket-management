import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../db/database.module';
import { NOTIFICATION_CAPABILITY } from './contracts/notification.contract';
import { ListNotifications } from './application/list-notifications';
import { NOTIFICATION_RECORD_REPOSITORY } from './application/notification-record-repository';
import { RecordNotification } from './application/record-notification';
import { DrizzleNotificationRepository } from './infrastructure/drizzle-notification.repository';
import { NotificationController } from './http/notification.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationController],
  providers: [
    DrizzleNotificationRepository,
    { provide: NOTIFICATION_RECORD_REPOSITORY, useExisting: DrizzleNotificationRepository },
    {
      provide: NOTIFICATION_CAPABILITY,
      useFactory: (repository: DrizzleNotificationRepository) => new RecordNotification(repository),
      inject: [NOTIFICATION_RECORD_REPOSITORY],
    },
    {
      provide: ListNotifications,
      useFactory: (repository: DrizzleNotificationRepository) => new ListNotifications(repository),
      inject: [NOTIFICATION_RECORD_REPOSITORY],
    },
  ],
  exports: [NOTIFICATION_CAPABILITY],
})
export class NotificationModule {}

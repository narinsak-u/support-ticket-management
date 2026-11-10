import { Inject, Injectable } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../../db/database.module';
import { notificationRecords } from '../../../db/schema';
import {
  NotificationRecordRepository,
} from '../application/record-notification';

const notificationSchema = { notificationRecords };

type NotificationRecord = Parameters<NotificationRecordRepository['save']>[0];

@Injectable()
export class DrizzleNotificationRepository implements NotificationRecordRepository {
  private readonly db: NodePgDatabase<typeof notificationSchema>;

  constructor(@Inject(DATABASE_POOL) pool: Pool) {
    this.db = drizzle(pool, { schema: notificationSchema });
  }

  async save(record: NotificationRecord): Promise<void> {
    await this.db.insert(notificationRecords).values(record);
  }
}

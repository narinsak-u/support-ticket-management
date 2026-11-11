import { Inject, Injectable } from '@nestjs/common';
import { count, desc } from 'drizzle-orm';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../../db/database.module';
import { notificationRecords } from '../../../db/schema';
import { NotificationListQuery, NotificationRecord, NotificationRecordRepository } from '../application/record-notification';

const notificationSchema = { notificationRecords };

@Injectable()
export class DrizzleNotificationRepository implements NotificationRecordRepository {
  private readonly db: NodePgDatabase<typeof notificationSchema>;

  constructor(@Inject(DATABASE_POOL) pool: Pool) {
    this.db = drizzle(pool, { schema: notificationSchema });
  }

  async save(record: NotificationRecord): Promise<void> {
    await this.db.insert(notificationRecords).values(record);
  }

  async list(query: NotificationListQuery): Promise<{ data: NotificationRecord[]; total: number }> {
    const [data, [{ total }]] = await Promise.all([
      this.db.select().from(notificationRecords)
        .orderBy(desc(notificationRecords.createdAt), desc(notificationRecords.id))
        .limit(query.limit).offset((query.page - 1) * query.limit),
      this.db.select({ total: count() }).from(notificationRecords),
    ]);
    return { data, total };
  }
}

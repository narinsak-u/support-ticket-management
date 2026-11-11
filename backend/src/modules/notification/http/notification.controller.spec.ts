import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { HttpErrorFilter } from '../../../common/http-exception.filter';
import { ListNotifications } from '../application/list-notifications';
import type { NotificationRecordRepository } from '../application/notification-record-repository';
import { NotificationController } from './notification.controller';
import { NotificationListQueryDto } from './notification-list-query.dto';

const records = [
  {
    id: '00000000-0000-4000-8000-000000000003',
    ticketId: '10000000-0000-4000-8000-000000000001',
    type: 'TICKET_CREATED' as const,
    message: 'Ticket assigned to FINANCE_TEAM',
    createdAt: new Date('2026-11-10T10:00:02.000Z'),
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    ticketId: '10000000-0000-4000-8000-000000000002',
    type: 'TICKET_CREATED' as const,
    message: 'Ticket assigned to ENGINEERING_TEAM',
    createdAt: new Date('2026-11-10T10:00:01.000Z'),
  },
  {
    id: '00000000-0000-4000-8000-000000000001',
    ticketId: '10000000-0000-4000-8000-000000000003',
    type: 'TICKET_CREATED' as const,
    message: 'Ticket assigned to SUPPORT_TEAM',
    createdAt: new Date('2026-11-10T10:00:01.000Z'),
  },
];

function createApp() {
  const repository: NotificationRecordRepository = {
    save: async () => {},
    list: async ({ page, limit }) => ({
      data: records.slice((page - 1) * limit, page * limit),
      total: records.length,
    }),
  };
  return Test.createTestingModule({
    controllers: [NotificationController],
    providers: [{ provide: ListNotifications, useValue: new ListNotifications(repository) }],
  }).compile().then(async (module) => {
    const app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpErrorFilter());
    Reflect.defineMetadata('design:paramtypes', [NotificationListQueryDto], NotificationController.prototype, 'list');
    await app.init();
    return app;
  });
}

describe('GET /api/v1/notifications', () => {
  it('returns the default page and total in descending creation order', async () => {
    const app = await createApp();
    try {
      await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            data: records.map((record) => ({ ...record, createdAt: record.createdAt.toISOString() })),
            pagination: { page: 1, limit: 5, total: 3 },
          });
        });
    } finally {
      await app.close();
    }
  });

  it('returns requested page and validates pagination bounds', async () => {
    const app = await createApp();
    try {
      await request(app.getHttpServer())
        .get('/api/v1/notifications?page=2&limit=1')
        .expect(200, {
          data: [{ ...records[1], createdAt: records[1].createdAt.toISOString() }],
          pagination: { page: 2, limit: 1, total: 3 },
        });
      await request(app.getHttpServer()).get('/api/v1/notifications?page=0').expect(400);
      await request(app.getHttpServer()).get('/api/v1/notifications?limit=101').expect(400);
    } finally {
      await app.close();
    }
  });

  it('returns pagination metadata when no records exist', async () => {
    const repository: NotificationRecordRepository = {
      save: async () => {},
      list: async () => ({ data: [], total: 0 }),
    };
    const module = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: ListNotifications, useValue: new ListNotifications(repository) }],
    }).compile();
    const app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    Reflect.defineMetadata('design:paramtypes', [NotificationListQueryDto], NotificationController.prototype, 'list');
    await app.init();
    try {
      await request(app.getHttpServer()).get('/api/v1/notifications').expect(200, {
        data: [],
        pagination: { page: 1, limit: 5, total: 0 },
      });
    } finally {
      await app.close();
    }
  });
});

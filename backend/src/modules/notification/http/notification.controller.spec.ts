import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { ListNotifications, NotificationRecordRepository } from '../application/record-notification';
import { NotificationController } from './notification.controller';

const records = [
  {
    id: '00000000-0000-4000-8000-000000000002',
    ticketId: '10000000-0000-4000-8000-000000000001',
    type: 'TICKET_CREATED' as const,
    message: 'Ticket assigned to FINANCE_TEAM',
    createdAt: new Date('2026-11-10T10:00:02.000Z'),
  },
  {
    id: '00000000-0000-4000-8000-000000000001',
    ticketId: '10000000-0000-4000-8000-000000000002',
    type: 'TICKET_CREATED' as const,
    message: 'Ticket assigned to ENGINEERING_TEAM',
    createdAt: new Date('2026-11-10T10:00:01.000Z'),
  },
];

describe('GET /api/v1/notifications', () => {
  it('returns recorded notification records in descending creation order', async () => {
    const repository: NotificationRecordRepository = {
      save: async () => {},
      findMany: async () => records,
    };
    const module = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: ListNotifications, useValue: new ListNotifications(repository) }],
    }).compile();
    const app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    try {
      await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            data: [
              { ...records[0], createdAt: records[0].createdAt.toISOString() },
              { ...records[1], createdAt: records[1].createdAt.toISOString() },
            ],
          });
        });
    } finally {
      await app.close();
    }
  });

  it('returns an empty data array when no records exist', async () => {
    const repository: NotificationRecordRepository = {
      save: async () => {},
      findMany: async () => [],
    };
    const module = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: ListNotifications, useValue: new ListNotifications(repository) }],
    }).compile();
    const app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    try {
      await request(app.getHttpServer()).get('/api/v1/notifications').expect(200, { data: [] });
    } finally {
      await app.close();
    }
  });
});

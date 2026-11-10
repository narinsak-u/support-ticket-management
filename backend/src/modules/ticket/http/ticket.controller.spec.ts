import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { describe, expect, it } from 'vitest';
import { HttpErrorFilter } from '../../../common/http-exception.filter';
import { DetermineTeam } from '../../routing/application/determine-team';
import { Ticket } from '../domain/ticket';
import { CreateTicket, GetTicket, ListTicketQuery, ListTickets, TicketRepository } from '../application/create-ticket';
import { CreateTicketDto } from './create-ticket.dto';
import { ListQueryDto } from './list-query.dto';
import { TicketController } from './ticket.controller';

function createApp() {
  const persisted: Ticket[] = [];
  const repository: TicketRepository = {
    save: async (ticket) => { persisted.push(ticket); },
    list: async ({ status, category, page, limit }: ListTicketQuery) => {
      const matches = persisted.filter((ticket) =>
        (!status || ticket.status === status) && (!category || ticket.category === category),
      ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id));
      return { tickets: matches.slice((page - 1) * limit, page * limit), total: matches.length };
    },
    findById: async (id) => persisted.find((ticket) => ticket.id === id),
  };
  const createTicket = new CreateTicket(
    repository,
    new DetermineTeam(),
    { recordTicketCreated: async () => {} },
    { error: () => {} },
  );
  Reflect.defineMetadata('design:paramtypes', [CreateTicketDto], TicketController.prototype, 'create');
  Reflect.defineMetadata('design:paramtypes', [ListQueryDto], TicketController.prototype, 'list');

  return Test.createTestingModule({
    controllers: [TicketController],
    providers: [
      { provide: CreateTicket, useValue: createTicket },
      { provide: ListTickets, useValue: new ListTickets(repository) },
      { provide: GetTicket, useValue: new GetTicket(repository) },
    ],
  }).compile().then(async (module) => {
    const app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
    return app;
  });
}

describe('Ticket HTTP API', () => {
  it('validates, routes, persists, and records notification for a created ticket', async () => {
    const app = await createApp();
    try {
      await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({ title: 'Cannot sign in', description: '', category: 'TECHNICAL', priority: 'HIGH' })
        .expect(201)
        .expect(({ body }) => {
          expect(body.assignedTeamCode).toBe('ENGINEERING_TEAM');
          expect(body.status).toBe('OPEN');
        });
      await request(app.getHttpServer()).get('/api/v1/tickets').expect(200).expect(({ body }) => {
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({ page: 1, limit: 20, total: 1 });
      });
      const created = await request(app.getHttpServer()).get('/api/v1/tickets');
      await request(app.getHttpServer()).get(`/api/v1/tickets/${created.body.data[0].id}`).expect(200).expect(({ body }) => {
        expect(body.title).toBe('Cannot sign in');
        expect(body.description).toBe('');
        expect(body.assignedTeamCode).toBe('ENGINEERING_TEAM');
      });
      await request(app.getHttpServer()).get('/api/v1/tickets/not-a-uuid').expect(400);
      await request(app.getHttpServer()).get('/api/v1/tickets/00000000-0000-4000-8000-000000000001').expect(404);
      await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({ title: '   ', description: '', category: 'TECHNICAL', priority: 'HIGH' })
        .expect(400);
      await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({ title: 'Valid', description: '', category: 'TECHNICAL', priority: 'HIGH', assignedTeamCode: 'SUPPORT_TEAM' })
        .expect(400);
    } finally {
      await app.close();
    }
  });
  it('filters matching status and category before applying pagination', async () => {
    const app = await createApp();
    try {
      for (const [title, category, priority] of [
        ['Technical one', 'TECHNICAL', 'HIGH'],
        ['Billing', 'BILLING', 'LOW'],
        ['Technical two', 'TECHNICAL', 'MEDIUM'],
      ]) {
        await request(app.getHttpServer()).post('/api/v1/tickets').send({
          title, description: '', category, priority,
        }).expect(201);
      }
      const firstPage = await request(app.getHttpServer())
        .get('/api/v1/tickets?status=OPEN&category=TECHNICAL&page=1&limit=1').expect(200);
      expect(firstPage.body.pagination).toEqual({ page: 1, limit: 1, total: 2 });

      const secondPage = await request(app.getHttpServer())
        .get('/api/v1/tickets?status=OPEN&category=TECHNICAL&page=2&limit=1').expect(200);
      const [first, second] = [firstPage.body.data[0], secondPage.body.data[0]];
      expect([first.title, second.title].sort()).toEqual(['Technical one', 'Technical two']);
      expect(first.createdAt > second.createdAt || (first.createdAt === second.createdAt && first.id > second.id)).toBe(true);
      const unfiltered = await request(app.getHttpServer())
        .get('/api/v1/tickets?category=&status=').expect(200);
      expect(unfiltered.body.pagination.total).toBe(3);
    } finally {
      await app.close();
    }
  });

  it.each(['page=0', 'page=1.5', 'page=nope', 'limit=0', 'limit=101', 'status=INVALID', 'category=OTHER'])(
    'rejects invalid list query %s',
    async (query) => {
      const app = await createApp();
      try {
        await request(app.getHttpServer()).get(`/api/v1/tickets?${query}`).expect(400);
      } finally {
        await app.close();
      }
    },
  );
});

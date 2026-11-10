import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { describe, expect, it } from 'vitest';
import { HttpErrorFilter } from '../../../common/http-exception.filter';
import { DetermineTeam } from '../../routing/application/determine-team';
import { Ticket } from '../domain/ticket';
import { CreateTicket } from '../application/create-ticket';
import { TicketController } from './ticket.controller';

describe('POST /api/v1/tickets', () => {
  it('validates, routes, persists, and records notification for a created ticket', async () => {
    const persisted: Ticket[] = [];
    const recordedNotifications: { ticketId: string; title: string; assignedTeamCode: string }[] = [];
    const createTicket = new CreateTicket(
      { save: async (ticket) => { persisted.push(ticket); } },
      new DetermineTeam(),
      { recordTicketCreated: async (notification) => { recordedNotifications.push(notification); } },
      { error: () => {} },
    );
    const module = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [{ provide: CreateTicket, useValue: createTicket }],
    }).compile();
    const app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
    try {
      await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({ title: 'Cannot sign in', description: '', category: 'TECHNICAL', priority: 'HIGH' })
        .expect(201)
        .expect(({ body }) => {
          expect(body.assignedTeamCode).toBe('ENGINEERING_TEAM');
          expect(body.status).toBe('OPEN');
        });
      expect(persisted).toHaveLength(1);
      expect(persisted[0].assignedTeamCode).toBe('ENGINEERING_TEAM');
      expect(recordedNotifications).toHaveLength(1);
      expect(recordedNotifications[0].assignedTeamCode).toBe('ENGINEERING_TEAM');

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
});

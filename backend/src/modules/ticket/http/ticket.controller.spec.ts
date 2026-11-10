import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { describe, expect, it, vi } from 'vitest';
import { HttpErrorFilter } from '../../../common/http-exception.filter';
import { Ticket } from '../domain/ticket';
import { CreateTicket } from '../application/create-ticket';
import { TicketController } from './ticket.controller';

const ticket = Ticket.create({ title: 'Cannot sign in', description: '', category: 'TECHNICAL', priority: 'HIGH', assignedTeamCode: 'ENGINEERING_TEAM' });

describe('POST /api/v1/tickets', () => {
  it('returns created ticket with backend assignment', async () => {
    const execute = vi.fn().mockResolvedValue(ticket);
    const module = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [{ provide: CreateTicket, useValue: { execute } }],
    }).compile();
    const app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
    try {
      await request(app.getHttpServer()).post('/api/v1/tickets').send({ title: 'Cannot sign in', description: '', category: 'TECHNICAL', priority: 'HIGH' }).expect(201)
        .expect(({ body }) => expect(body.assignedTeamCode).toBe('ENGINEERING_TEAM'));
      await request(app.getHttpServer()).post('/api/v1/tickets').send({ title: '   ', description: '', category: 'TECHNICAL', priority: 'HIGH' }).expect(400);
      await request(app.getHttpServer()).post('/api/v1/tickets').send({ title: 'Valid', description: '', category: 'TECHNICAL', priority: 'HIGH', assignedTeamCode: 'SUPPORT_TEAM' }).expect(400);
    } finally {
      await app.close();
    }
  });
});

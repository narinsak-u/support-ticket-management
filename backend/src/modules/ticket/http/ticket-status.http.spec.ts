import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { describe, expect, it } from 'vitest';
import { HttpErrorFilter } from '../../../common/http-exception.filter';
import { Ticket } from '../domain/ticket';
import { UpdateTicketStatus } from '../application/update-status';
import type { TicketRepository } from '../application/ticket-repository';
import { CreateTicket } from '../application/create-ticket';
import { GetTicket } from '../application/get-ticket';
import { ListTickets } from '../application/list-tickets';
import { StatusUpdateDto } from './status-update.dto';
import { TicketController } from './ticket.controller';

const id = '7f7c1b7e-8a3d-4f93-9aca-2c3d7a4d5c01';

async function createApp() {
  const state = {
    ticket: Ticket.reconstitute({ id, title: 'Cannot sign in', description: '', category: 'TECHNICAL',
      priority: 'HIGH', status: 'OPEN', assignedTeamCode: 'ENGINEERING_TEAM', createdAt: new Date('2026-01-01T00:00:00Z') }),
    concurrent: false,
  };
  const repository: TicketRepository = {
    save: async () => {},
    list: async () => ({ tickets: [], total: 0 }),
    findById: async (ticketId) => ticketId === id ? state.ticket : undefined,
    updateStatus: async (updated, expected) => {
      if (state.concurrent) {
        state.concurrent = false;
        state.ticket = state.ticket.transitionTo('IN_PROGRESS');
      }
      if (state.ticket.status !== expected) return false;
      state.ticket = updated;
      return true;
    },
  };
  Reflect.defineMetadata('design:paramtypes', [String, StatusUpdateDto], TicketController.prototype, 'updateStatusForTicket');
  const module = await Test.createTestingModule({
    controllers: [TicketController],
    providers: [
      { provide: CreateTicket, useValue: { execute: async () => undefined } },
      { provide: ListTickets, useValue: { execute: async () => ({ data: [], pagination: { page: 1, limit: 5, total: 0 } }) } },
      { provide: GetTicket, useValue: { execute: async () => undefined } },
      { provide: UpdateTicketStatus, useValue: new UpdateTicketStatus(repository) },
    ],
  }).compile();
  const app = module.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpErrorFilter());
  await app.init();
  return { app, state };
}

describe('Ticket status HTTP API', () => {
  it('advances OPEN to IN_PROGRESS to RESOLVED and rejects reopening', async () => {
    const { app, state } = await createApp();
    try {
      await request(app.getHttpServer()).patch(`/api/v1/tickets/${id}/status`)
        .send({ status: 'IN_PROGRESS' }).expect(200).expect(({ body }) => {
          expect(body.status).toBe('IN_PROGRESS');
          expect(body.assignedTeamCode).toBe('ENGINEERING_TEAM');
        });
      await request(app.getHttpServer()).patch(`/api/v1/tickets/${id}/status`)
        .send({ status: 'RESOLVED' }).expect(200);
      expect(state.ticket.status).toBe('RESOLVED');
      await request(app.getHttpServer()).patch(`/api/v1/tickets/${id}/status`)
        .send({ status: 'OPEN' }).expect(409).expect(({ body }) => {
          expect(body.error.code).toBe('INVALID_STATUS_TRANSITION');
        });
      expect(state.ticket.status).toBe('RESOLVED');
    } finally {
      await app.close();
    }
  });

  it('rejects a concurrent update instead of overwriting it', async () => {
    const { app, state } = await createApp();
    try {
      state.concurrent = true;
      await request(app.getHttpServer()).patch(`/api/v1/tickets/${id}/status`)
        .send({ status: 'IN_PROGRESS' }).expect(409).expect(({ body }) => {
          expect(body.error.code).toBe('CONFLICT');
        });
      expect(state.ticket.status).toBe('IN_PROGRESS');
    } finally {
      await app.close();
    }
  });

  it('rejects invalid input and reports missing tickets', async () => {
    const { app } = await createApp();
    try {
      await request(app.getHttpServer()).patch(`/api/v1/tickets/${id}/status`)
        .send({ status: 'RESOLVED' }).expect(409);
      await request(app.getHttpServer()).patch(`/api/v1/tickets/${id}/status`)
        .send({ status: 'UNKNOWN' }).expect(400).expect(({ body }) => expect(body.error.code).toBe('VALIDATION_ERROR'));
      await request(app.getHttpServer()).patch(`/api/v1/tickets/${id}/status`)
        .send({}).expect(400);
      await request(app.getHttpServer()).patch('/api/v1/tickets/not-a-uuid/status')
        .send({ status: 'IN_PROGRESS' }).expect(400);
      await request(app.getHttpServer()).patch('/api/v1/tickets/00000000-0000-4000-8000-000000000001/status')
        .send({ status: 'IN_PROGRESS' }).expect(404).expect(({ body }) => expect(body.error.code).toBe('NOT_FOUND'));
    } finally {
      await app.close();
    }
  });
});

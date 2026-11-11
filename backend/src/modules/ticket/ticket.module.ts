import type { NotificationCapability } from '../notification/contracts/notification.contract';
import type { RoutingCapability } from '../routing/contracts/routing.contract';
import type { TicketRepository } from './application/ticket-repository';
import { Logger, Module } from '@nestjs/common';
import { DatabaseModule } from '../../db/database.module';
import { NotificationModule } from '../notification/notification.module';
import { NOTIFICATION_CAPABILITY } from '../notification/contracts/notification.contract';
import { RoutingModule } from '../routing/routing.module';
import { ROUTING_CAPABILITY } from '../routing/contracts/routing.contract';
import { CreateTicket } from './application/create-ticket';
import { GetTicket } from './application/get-ticket';
import { ListTickets } from './application/list-tickets';
import { TICKET_REPOSITORY } from './application/ticket-repository';
import { UpdateTicketStatus } from './application/update-status';
import { DrizzleTicketRepository } from './infrastructure/drizzle-ticket.repository';
import { TicketSeeder } from './infrastructure/ticket-seeder';
import { TicketController } from './http/ticket.controller';

@Module({
  imports: [DatabaseModule, RoutingModule, NotificationModule],
  controllers: [TicketController],
  providers: [
    TicketSeeder,
    DrizzleTicketRepository,
    Logger,
    { provide: TICKET_REPOSITORY, useExisting: DrizzleTicketRepository },
    {
      provide: CreateTicket,
      useFactory: (tickets: TicketRepository, routing: RoutingCapability, notifications: NotificationCapability, logger: Logger) =>
        new CreateTicket(tickets, routing, notifications, logger),
      inject: [TICKET_REPOSITORY, ROUTING_CAPABILITY, NOTIFICATION_CAPABILITY, Logger],
    },
    { provide: ListTickets, useFactory: (tickets: TicketRepository) => new ListTickets(tickets), inject: [TICKET_REPOSITORY] },
    { provide: GetTicket, useFactory: (tickets: TicketRepository) => new GetTicket(tickets), inject: [TICKET_REPOSITORY] },
    {
      provide: UpdateTicketStatus,
      useFactory: (repository: TicketRepository) => new UpdateTicketStatus(repository),
      inject: [TICKET_REPOSITORY],
    },
  ],
})
export class TicketModule {}

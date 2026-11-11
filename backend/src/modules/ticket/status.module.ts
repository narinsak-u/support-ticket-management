import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../db/database.module';
import { UpdateTicketStatus } from './application/update-status';
import { TicketStatusController } from './http/status.controller';
import { DrizzleTicketStatusRepository } from './infrastructure/drizzle-ticket-status.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [TicketStatusController],
  providers: [
    DrizzleTicketStatusRepository,
    { provide: UpdateTicketStatus, useFactory: (repository: DrizzleTicketStatusRepository) => new UpdateTicketStatus(repository), inject: [DrizzleTicketStatusRepository] },
  ],
})
export class TicketStatusModule {}

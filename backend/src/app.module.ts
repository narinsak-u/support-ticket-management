import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TicketModule } from './modules/ticket/ticket.module';
import { TicketStatusModule } from './modules/ticket/status.module';

@Module({ imports: [TicketModule, TicketStatusModule], controllers: [HealthController] })
export class AppModule {}

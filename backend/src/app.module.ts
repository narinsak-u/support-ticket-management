import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TicketModule } from './modules/ticket/ticket.module';

@Module({ imports: [TicketModule], controllers: [HealthController] })
export class AppModule {}

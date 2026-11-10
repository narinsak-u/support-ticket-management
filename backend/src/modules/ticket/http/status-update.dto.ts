import { IsIn } from 'class-validator';
import { TicketStatus } from '../domain/ticket';

export class StatusUpdateDto {
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
  status!: TicketStatus;
}

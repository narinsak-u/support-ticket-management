import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { TicketStatus } from '../domain/ticket';

export class StatusUpdateDto {
  @ApiProperty({ type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] })
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
  status!: TicketStatus;
}

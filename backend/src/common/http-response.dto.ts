import { ApiProperty } from '@nestjs/swagger';
import { TEAM_CODES, TICKET_CATEGORIES, TICKET_PRIORITIES } from '../modules/ticket/domain/ticket';

export class TicketResponseDto {
  @ApiProperty({ type: String, format: 'uuid' }) id!: string;
  @ApiProperty({ type: String, maxLength: 150 }) title!: string;
  @ApiProperty({ type: String, maxLength: 2000 }) description!: string;
  @ApiProperty({ type: String, enum: TICKET_CATEGORIES }) category!: string;
  @ApiProperty({ type: String, enum: TICKET_PRIORITIES }) priority!: string;
  @ApiProperty({ type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] }) status!: string;
  @ApiProperty({ type: String, enum: TEAM_CODES }) assignedTeamCode!: string;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: string;
}

export class PaginationResponseDto {
  @ApiProperty({ type: Number, minimum: 1, example: 1 }) page!: number;
  @ApiProperty({ type: Number, minimum: 1, maximum: 100, example: 5 }) limit!: number;
  @ApiProperty({ type: Number, minimum: 0 }) total!: number;
}

export class TicketListResponseDto {
  @ApiProperty({ type: TicketResponseDto, isArray: true }) data!: TicketResponseDto[];
  @ApiProperty({ type: PaginationResponseDto }) pagination!: PaginationResponseDto;
}

export class NotificationResponseDto {
  @ApiProperty({ type: String, format: 'uuid' }) id!: string;
  @ApiProperty({ type: String, format: 'uuid' }) ticketId!: string;
  @ApiProperty({ type: String, enum: ['TICKET_CREATED'] }) type!: string;
  @ApiProperty({ type: String }) message!: string;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: string;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: NotificationResponseDto, isArray: true }) data!: NotificationResponseDto[];
  @ApiProperty({ type: PaginationResponseDto }) pagination!: PaginationResponseDto;
}

export class HealthResponseDto {
  @ApiProperty({ type: String, enum: ['ok'] }) status!: 'ok';
}

class ErrorDetailDto {
  @ApiProperty({ type: String, example: 'VALIDATION_ERROR' }) code!: string;
  @ApiProperty({ type: String }) message!: string;
}

export class ErrorEnvelopeDto {
  @ApiProperty({ type: ErrorDetailDto }) error!: ErrorDetailDto;
}

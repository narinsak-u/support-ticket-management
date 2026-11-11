import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches, MaxLength } from 'class-validator';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../domain/ticket';

export class CreateTicketDto {
  @ApiProperty({ type: String, maxLength: 150, minLength: 1, pattern: '\\S' })
  @IsString()
  @MaxLength(150)
  @Matches(/\S/)
  title!: string;

  @ApiProperty({ type: String, maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ type: String, enum: TICKET_CATEGORIES })
  @IsIn([...TICKET_CATEGORIES])
  category!: (typeof TICKET_CATEGORIES)[number];

  @ApiProperty({ type: String, enum: TICKET_PRIORITIES })
  @IsIn([...TICKET_PRIORITIES])
  priority!: (typeof TICKET_PRIORITIES)[number];
}

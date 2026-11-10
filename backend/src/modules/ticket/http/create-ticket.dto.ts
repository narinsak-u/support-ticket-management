import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches, MaxLength } from 'class-validator';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../domain/ticket';

export class CreateTicketDto {
  @ApiProperty({ maxLength: 150 })
  @IsString()
  @MaxLength(150)
  @Matches(/\S/)
  title!: string;

  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ enum: TICKET_CATEGORIES })
  @IsIn([...TICKET_CATEGORIES])
  category!: (typeof TICKET_CATEGORIES)[number];

  @ApiProperty({ enum: TICKET_PRIORITIES })
  @IsIn([...TICKET_PRIORITIES])
  priority!: (typeof TICKET_PRIORITIES)[number];
}

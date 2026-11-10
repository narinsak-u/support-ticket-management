import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TICKET_CATEGORIES } from '../domain/ticket';

const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

export class ListQueryDto {
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsIn(TICKET_STATUSES)
  status?: (typeof TICKET_STATUSES)[number];

  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsIn(TICKET_CATEGORIES)
  category?: (typeof TICKET_CATEGORIES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

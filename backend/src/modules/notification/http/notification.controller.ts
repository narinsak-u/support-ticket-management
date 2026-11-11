import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ListNotifications } from '../application/record-notification';
import { ErrorEnvelopeDto, NotificationListResponseDto } from '../../../common/http-response.dto';
import { NotificationListQueryDto } from './notification-list-query.dto';

@ApiBadRequestResponse({ type: ErrorEnvelopeDto })
@ApiTags('notifications')
@ApiInternalServerErrorResponse({ type: ErrorEnvelopeDto })
@Controller('notifications')
export class NotificationController {
  constructor(@Inject(ListNotifications) private readonly listNotifications: ListNotifications) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, minimum: 1, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 100, example: 5 })
  @ApiOkResponse({ description: 'Notification records ordered by creation time descending', type: NotificationListResponseDto })
  list(@Query() query: NotificationListQueryDto) {
    return this.listNotifications.execute(query);
  }
}

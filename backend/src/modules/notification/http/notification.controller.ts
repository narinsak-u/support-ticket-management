import { Controller, Get, Inject } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListNotifications } from '../application/record-notification';
import { ErrorEnvelopeDto, NotificationListResponseDto } from '../../../common/http-response.dto';

@ApiTags('notifications')
@ApiInternalServerErrorResponse({ type: ErrorEnvelopeDto })
@Controller('notifications')
export class NotificationController {
  constructor(@Inject(ListNotifications) private readonly listNotifications: ListNotifications) {}

  @Get()
  @ApiOkResponse({ description: 'Notification records ordered by creation time descending', type: NotificationListResponseDto })
  list() {
    return this.listNotifications.execute();
  }
}

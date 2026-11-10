import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListNotifications } from '../application/record-notification';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(@Inject(ListNotifications) private readonly listNotifications: ListNotifications) {}

  @Get()
  @ApiOkResponse({ description: 'Notification records ordered by creation time descending' })
  list() {
    return this.listNotifications.execute();
  }
}

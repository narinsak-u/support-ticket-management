import { Body, Controller, Inject, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { UpdateTicketStatus } from '../application/update-status';
import { StatusUpdateDto } from './status-update.dto';

@Controller('tickets')
export class TicketStatusController {
  constructor(@Inject(UpdateTicketStatus) private readonly updateStatus: UpdateTicketStatus) {}

  @Patch(':id/status')
  update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() input: StatusUpdateDto) {
    return this.updateStatus.execute(id, input.status);
  }
}

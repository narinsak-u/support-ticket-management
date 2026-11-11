import { Body, Controller, Inject, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ErrorEnvelopeDto, TicketResponseDto } from '../../../common/http-response.dto';
import { UpdateTicketStatus } from '../application/update-status';
import { StatusUpdateDto } from './status-update.dto';

@ApiTags('tickets')
@ApiBadRequestResponse({ type: ErrorEnvelopeDto })
@ApiNotFoundResponse({ type: ErrorEnvelopeDto })
@ApiConflictResponse({ type: ErrorEnvelopeDto })
@ApiInternalServerErrorResponse({ type: ErrorEnvelopeDto })
@Controller('tickets')
export class TicketStatusController {
  constructor(@Inject(UpdateTicketStatus) private readonly updateStatus: UpdateTicketStatus) {}

  @Patch(':id/status')
  @ApiBody({ type: StatusUpdateDto })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TicketResponseDto })
  update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() input: StatusUpdateDto) {
    return this.updateStatus.execute(id, input.status);
  }
}

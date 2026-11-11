import { Controller, Get } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ErrorEnvelopeDto, HealthResponseDto } from './common/http-response.dto';

@ApiTags('health')
@ApiInternalServerErrorResponse({ type: ErrorEnvelopeDto })
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}

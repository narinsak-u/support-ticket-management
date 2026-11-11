import { Module } from '@nestjs/common';
import { ROUTING_CAPABILITY } from './contracts/routing.contract';
import { DetermineTeam } from './application/determine-team';

@Module({
  providers: [{ provide: ROUTING_CAPABILITY, useClass: DetermineTeam }],
  exports: [ROUTING_CAPABILITY],
})
export class RoutingModule {}

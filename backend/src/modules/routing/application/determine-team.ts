import { Injectable } from '@nestjs/common';
import type { RoutingCapability } from '../contracts/routing.contract';
import { determineRoutingDecision } from '../domain/routing-policy';

@Injectable()
export class DetermineTeam implements RoutingCapability {
  async determineTeam(input: {
    category: string;
    priority: string;
  }): Promise<{ teamCode: string; reason: string }> {
    return determineRoutingDecision(input);
  }
}

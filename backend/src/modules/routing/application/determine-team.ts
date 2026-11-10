import type { RoutingCapability } from '../contracts/routing.contract';
import { determineRoutingDecision } from '../domain/routing-policy';

export class DetermineTeam implements RoutingCapability {
  async determineTeam(input: {
    category: string;
    priority: string;
  }): Promise<{ teamCode: string; reason: string }> {
    return determineRoutingDecision(input);
  }
}

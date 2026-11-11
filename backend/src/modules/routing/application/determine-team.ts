import type { RouteTicketInput, RoutingCapability, RoutingDecision } from '../contracts/routing.contract';
import { determineRoutingDecision } from '../domain/routing-policy';

export class DetermineTeam implements RoutingCapability {
  async determineTeam(input: RouteTicketInput): Promise<RoutingDecision> {
    return determineRoutingDecision(input);
  }
}

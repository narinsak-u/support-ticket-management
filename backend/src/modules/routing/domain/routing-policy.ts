import type { RouteTicketInput, RoutingDecision } from '../contracts/routing.contract';

export function determineRoutingDecision({
  category,
  priority,
}: RouteTicketInput): RoutingDecision {
  if (priority === 'CRITICAL') {
    return { teamCode: 'INCIDENT_TEAM', reason: 'CRITICAL priority' };
  }

  switch (category) {
    case 'TECHNICAL':
      return { teamCode: 'ENGINEERING_TEAM', reason: 'TECHNICAL category' };
    case 'BILLING':
      return { teamCode: 'FINANCE_TEAM', reason: 'BILLING category' };
    case 'GENERAL':
      return { teamCode: 'SUPPORT_TEAM', reason: 'GENERAL category' };
    default:
      throw new Error(`Unsupported ticket category: ${category}`);
  }
}

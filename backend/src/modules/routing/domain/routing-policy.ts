export interface RoutingDecision {
  teamCode: string;
  reason: string;
}

export function determineRoutingDecision({
  category,
  priority,
}: {
  category: string;
  priority: string;
}): RoutingDecision {
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

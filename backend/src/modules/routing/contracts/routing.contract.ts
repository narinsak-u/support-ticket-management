type TicketCategory = 'TECHNICAL' | 'BILLING' | 'GENERAL';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type TeamCode = 'INCIDENT_TEAM' | 'ENGINEERING_TEAM' | 'FINANCE_TEAM' | 'SUPPORT_TEAM';

export const ROUTING_CAPABILITY = Symbol('ROUTING_CAPABILITY');

export interface RouteTicketInput {
  category: TicketCategory;
  priority: TicketPriority;
}

export interface RoutingDecision {
  teamCode: TeamCode;
  reason: string;
}

export interface RoutingCapability {
  determineTeam(input: RouteTicketInput): Promise<RoutingDecision>;
}

export const ROUTING_CAPABILITY = Symbol('ROUTING_CAPABILITY');

export interface RoutingCapability {
  determineTeam(input: {
    category: string;
    priority: string;
  }): Promise<{ teamCode: string; reason: string }>;
}

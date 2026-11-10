import { describe, expect, it } from 'vitest';
import { DetermineTeam } from '../application/determine-team';

describe('Routing capability', () => {
  const routing = new DetermineTeam();

  it.each([
    ['TECHNICAL', 'HIGH', 'ENGINEERING_TEAM'],
    ['BILLING', 'MEDIUM', 'FINANCE_TEAM'],
    ['GENERAL', 'LOW', 'SUPPORT_TEAM'],
  ])('routes %s with %s priority to %s', async (category, priority, teamCode) => {
    await expect(routing.determineTeam({ category, priority })).resolves.toMatchObject({ teamCode });
  });

  it.each(['TECHNICAL', 'BILLING', 'GENERAL'])('routes CRITICAL %s tickets to INCIDENT_TEAM', async (category) => {
    await expect(routing.determineTeam({ category, priority: 'CRITICAL' })).resolves.toMatchObject({
      teamCode: 'INCIDENT_TEAM',
    });
  });
});

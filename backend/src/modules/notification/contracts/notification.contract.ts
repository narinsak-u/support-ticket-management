export const NOTIFICATION_CAPABILITY = Symbol('NOTIFICATION_CAPABILITY');

export interface NotificationCapability {
  recordTicketCreated(input: {
    ticketId: string;
    title: string;
    assignedTeamCode: string;
  }): Promise<void>;
}

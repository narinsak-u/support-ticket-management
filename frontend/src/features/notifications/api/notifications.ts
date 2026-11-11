type NotificationRecord = {
  id: string;
  ticketId: string;
  type: string;
  message: string;
  createdAt: string;
};

export async function getNotifications(): Promise<{
  data: NotificationRecord[];
}> {
  const response = await fetch("/api/v1/notifications");
  if (!response.ok) throw new Error("Could not load notifications. Try again.");
  return response.json() as Promise<{ data: NotificationRecord[] }>;
}

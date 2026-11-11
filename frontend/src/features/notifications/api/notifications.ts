import { apiUrl } from '../../../shared/api/client';

type NotificationRecord = {
  id: string;
  ticketId: string;
  type: string;
  message: string;
  createdAt: string;
};

export async function getNotifications(page: number, limit: number): Promise<{
  data: NotificationRecord[];
  pagination: { page: number; limit: number; total: number };
}> {
  const response = await fetch(
    apiUrl(`/api/v1/notifications?page=${page}&limit=${limit}`),
  );
  if (!response.ok) throw new Error("Could not load notifications. Try again.");
  return response.json();
}

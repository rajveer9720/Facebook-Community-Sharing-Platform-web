export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  type: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  items: NotificationItem[];
}

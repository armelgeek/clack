export type TNotification = {
  id: string;
  type: string;
  platform: string;
  data: Record<string, any>;
  isRead: boolean;
  isSeen: boolean;
  userId: string;
  redirectUrl: string;
  createdAt: Date;
};

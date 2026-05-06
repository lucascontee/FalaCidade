import api from './api';

export interface Notification {
  id: number;
  occurrenceId: number;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const NotificationService = {
    getAllByUser: async (userId: number): Promise<Notification[]> => {
        const response = await api.get<Notification[]>(`/api/notification/user/${userId}`);
        return response.data;
    },

    getUnread: async (userId: number): Promise<Notification[]> => {
        const response = await api.get<Notification[]>(`/api/notification/user/${userId}/unread`);
        return response.data;
    },

    markAsRead: async (notificationId: number): Promise<void> => {
        await api.patch(`/api/notification/${notificationId}/read`);
    }
};

export default NotificationService;
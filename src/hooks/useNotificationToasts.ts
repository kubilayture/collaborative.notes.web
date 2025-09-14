import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useWebSocket } from './useWebSocket';
import { useSession } from '../lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';

// Match the backend notification structure
export interface NotificationData {
  id: string;
  userId: string;
  type: 'friend_request' | 'friend_accepted' | 'note_shared' | 'note_invitation' | 'new_message' | 'note_comment' | 'note_updated';
  title: string;
  message: string;
  data: Record<string, any> | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const useNotificationToasts = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { on, off } = useWebSocket();
  const queryClient = useQueryClient();


  const getPersonalizedMessage = (notification: NotificationData): string => {
    const { type, data, message } = notification;

    // Use the message from the backend as the primary source
    if (message) {
      return message;
    }

    // Fallback to generic messages if no specific message
    const userName = data?.userName || data?.fromUserName || 'Someone';

    switch (type) {
      case 'friend_request':
        return `${userName} sent you a friend request`;
      case 'friend_accepted':
        return `${userName} accepted your friend request`;
      case 'new_message':
        return `New message from ${userName}`;
      case 'note_invitation': {
        const noteTitle = data?.noteTitle ? ` to "${data.noteTitle}"` : '';
        return `${userName} invited you${noteTitle}`;
      }
      case 'note_shared': {
        const sharedNoteTitle = data?.noteTitle ? ` "${data.noteTitle}"` : ' a note';
        return `${userName} shared${sharedNoteTitle} with you`;
      }
      case 'note_comment': {
        const commentNoteTitle = data?.noteTitle ? ` on "${data.noteTitle}"` : '';
        return `${userName} commented${commentNoteTitle}`;
      }
      case 'note_updated': {
        const updatedNoteTitle = data?.noteTitle ? ` "${data.noteTitle}"` : ' a shared note';
        return `${userName} updated${updatedNoteTitle}`;
      }
      default:
        return notification.title;
    }
  };

  const getRedirectUrl = (notification: NotificationData): string => {
    const { type, data } = notification;

    switch (type) {
      case 'friend_request':
        return '/friends';
      case 'friend_accepted':
        return '/friends';
      case 'new_message':
        if (data?.threadId) {
          return `/messaging/${data.threadId}`;
        }
        return '/messaging';
      case 'note_invitation':
        if (data?.invitationId) {
          return `/invitations/${data.invitationId}`;
        }
        return '/invitations';
      case 'note_shared':
      case 'note_comment':
      case 'note_updated':
        if (data?.noteId) {
          return `/notes/${data.noteId}`;
        }
        return '/notes';
      default:
        return '/';
    }
  };

  const invalidateQueriesAndNavigate = (notification: NotificationData) => {
    const { type } = notification;
    const redirectUrl = getRedirectUrl(notification);

    // Invalidate relevant queries based on notification type
    switch (type) {
      case 'friend_request':
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        queryClient.invalidateQueries({ queryKey: ['friends', 'pending'] });
        queryClient.invalidateQueries({ queryKey: ['friends', 'sent'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] });
        break;
      case 'friend_accepted':
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        queryClient.invalidateQueries({ queryKey: ['friends', 'pending'] });
        queryClient.invalidateQueries({ queryKey: ['friends', 'sent'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] });
        break;
      case 'new_message':
        queryClient.invalidateQueries({ queryKey: ['messaging', 'threads'] });
        if (notification.data?.threadId) {
          queryClient.invalidateQueries({ queryKey: ['messaging', 'threads', notification.data.threadId, 'messages'] });
          queryClient.invalidateQueries({ queryKey: ['messaging', 'threads', notification.data.threadId] });
        }
        queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] });
        break;
      case 'note_invitation':
        queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
        queryClient.invalidateQueries({ queryKey: ['invitations'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] });
        break;
      case 'note_shared':
      case 'note_comment':
      case 'note_updated':
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        if (notification.data?.noteId) {
          queryClient.invalidateQueries({ queryKey: ['notes', notification.data.noteId] });
        }
        queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] });
        break;
      default:
        queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] });
        break;
    }

    // Navigate to the appropriate page
    navigate(redirectUrl);
  };


  useEffect(() => {
    if (!session?.user) return;

    const handleNotificationReceived = (notification: NotificationData) => {
      console.log('Received notification:', notification);

      const personalizedMessage = getPersonalizedMessage(notification);

      toast(notification.title, {
        description: personalizedMessage,
        action: {
          label: 'View',
          onClick: () => {
            invalidateQueriesAndNavigate(notification);
          },
        },
        duration: 6000,
        dismissible: true,
      });
    };

    // Listen for the actual notification event emitted by the backend
    on('notification:new', handleNotificationReceived);

    return () => {
      // Clean up event listener
      off('notification:new', handleNotificationReceived);
    };
  }, [session?.user, on, off, navigate, queryClient]);

  return {};
};
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api";

export interface ThreadParticipant {
  user: {
    id: string;
    name: string;
    email: string;
  };
  joinedAt: string;
  lastReadAt: string | null;
}

export interface MessageThread {
  id: string;
  name: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  participants: ThreadParticipant[];
  lastMessageContent: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  threadId: string;
  replyToId: string | null;
  isEdited: boolean;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  replyTo?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadData {
  name: string;
  participantIds: string[];
  initialMessage?: string;
}

export interface SendMessageData {
  content: string;
  replyToId?: string;
}

export interface MessagesListResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const useThreads = () => {
  return useQuery({
    queryKey: ["messaging", "threads"],
    queryFn: async (): Promise<MessageThread[]> => {
      const response = await api.get<MessageThread[]>("/messaging/threads");
      return response.data || [];
    },
  });
};

export const useThread = (threadId: string | undefined) => {
  return useQuery({
    queryKey: ["messaging", "threads", threadId],
    queryFn: async (): Promise<MessageThread> => {
      if (!threadId) throw new Error("Thread ID is required");
      const response = await api.get<MessageThread>(`/messaging/threads/${threadId}`);
      return response.data;
    },
    enabled: !!threadId,
  });
};

export const useMessages = (threadId: string | undefined) => {
  return useQuery({
    queryKey: ["messaging", "threads", threadId, "messages"],
    queryFn: async (): Promise<Message[]> => {
      if (!threadId) throw new Error("Thread ID is required");
      const response = await api.get<MessagesListResponse>(`/messaging/threads/${threadId}/messages`);
      return response.data.messages;
    },
    enabled: !!threadId,
  });
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateThreadData): Promise<MessageThread> => {
      const response = await api.post<MessageThread>("/messaging/threads", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "threads"] });
      toast.success("Message thread created successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create thread";
      toast.error(errorMessage);
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, data }: { threadId: string; data: SendMessageData }): Promise<Message> => {
      const response = await api.post<Message>(`/messaging/threads/${threadId}/messages`, data);
      return response.data;
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "threads"] });
      queryClient.invalidateQueries({ queryKey: ["messaging", "threads", threadId, "messages"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send message";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }): Promise<Message> => {
      const response = await api.put<Message>(`/messaging/messages/${messageId}`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging"] });
      toast.success("Message updated successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update message";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string): Promise<void> => {
      await api.delete(`/messaging/messages/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging"] });
      toast.success("Message deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete message";
      toast.error(errorMessage);
    },
  });
};

export const useAddParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, participantId }: { threadId: string; participantId: string }): Promise<void> => {
      await api.post(`/messaging/threads/${threadId}/participants/${participantId}`);
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "threads"] });
      queryClient.invalidateQueries({ queryKey: ["messaging", "threads", threadId] });
      toast.success("Participant added successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to add participant";
      toast.error(errorMessage);
    },
  });
};

export const useLeaveThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string): Promise<void> => {
      await api.delete(`/messaging/threads/${threadId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "threads"] });
      toast.success("Left thread successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to leave thread";
      toast.error(errorMessage);
    },
  });
};
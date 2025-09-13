import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useWebSocket } from "./useWebSocket";

export interface NotificationCounts {
  invitations: number;
  messages: number;
  friends: number;
  byType: Record<string, number>;
}

export const useNotificationCounts = () => {
  const queryClient = useQueryClient();
  const { on, off } = useWebSocket();

  const query = useQuery({
    queryKey: ["notifications", "counts"],
    queryFn: async (): Promise<NotificationCounts> => {
      const res = await api.get<NotificationCounts>("/notifications/counts");
      return res.data;
    },
    staleTime: 10_000,
  });

  useEffect(() => {
    const handleCounts = (data: NotificationCounts) => {
      queryClient.setQueryData(["notifications", "counts"], data);
    };
    on("notification:counts", handleCounts);
    return () => {
      off("notification:counts", handleCounts);
    };
  }, [on, off, queryClient]);

  return query;
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (type?: string) => {
      await api.post("/notifications/mark-all-read", { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
    },
  });
};

export const useMarkThreadMessagesRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      await api.post(`/notifications/messages/read-thread/${threadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
    },
  });
};

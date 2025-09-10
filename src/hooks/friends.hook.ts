import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api";

export interface Friend {
  friend: {
    id: string;
    name: string;
    email: string;
  };
  friendsSince: string;
  isOnline: boolean;
  lastSeenAt: string | null;
}

export interface FriendsListResponse {
  friends: Friend[];
  total: number;
}

export interface FriendRequest {
  id: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  addressee: {
    id: string;
    name: string;
    email: string;
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface SendFriendRequestData {
  email: string;
}

export const useFriends = () => {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async (): Promise<Friend[]> => {
      const response = await api.get<FriendsListResponse>("/friends");
      return response.data.friends;
    },
  });
};

export const usePendingRequests = () => {
  return useQuery({
    queryKey: ["friends", "pending"],
    queryFn: async (): Promise<FriendRequest[]> => {
      const response = await api.get<FriendRequest[]>("/friends/requests/received");
      return response.data;
    },
  });
};

export const useSentRequests = () => {
  return useQuery({
    queryKey: ["friends", "sent"],
    queryFn: async (): Promise<FriendRequest[]> => {
      const response = await api.get<FriendRequest[]>("/friends/requests/sent");
      return response.data;
    },
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendFriendRequestData): Promise<FriendRequest> => {
      const response = await api.post<FriendRequest>("/friends/request", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends", "sent"] });
      toast.success("Friend request sent successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send friend request";
      toast.error(errorMessage);
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string): Promise<Friend> => {
      const response = await api.post<Friend>(`/friends/${requestId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["friends", "sent"] });
      toast.success("Friend request accepted");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to accept friend request";
      toast.error(errorMessage);
    },
  });
};

export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string): Promise<void> => {
      await api.post(`/friends/${requestId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["friends", "sent"] });
      toast.success("Friend request declined");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to decline friend request";
      toast.error(errorMessage);
    },
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId: string): Promise<void> => {
      await api.delete(`/friends/${friendId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend removed successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to remove friend";
      toast.error(errorMessage);
    },
  });
};
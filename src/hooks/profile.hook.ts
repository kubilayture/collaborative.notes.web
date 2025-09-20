import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api";

export interface UserProfile {
  id: string;
  userId: string;
  username: string | null;
  bio: string | null;
  avatar: string | null;
  timezone: string | null;
  preferences: Record<string, any> | null;
  lastSeenAt: Date | null;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CombinedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar?: string;
  timezone?: string;
  preferences?: Record<string, any>;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async (): Promise<CombinedUser> => {
      const response = await api.get("/users/me");
      return response.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<UserProfile> => {
      const response = await api.patch("/users/me/profile", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    },
  });
}
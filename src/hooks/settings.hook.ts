import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api";

export interface UserSettings {
  id: string;
  userId: string;
  theme: string | null;
  language: string | null;
  emailNotifications: boolean;
  pushNotifications: boolean;
  desktopNotifications: boolean;
  soundNotifications: boolean;
  autoSaveInterval: number;
  defaultEditorMode: string;
  showLineNumbers: boolean;
  wordWrap: boolean;
  additionalSettings: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSettingsData {
  theme?: "light" | "dark" | "system";
  language?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  desktopNotifications?: boolean;
  soundNotifications?: boolean;
  autoSaveInterval?: number;
  defaultEditorMode?: "rich" | "markdown" | "plain";
  showLineNumbers?: boolean;
  wordWrap?: boolean;
  additionalSettings?: Record<string, any>;
}

export function useUserSettings() {
  return useQuery({
    queryKey: ["users", "me", "settings"],
    queryFn: async (): Promise<UserSettings> => {
      const response = await api.get("/users/me/settings");
      return response.data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSettingsData): Promise<UserSettings> => {
      const response = await api.patch("/users/me/settings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me", "settings"] });
      toast.success("Settings updated successfully!");
    },
    onError: (error) => {
      console.error("Settings update error:", error);
      toast.error("Failed to update settings");
    },
  });
}
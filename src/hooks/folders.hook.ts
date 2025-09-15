import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api";

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  ownerId: string;
  parentId?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  noteCount?: number;
  subfolderCount?: number;
}

export interface CreateFolderData {
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
}

export interface UpdateFolderData {
  name?: string;
  description?: string;
  color?: string;
  parentId?: string;
}

export interface MoveNoteData {
  folderId?: string | null;
}

async function fetchFolders(parentId?: string): Promise<Folder[]> {
  const params = parentId ? { parentId } : {};
  const response = await api.get<Folder[]>("/folders", { params });
  return response.data;
}

async function createFolder(data: CreateFolderData): Promise<Folder> {
  const response = await api.post<Folder>("/folders", data);
  return response.data;
}

async function updateFolder(
  id: string,
  data: UpdateFolderData
): Promise<Folder> {
  const response = await api.patch<Folder>(`/folders/${id}`, data);
  return response.data;
}

async function deleteFolder(id: string): Promise<void> {
  await api.delete(`/folders/${id}`);
}

async function moveNote(noteId: string, data: MoveNoteData): Promise<any> {
  const response = await api.patch(`/notes/${noteId}/move`, data);
  return response.data;
}

async function getFolderPath(folderId: string): Promise<Folder[]> {
  const response = await api.get<Folder[]>(`/folders/${folderId}/path`);
  return response.data;
}

export function useFolders(parentId?: string) {
  return useQuery({
    queryKey: ["folders", parentId],
    queryFn: () => fetchFolders(parentId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllFolders() {
  return useQuery({
    queryKey: ["folders", "all"],
    queryFn: async (): Promise<Folder[]> => {
      // Get all folders by fetching all levels
      // For simplicity, we'll use the same endpoint but fetch recursively
      const getAllFoldersRecursive = async (
        parentId?: string
      ): Promise<Folder[]> => {
        const folders = await fetchFolders(parentId);
        const allFolders = [...folders];

        // Recursively fetch subfolders
        for (const folder of folders) {
          const subfolders = await getAllFoldersRecursive(folder.id);
          allFolders.push(...subfolders);
        }

        return allFolders;
      };

      return getAllFoldersRecursive();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create folder";
      toast.error(errorMessage);
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderData }) =>
      updateFolder(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to perform operation";
      toast.error(errorMessage);
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Folder deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to perform operation";
      toast.error(errorMessage);
    },
  });
}

export function useMoveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: MoveNoteData }) =>
      moveNote(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Note moved successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to perform operation";
      toast.error(errorMessage);
    },
  });
}

export function useFolderPath(folderId?: string) {
  return useQuery({
    queryKey: ["folder-path", folderId],
    queryFn: () => getFolderPath(folderId!),
    enabled: !!folderId,
    staleTime: 5 * 60 * 1000,
  });
}

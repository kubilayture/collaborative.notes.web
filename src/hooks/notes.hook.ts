import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../lib/api";

// Utility functions for content transformation
const textToContent = (text: string): NoteContent => ({
  type: "text",
  data: text,
});

export const contentToText = (content: NoteContent): string => {
  if (!content) return "";
  if (content.type === "text" && typeof content.data === "string") {
    return content.data;
  }
  // For rich text formats, we might need different extraction logic
  if (typeof content.data === "string") return content.data;
  return JSON.stringify(content.data); // Fallback for complex objects
};

export interface NoteContent {
  type: "text" | "delta" | "prosemirror" | "markdown";
  data: any; // string for text, object for rich formats
}

export interface Note {
  id: string;
  title: string;
  content: NoteContent;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  permissions: Array<{
    id: string;
    permission: "READ" | "WRITE";
    userId: string;
    grantedById: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface CreateNoteRequest {
  title: string;
  content: string; // This will be converted to NoteContent structure
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string; // This will be converted to NoteContent structure
}

export interface PaginatedNotesResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useNotes = () => {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async (): Promise<Note[]> => {
      const response = await api.get<PaginatedNotesResponse>("/notes");
      return response.data.notes;
    },
  });
};

export const useNote = (noteId: string) => {
  return useQuery({
    queryKey: ["notes", noteId],
    queryFn: async (): Promise<Note> => {
      const response = await api.get<Note>(`/notes/${noteId}`);
      return response.data;
    },
    enabled: !!noteId,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: CreateNoteRequest): Promise<Note> => {
      const payload = {
        title: data.title,
        content: textToContent(data.content),
      };

      const response = await api.post<Note>("/notes", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created successfully");
      navigate("/notes");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create note";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateNoteRequest }): Promise<Note> => {
      const payload: any = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.content !== undefined) payload.content = textToContent(data.content);

      const response = await api.patch<Note>(`/notes/${id}`, payload);
      return response.data;
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", note.id] });
      toast.success("Note updated successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update note";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (noteId: string): Promise<void> => {
      await api.delete(`/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted successfully");
      navigate("/notes");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete note";
      toast.error(errorMessage);
    },
  });
};
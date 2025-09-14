import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../lib/api";

// Utility functions for content transformation
const textToContent = (text: string): NoteContent => {
  // Check if the text contains HTML formatting
  if (text.includes("<") && text.includes(">")) {
    return {
      type: "prosemirror",
      data: text, // Store HTML directly for rich content
    };
  }
  return {
    type: "text",
    data: text,
  };
};

const stripHtmlTags = (html: string): string => {
  if (typeof window !== "undefined") {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  }
  return html.replace(/<[^>]*>/g, "").trim();
};

export const contentToText = (content: NoteContent): string => {
  if (!content) return "";

  let rawContent = "";
  if (content.type === "prosemirror" && typeof content.data === "string") {
    // For rich content (HTML), return it as-is for the editor
    return content.data;
  } else if (content.type === "text" && typeof content.data === "string") {
    rawContent = content.data;
  } else if (typeof content.data === "string") {
    rawContent = content.data;
  } else {
    rawContent = JSON.stringify(content.data); // Fallback for complex objects
  }

  return rawContent;
};

// Function to get plain text for display purposes (like in lists)
export const contentToPlainText = (content: NoteContent): string => {
  if (!content) return "";

  if (content.type === "prosemirror" && typeof content.data === "string") {
    // For rich content, strip HTML for plain text display
    return stripHtmlTags(content.data);
  } else if (content.type === "text" && typeof content.data === "string") {
    return content.data;
  } else if (typeof content.data === "string") {
    return content.data;
  } else {
    return JSON.stringify(content.data);
  }
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
  folderId?: string | null;
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
  folderId?: string;
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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create note";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateNoteRequest;
    }): Promise<Note> => {
      const payload: any = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.content !== undefined)
        payload.content = textToContent(data.content);

      const response = await api.patch<Note>(`/notes/${id}`, payload);
      return response.data;
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", note.id] });
      toast.success("Note updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update note";
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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete note";
      toast.error(errorMessage);
    },
  });
};

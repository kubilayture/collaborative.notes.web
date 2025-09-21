import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Note } from "./notes.hook";
import type { MessageThread, Message } from "./messaging.hook";
import { useDebouncedSearch } from "./use-debounced-search";

export interface User {
  id: string;
  name: string;
  email: string;
  profile?: {
    avatar?: string;
    bio?: string;
  };
}

export interface SearchResults {
  notes?: Note[];
  messages?: Message[];
  threads?: MessageThread[];
  users?: User[];
}

// Search notes
export const useSearchNotes = (query: string, enabled: boolean = true) => {
  const debouncedQuery = useDebouncedSearch(query, 300);

  return useQuery({
    queryKey: ["search", "notes", debouncedQuery],
    queryFn: async (): Promise<Note[]> => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) return [];

      const response = await api.get("/notes", {
        params: { search: debouncedQuery.trim(), limit: 20 },
      });
      return response.data.notes || [];
    },
    enabled: enabled && !!debouncedQuery && debouncedQuery.trim().length >= 2,
    staleTime: 30000, // 30 seconds
  });
};

// Search messages and threads
export const useSearchMessages = (query: string, enabled: boolean = true) => {
  const debouncedQuery = useDebouncedSearch(query, 300);

  return useQuery({
    queryKey: ["search", "messages", debouncedQuery],
    queryFn: async (): Promise<{
      threads: MessageThread[];
      messages: Message[];
    }> => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2)
        return { threads: [], messages: [] };

      const response = await api.get("/messaging/search", {
        params: { q: debouncedQuery.trim(), limit: 20 },
      });
      return response.data;
    },
    enabled: enabled && !!debouncedQuery && debouncedQuery.trim().length >= 2,
    staleTime: 30000, // 30 seconds
  });
};

// Search users (for friends page)
export const useSearchUsers = (query: string, enabled: boolean = true) => {
  const debouncedQuery = useDebouncedSearch(query, 300);

  return useQuery({
    queryKey: ["search", "users", debouncedQuery],
    queryFn: async (): Promise<User[]> => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) return [];

      const response = await api.get("/users/search", {
        params: { q: debouncedQuery.trim(), limit: 20 },
      });
      return response.data;
    },
    enabled: enabled && !!debouncedQuery && debouncedQuery.trim().length >= 2,
    staleTime: 30000, // 30 seconds
  });
};

// Universal search hook that adapts based on context
export const useGlobalSearch = (
  query: string,
  context: "notes" | "messaging" | "friends" | "invitations" | "all"
) => {
  const debouncedQuery = useDebouncedSearch(query, 300);

  const notesSearch = useSearchNotes(
    debouncedQuery,
    context === "notes" || context === "all"
  );
  const messagesSearch = useSearchMessages(
    debouncedQuery,
    context === "messaging" || context === "all"
  );
  const usersSearch = useSearchUsers(
    debouncedQuery,
    context === "friends" || context === "all"
  );

  const isLoading =
    ((context === "notes" || context === "all") && notesSearch.isLoading) ||
    ((context === "messaging" || context === "all") &&
      messagesSearch.isLoading) ||
    ((context === "friends" || context === "all") && usersSearch.isLoading);

  const results: SearchResults = {};

  if (context === "notes" || context === "all") {
    results.notes = notesSearch.data || [];
  }

  if (context === "messaging" || context === "all") {
    results.messages = messagesSearch.data?.messages || [];
    results.threads = messagesSearch.data?.threads || [];
  }

  if (context === "friends" || context === "all") {
    results.users = usersSearch.data || [];
  }

  return {
    results,
    isLoading,
    error: notesSearch.error || messagesSearch.error || usersSearch.error,
  };
};

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth-client";
import { EditorToolbar } from "./EditorToolbar";

interface CollaborativeEditorProps {
  noteId: string;
  initialContent?: string;
  editable?: boolean;
  onUpdate?: (content: string) => void;
}

// Helper function to generate consistent colors based on user ID
function generateUserColor(userId: string): string {
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#96CEB4", // Green
    "#FFEAA7", // Yellow
    "#DDA0DD", // Plum
    "#98D8C8", // Mint
    "#F7DC6F", // Light Yellow
    "#BB8FCE", // Light Purple
    "#85C1E9", // Light Blue
    "#F8C471", // Orange
    "#82E0AA", // Light Green
  ];

  // Generate a hash from user ID for consistent color assignment
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
  }

  return colors[Math.abs(hash) % colors.length];
}

// Helper function to get initials from name
function getInitials(name: string): string {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  // Get first letter of first name and first letter of last name
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function CollaborativeEditor({
  noteId,
  initialContent = "",
  editable = true,
  onUpdate,
}: CollaborativeEditorProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [doc] = useState(() => new Y.Doc());
  const [isProviderReady, setIsProviderReady] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user || !noteId) return;

    const hocuspocusProvider = new HocuspocusProvider({
      url: import.meta.env.VITE_COLLABORATION_URL || "ws://localhost:8080",
      name: noteId,
      document: doc,
      token: session.user.id,
    });

    setProvider(hocuspocusProvider);
    setIsProviderReady(true);

    hocuspocusProvider.on("status", ({ status }: { status: string }) => {
      setIsConnected(status === "connected");
    });

    hocuspocusProvider.on("connect", () => {
      setIsConnected(true);
    });

    hocuspocusProvider.on("disconnect", () => {
      setIsConnected(false);
    });

    hocuspocusProvider.on("synced", () => {
      setIsSynced(true);
    });

    return () => {
      hocuspocusProvider.destroy();
      setProvider(null);
      setIsProviderReady(false);
      setHasSeeded(false);
      setIsSynced(false);
      setIsConnected(false);
    };
  }, [session, noteId, doc, queryClient]);

  const extensions = useMemo(() => {
    const baseExtensions: any[] = [
      StarterKit.configure({
        history: {
          depth: 10,
          newGroupDelay: 500,
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-md bg-muted p-4 font-mono text-sm",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-muted-foreground/20 pl-4 italic",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "my-4 border-muted-foreground/20",
          },
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        listItem: {
          HTMLAttributes: {},
        },
        paragraph: {
          HTMLAttributes: {},
        },
        // Enable proper text deletion
        dropcursor: {
          color: "var(--color-primary)",
          width: 2,
        },
      }),

      Collaboration.configure({
        document: doc,
      }),

      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'task-item',
        },
        nested: true,
      }),
    ];

    if (provider && session?.user) {
      // Generate a consistent color based on user ID
      const userColor = generateUserColor(session.user.id);

      baseExtensions.push(
        CollaborationCursor.configure({
          provider,
          user: {
            name: session.user.name,
            color: userColor,
          },
          render: (user: any) => {
            const cursor = document.createElement("span");
            cursor.classList.add("collaboration-cursor__caret");
            cursor.setAttribute("style", `border-color: ${user.color}`);

            // Create expandable user indicator
            const userIndicator = document.createElement("div");
            userIndicator.classList.add("collaboration-cursor__user-indicator");
            userIndicator.setAttribute("style", `background-color: ${user.color}`);

            // Get initials from user name
            const initials = getInitials(user.name);

            // Create the content container
            const content = document.createElement("span");
            content.classList.add("collaboration-cursor__content");

            // Create the initial letter
            const initial = document.createElement("span");
            initial.classList.add("collaboration-cursor__initial");
            initial.textContent = initials;

            // Create the full name (hidden by default)
            const fullName = document.createElement("span");
            fullName.classList.add("collaboration-cursor__fullname");
            fullName.textContent = user.name;

            content.appendChild(initial);
            content.appendChild(fullName);
            userIndicator.appendChild(content);

            cursor.appendChild(userIndicator);

            return cursor;
          },
        })
      );
    }

    return baseExtensions;
  }, [provider, session?.user, doc]);

  const editor = useEditor(
    {
      extensions,
      editable,
      // Let TipTap handle empty content naturally
      // editorProps: {
      //   attributes: {
      //     class:
      //       "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      //     "data-placeholder": "Start writing...",
      //   },
      // },
      onUpdate: useCallback(
        ({ editor }: { editor: any }) => {
          if (onUpdate) {
            onUpdate(editor.getHTML());
          }
        },
        [onUpdate]
      ),
    },
    [extensions, editable, onUpdate]
  );

  useEffect(() => {
    if (
      !editor ||
      !isProviderReady ||
      !isSynced ||
      hasSeeded ||
      !initialContent
    )
      return;

    const yFragment = doc.getXmlFragment("default");
    const isDocEmpty = yFragment.length === 0;

    if (isDocEmpty) {
      editor.commands.setContent(initialContent);
      setHasSeeded(true);
    }
  }, [editor, isProviderReady, isSynced, initialContent, hasSeeded, doc]);

  if (!isProviderReady || !editor) {
    return (
      <div className="min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 flex items-center justify-center">
        <div className="text-muted-foreground">
          {!session?.user
            ? "Please sign in to use collaborative editing..."
            : "Loading collaborative editor..."}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-full rounded-md border border-input bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <EditorToolbar
          editor={editor}
          isConnected={isConnected}
          editable={editable}
        />
        <EditorContent
          editor={editor}
          className="min-h-[500px] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground prose prose-sm max-w-none dark:prose-invert [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[450px] [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h4]:text-base [&_.ProseMirror_h5]:text-sm [&_.ProseMirror_h6]:text-sm [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-muted-foreground/20 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:text-sm"
        />
      </div>

      {/* Read-only indicator */}
      {!editable && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border">
          Read-only
        </div>
      )}
    </div>
  );
}

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
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
        history: false,
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
          HTMLAttributes: {
            class: "list-disc list-inside",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-inside",
          },
        },
      }),

      Collaboration.configure({
        document: doc,
      }),
    ];

    if (provider && session?.user) {
      baseExtensions.push(
        CollaborationCursor.configure({
          provider,
          user: {
            name: session.user.name,
            color: `#${Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, "0")}`,
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
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
        <EditorContent
          editor={editor}
          className="min-h-[500px] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground prose prose-sm max-w-none dark:prose-invert [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[450px] [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h4]:text-base [&_.ProseMirror_h5]:text-sm [&_.ProseMirror_h6]:text-sm [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-muted-foreground/20 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:text-sm"
        />
      </div>

      {/* Status indicators */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {!editable && (
          <div className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border">
            Read-only
          </div>
        )}

        {/* Connection status */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* Rich Text Editor indicator */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
        Collaborative Editor
      </div>
    </div>
  );
}

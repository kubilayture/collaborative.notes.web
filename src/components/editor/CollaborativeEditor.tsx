import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../lib/auth-client';

interface CollaborativeEditorProps {
  noteId: string;
  initialContent?: string;
  editable?: boolean;
  onUpdate?: (content: string) => void;
}

export function CollaborativeEditor({ 
  noteId, 
  initialContent = '', 
  editable = true,
  onUpdate 
}: CollaborativeEditorProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [doc] = useState(() => new Y.Doc());
  const [isProviderReady, setIsProviderReady] = useState(false);

  // Initialize provider
  useEffect(() => {
    if (!session?.user || !noteId) return;

    // Create HocusPocus provider
    const hocuspocusProvider = new HocuspocusProvider({
      url: import.meta.env.VITE_COLLABORATION_URL || 'ws://localhost:8080',
      name: noteId,
      document: doc,
      token: session.user.id, // Use user ID as token for authentication
    });

    // Set provider immediately (don't wait for connection)
    setProvider(hocuspocusProvider);
    setIsProviderReady(true);

    hocuspocusProvider.on('status', ({ status }) => {
      // Connection status tracking for potential UI indicators
    });

    hocuspocusProvider.on('sync', (synced) => {
      if (synced) {
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      }
    });

    doc.on('update', (update) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    });

    return () => {
      hocuspocusProvider.destroy();
      setProvider(null);
      setIsProviderReady(false);
    };
  }, [session, noteId, doc, queryClient]);

  // Initialize editor with collaboration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: doc,
      }),
      // Only include CollaborationCursor if provider exists
      ...(provider ? [CollaborationCursor.configure({
        provider,
        user: session?.user ? {
          name: session.user.name,
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
        } : undefined,
      })] : []),
    ],
    editable,
    onCreate: ({ editor }) => {
      const ytext = doc.getText('content');
      const yjsContent = ytext.toString();
      
      if (!yjsContent && initialContent) {
        editor.commands.setContent(initialContent);
      }
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML());
      }
    },
  }, [isProviderReady, session, provider, initialContent, noteId]);

  // Show loading state until provider is ready and editor is initialized
  if (!isProviderReady || !editor) {
    return (
      <div className="min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 flex items-center justify-center">
        <div className="text-muted-foreground">
          {!session?.user ? 'Please sign in to use collaborative editing...' : 'Loading collaborative editor...'}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <EditorContent 
        editor={editor}
        className="min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 prose prose-sm max-w-none"
      />
      {!editable && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Read-only
        </div>
      )}
      {/* Rich Text Editor indicator */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
        Rich Text Editor
      </div>
    </div>
  );
}
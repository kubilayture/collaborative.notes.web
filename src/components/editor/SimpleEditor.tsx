import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useCallback } from "react";
import { EditorToolbar } from "./EditorToolbar";

interface SimpleEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function SimpleEditor({
  content,
  onUpdate,
  placeholder = "Start writing...",
  className = "",
  editable = true,
}: SimpleEditorProps) {
  const editor = useEditor({
    extensions: [
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
        dropcursor: {
          color: "var(--color-primary)",
          width: 2,
        },
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
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        'data-placeholder': placeholder,
      },
    },
    onUpdate: useCallback(
      ({ editor }: { editor: any }) => {
        onUpdate(editor.getHTML());
      },
      [onUpdate]
    ),
  });

  return (
    <div className={`relative ${className}`}>
      <div className="w-full rounded-md border border-input bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <EditorToolbar
          editor={editor}
          isConnected={true}
          editable={editable}
        />
        <EditorContent
          editor={editor}
          className="min-h-[400px] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground prose prose-sm max-w-none dark:prose-invert [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[350px] [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h4]:text-base [&_.ProseMirror_h5]:text-sm [&_.ProseMirror_h6]:text-sm [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-muted-foreground/20 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:text-sm [&_.ProseMirror]:before:content-[attr(data-placeholder)] [&_.ProseMirror]:before:text-muted-foreground [&_.ProseMirror]:before:pointer-events-none [&_.ProseMirror]:before:absolute [&_.ProseMirror]:before:top-0 [&_.ProseMirror]:before:left-0 [&_.ProseMirror.ProseMirror-focused]:before:content-none [&_.ProseMirror:not(.is-empty)]:before:content-none"
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
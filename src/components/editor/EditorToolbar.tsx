import { Editor, useEditorState } from "@tiptap/react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor;
  isConnected?: boolean;
  editable?: boolean;
}

export const EditorToolbar = ({ editor, isConnected = true, editable: editableProp }: EditorToolbarProps) => {
  const editable = editor.isEditable;
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      };
    },
  });

  return (
    <div className="border-b border-input">
      {/* Desktop Toolbar */}
      <div className="hidden md:flex p-2 flex-wrap items-center gap-1">
        {/* Connection Status */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={isConnected ? "Connected" : "Disconnected"}
          ></div>
          <span className="text-xs">{isConnected ? "Live" : "Offline"}</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />
      {/* Text Formatting */}
      <Button
        variant={editorState.isBold ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant={editorState.isItalic ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant={editorState.isStrike ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        variant={editorState.isCode ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Headings */}
      <Button
        variant={editorState.isHeading1 ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={!editable}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        variant={editorState.isHeading2 ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={!editable}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        variant={editorState.isHeading3 ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={!editable}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <Button
        variant={editorState.isBulletList ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editable}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant={editorState.isOrderedList ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editable}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Blocks */}
      <Button
        variant={editorState.isBlockquote ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={!editable}
        title="Quote Block"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        variant={editorState.isCodeBlock ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={!editable}
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={!editable}
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </Button>
      </div>

      {/* Mobile Toolbar - Horizontal Swipeable */}
      <div className="md:hidden">
        <div className="p-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 w-max">
            {/* Connection Status */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1 flex-shrink-0">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={isConnected ? "Connected" : "Disconnected"}
              ></div>
            </div>

            <div className="w-px h-6 bg-border mx-1 flex-shrink-0"></div>

            {/* Undo/Redo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editorState.canUndo}
              title="Undo"
              className="flex-shrink-0"
            >
              <Undo2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editorState.canRedo}
              title="Redo"
              className="flex-shrink-0"
            >
              <Redo2 className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1 flex-shrink-0"></div>

            {/* Text Formatting */}
            <Button
              variant={editorState.isBold ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editorState.canBold}
              title="Bold"
              className="flex-shrink-0"
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              variant={editorState.isItalic ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editorState.canItalic}
              title="Italic"
              className="flex-shrink-0"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              variant={editorState.isStrike ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editorState.canStrike}
              title="Strikethrough"
              className="flex-shrink-0"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <Button
              variant={editorState.isCode ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editorState.canCode}
              title="Code"
              className="flex-shrink-0"
            >
              <Code className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1 flex-shrink-0"></div>

            {/* Headings */}
            <Button
              variant={editorState.isHeading1 ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={!editable}
              title="Heading 1"
              className="flex-shrink-0"
            >
              <Heading1 className="h-4 w-4" />
            </Button>

            <Button
              variant={editorState.isHeading2 ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={!editable}
              title="Heading 2"
              className="flex-shrink-0"
            >
              <Heading2 className="h-4 w-4" />
            </Button>

            <Button
              variant={editorState.isHeading3 ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={!editable}
              title="Heading 3"
              className="flex-shrink-0"
            >
              <Heading3 className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1 flex-shrink-0"></div>

            {/* Lists */}
            <Button
              variant={editorState.isBulletList ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                // Better list handling - convert selected text to list item
                if (editorState.isBulletList) {
                  editor.chain().focus().liftListItem('listItem').run();
                } else {
                  editor.chain().focus().toggleBulletList().run();
                }
              }}
              disabled={!editable}
              title="Bullet List"
              className="flex-shrink-0"
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              variant={editorState.isOrderedList ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={!editable}
              title="Numbered List"
              className="flex-shrink-0"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1 flex-shrink-0"></div>

            {/* Blocks */}
            <Button
              variant={editorState.isBlockquote ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={!editable}
              title="Quote Block"
              className="flex-shrink-0"
            >
              <Quote className="h-4 w-4" />
            </Button>

            <Button
              variant={editorState.isCodeBlock ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              disabled={!editable}
              title="Code Block"
              className="flex-shrink-0"
            >
              <Code className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              disabled={!editable}
              title="Horizontal Rule"
              className="flex-shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

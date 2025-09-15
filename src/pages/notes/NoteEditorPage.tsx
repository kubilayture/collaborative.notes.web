import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNote,
  useUpdateNote,
  useDeleteNote,
  contentToText,
} from "../../hooks/notes.hook";
import { useSession } from "../../lib/auth-client";
import { CollaborativeEditor } from "../../components/editor/CollaborativeEditor";
import { SharePermissionsDialog } from "../../components/notes/SharePermissionsDialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";
import {
  ArrowLeft,
  Save,
  MoreVertical,
  Trash2,
  Users,
  Clock,
  Lock,
  Pencil,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function NoteEditorPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: note, isLoading, error, refetch } = useNote(noteId!);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  useEffect(() => {
    if (noteId) {
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  }, [noteId, queryClient]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(contentToText(note.content));
      setEditorContent(contentToText(note.content));
    }
  }, [note]);

  useEffect(() => {
    if (note) {
      const titleChanged = title !== note.title;
      const contentChanged = editorContent !== contentToText(note.content);
      setHasChanges(titleChanged || contentChanged);
    }
  }, [title, editorContent, note]);

  if (isLoading) return <Loading />;
  if (error) return <Error message="Failed to load note" onRetry={refetch} />;
  if (!note) return <Error message="Note not found" />;

  const isOwner = note.ownerId === session?.user?.id;
  const userPermission = note.permissions?.find(
    (p) => p.userId === session?.user?.id
  );
  const canEdit = isOwner || userPermission?.permission === "WRITE";
  const canDelete = isOwner;

  const handleSave = async () => {
    if (!hasChanges) return;

    updateNote.mutate({
      id: note.id,
      data: {
        title: title.trim(),
        content: editorContent.trim(),
      },
    });
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      deleteNote.mutate(note.id);
    }
  };

  const handleBack = () => {
    const to = note.folderId ? `/notes/folder/${note.folderId}` : "/notes";
    navigate(to);
  };

  const getPermissionLevel = () => {
    if (isOwner) return "Owner";
    return userPermission ? userPermission.permission : "READ";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Back Button - Icon only on mobile */}
            <Button
              variant="ghost"
              onClick={handleBack}
              className="h-input px-2 sm:px-3"
              title="Back to Notes"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Back to Notes</span>
            </Button>

            {/* Permission Badges - Responsive sizing */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge
                variant={isOwner ? "default" : "secondary"}
                className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1"
              >
                {getPermissionLevel()}
              </Badge>

              {!canEdit && (
                <Badge
                  variant="outline"
                  className="text-amber-600 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Read Only</span>
                  <span className="sm:hidden">RO</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons - Responsive layout */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateNote.isPending}
                variant={hasChanges ? "default" : "outline"}
                className="h-input px-2 sm:px-4"
                title={
                  updateNote.isPending
                    ? "Saving..."
                    : hasChanges
                    ? "Save Changes"
                    : "Saved"
                }
              >
                <Save className="h-4 w-4" />
                {/* Show text on larger screens */}
                <span className="hidden md:inline ml-2">
                  {updateNote.isPending
                    ? "Saving..."
                    : hasChanges
                    ? "Save Changes"
                    : "Saved"}
                </span>
                {/* Show shorter text on medium screens */}
                <span className="hidden sm:inline md:hidden ml-2">
                  {updateNote.isPending
                    ? "Saving..."
                    : hasChanges
                    ? "Save"
                    : "Saved"}
                </span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-input w-input p-0"
                  title="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Share & Permissions
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                      disabled={deleteNote.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Note
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
          <div
            className="flex items-center gap-1"
            title={`Last updated ${formatDistanceToNow(note.updatedAt)}`}
          >
            <Clock className="h-5 w-5 sm:h-3 sm:w-3" />
            <span className="sm:hidden">
              {formatDistanceToNow(note.updatedAt, { addSuffix: false })}
            </span>
            <span className="hidden sm:inline">
              Last updated {formatDistanceToNow(note.updatedAt)}
            </span>
          </div>
          <div
            className="flex items-center gap-1"
            title={`Created by ${isOwner ? "You" : note.owner.name}`}
          >
            <Pencil className="h-5 w-5 sm:h-3 sm:w-3" />
            <span className="sm:hidden">
              {isOwner ? "You" : note.owner.name}
            </span>
            <span className="hidden sm:inline">
              Created by {isOwner ? "You" : note.owner.name}
            </span>
          </div>
          {note.permissions && note.permissions.length > 0 && (
            <div
              className="flex items-center gap-1"
              title={`${note.permissions.length + 1} collaborator${
                note.permissions.length > 0 ? "s" : ""
              }`}
            >
              <Users className="h-5 w-5 sm:h-3 sm:w-3" />
              <span className="sm:hidden">{note.permissions.length + 1}</span>
              <span className="hidden sm:inline">
                {note.permissions.length + 1} collaborator
                {note.permissions.length > 0 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Untitled"
            disabled={!canEdit}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Content</Label>
            {!canEdit && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Pencil className="h-3 w-3" />
                Read-only access
              </div>
            )}
          </div>

          <CollaborativeEditor
            noteId={note.id}
            initialContent={contentToText(note.content)}
            editable={canEdit}
            onUpdate={setEditorContent}
          />

          <p className="text-xs text-muted-foreground">
            {canEdit
              ? "Real-time collaborative editing enabled. Changes are synced automatically and saved manually."
              : "You don't have edit permissions for this note."}
          </p>
        </div>
      </div>

      {/* Share & Permissions Dialog */}
      <SharePermissionsDialog
        note={note}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
}

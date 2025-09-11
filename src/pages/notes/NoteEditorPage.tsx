import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useNote, useUpdateNote, useDeleteNote, contentToText } from "../../hooks/notes.hook";
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
  DropdownMenuTrigger 
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
  Pencil
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
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
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
  const userPermission = note.permissions?.find(p => p.userId === session?.user?.id);
  const canEdit = isOwner || userPermission?.permission === "WRITE";
  const canDelete = isOwner;

  const handleSave = async () => {
    if (!hasChanges) return;
    
    updateNote.mutate({
      id: note.id,
      data: {
        title: title.trim(),
        content: editorContent.trim(),
      }
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      deleteNote.mutate(note.id);
    }
  };

  const handleBack = () => {
    navigate("/notes");
  };

  const getPermissionLevel = () => {
    if (isOwner) return "Owner";
    return userPermission ? userPermission.permission : "READ";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant={isOwner ? "default" : "secondary"}>
                {getPermissionLevel()}
              </Badge>
              
              {!canEdit && (
                <Badge variant="outline" className="text-amber-600">
                  <Lock className="h-3 w-3 mr-1" />
                  Read Only
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || updateNote.isPending}
                variant={hasChanges ? "default" : "outline"}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateNote.isPending ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
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

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </div>
          <div>
            Created by {isOwner ? "You" : note.owner.name}
          </div>
          {note.permissions && note.permissions.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {note.permissions.length + 1} collaborator{note.permissions.length > 0 ? "s" : ""}
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
            {canEdit ? (
              "Real-time collaborative editing enabled. Changes are synced automatically and saved manually."
            ) : (
              "You don't have edit permissions for this note."
            )}
          </p>
        </div>
      </div>

      {hasChanges && canEdit && (
        <div className="fixed bottom-6 right-6">
          <Button onClick={handleSave} disabled={updateNote.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateNote.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}

      {/* Share & Permissions Dialog */}
      <SharePermissionsDialog
        note={note}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
}
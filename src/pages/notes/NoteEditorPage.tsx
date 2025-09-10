import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useNote, useUpdateNote, useDeleteNote, contentToText } from "../../hooks/notes.hook";
import { useSession } from "../../lib/auth-client";
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
import { toast } from "sonner";

export function NoteEditorPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  
  const { data: note, isLoading, error, refetch } = useNote(noteId!);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(contentToText(note.content));
    }
  }, [note]);

  useEffect(() => {
    if (note) {
      const titleChanged = title !== note.title;
      const contentChanged = content !== contentToText(note.content);
      setHasChanges(titleChanged || contentChanged);
    }
  }, [title, content, note]);

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
        content: content.trim(),
      }
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      deleteNote.mutate(note.id);
    }
  };

  const handleBack = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
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
                <DropdownMenuItem>
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
          
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder="Start writing..."
            disabled={!canEdit}
          />
          
          <p className="text-xs text-muted-foreground">
            {canEdit ? (
              "Changes are saved manually. Rich text collaborative editing will be available soon."
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
    </div>
  );
}
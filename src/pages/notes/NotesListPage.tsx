import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth-client";
import { useNotes, useDeleteNote, type Note, contentToText } from "../../hooks/notes.hook";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu";
import { useNavigate } from "react-router";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";
import { Plus, Search, MoreVertical, Trash2, Users, Calendar, Share2 } from "lucide-react";
import { SharePermissionsDialog } from "../../components/notes/SharePermissionsDialog";
import { formatDistanceToNow } from "date-fns";

export function NotesListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareNote, setShareNote] = useState<Note | null>(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data: notes, isLoading, error, refetch } = useNotes();
  const deleteNote = useDeleteNote();
  const navigate = useNavigate();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  }, [queryClient]);

  if (isLoading) return <Loading />;
  if (error) return <Error message="Failed to load notes" onRetry={refetch} />;

  const filteredNotes = notes?.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contentToText(note.content).toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      deleteNote.mutate(noteId);
    }
  };

  const getNotePermissionLevel = (note: Note) => {
    if (note.ownerId === session?.user?.id) return "Owner";
    const permission = note.permissions?.find(p => p.userId === session?.user?.id);
    return permission ? permission.permission : null;
  };

  const canEditNote = (note: Note) => {
    if (note.ownerId === session?.user?.id) return true;
    const permission = note.permissions?.find(p => p.userId === session?.user?.id);
    return permission?.permission === "WRITE";
  };

  const canDeleteNote = (note: Note) => {
    return note.ownerId === session?.user?.id;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className="text-muted-foreground">
              Manage your collaborative notes and shared documents
            </p>
          </div>
          <Button onClick={() => navigate("/notes/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No notes match "${searchQuery}"`
                  : "Create your first note to get started with collaborative editing"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/notes/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => {
            const permissionLevel = getNotePermissionLevel(note);
            const isOwner = note.ownerId === session?.user?.id;
            
            return (
              <Card 
                key={note.id} 
                className="group hover:shadow-md transition-shadow cursor-pointer" 
                onClick={() => navigate(`/notes/${note.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate mb-2">
                        {note.title || "Untitled"}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareNote(note);
                            setShareOpen(true);
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share & Permissions
                        </DropdownMenuItem>
                        {canDeleteNote(note) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}
                              className="text-destructive focus:text-destructive"
                              disabled={deleteNote.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {contentToText(note.content) || "No content"}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={isOwner ? "default" : "secondary"}>
                        {permissionLevel}
                      </Badge>
                      {note.permissions && note.permissions.length > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          {note.permissions.length + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      by {isOwner ? "You" : note.owner.name}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {shareNote && (
        <SharePermissionsDialog
          note={shareNote}
          open={shareOpen}
          onOpenChange={(o) => {
            setShareOpen(o);
            if (!o) setShareNote(null);
          }}
        />
      )}
    </div>
  );
}

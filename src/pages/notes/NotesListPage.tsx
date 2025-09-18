import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth-client";
import {
  useNotes,
  useDeleteNote,
  type Note,
  contentToPlainText,
} from "../../hooks/notes.hook";
import { useFolders, useDeleteFolder } from "../../hooks/folders.hook";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MoveNoteDialog } from "../../components/folders/MoveNoteDialog";
import { CreateFolderDialog } from "../../components/folders/CreateFolderDialog";
import { FolderBreadcrumb } from "../../components/folders/FolderBreadcrumb";
import { ViewToggle, type ViewMode } from "../../components/layout/ViewToggle";
import {
  useNavigate,
  useParams,
  useOutletContext,
  useSearchParams,
} from "react-router";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";
import {
  NotesListSkeleton,
  HeaderSkeleton,
} from "../../components/common/SkeletonLoader";
import {
  MoreVertical,
  Trash2,
  Users,
  Calendar,
  Share2,
  FolderOpen,
  FolderPlus,
  Folder,
  FileText,
} from "lucide-react";
import { SharePermissionsDialog } from "../../components/notes/SharePermissionsDialog";
import { NoteListItem } from "../../components/notes/NoteListItem";
import { NotesListView } from "../../components/notes/NotesListView";
import { formatDistanceToNow } from "date-fns";

export function NotesListPage() {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareNote, setShareNote] = useState<Note | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveNote, setMoveNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { folderId } = useParams<{ folderId: string }>();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  // Use URL parameter instead of useState for createFolderOpen
  const createFolderOpen = searchParams.get("createFolder") === "true";
  const { data: notes, isLoading, error, refetch } = useNotes(folderId);
  const { data: folders, isLoading: foldersLoading } = useFolders(folderId);
  const deleteNote = useDeleteNote();
  const deleteFolder = useDeleteFolder();
  const navigate = useNavigate();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  }, [queryClient]);

  const setCreateFolderOpen = (open: boolean) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (open) {
        newParams.set("createFolder", "true");
      } else {
        newParams.delete("createFolder");
      }
      return newParams;
    });
  };

  if (isLoading || foldersLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <FolderBreadcrumb currentFolderId={folderId} />
        <HeaderSkeleton />
        <NotesListSkeleton count={8} />
      </div>
    );
  }

  if (error) return <Error message="Failed to load notes" onRetry={refetch} />;

  const filteredNotes =
    notes?.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
        contentToPlainText(note.content)
          .toLowerCase()
          .includes(searchQuery?.toLowerCase() || "")
    ) ?? [];

  const filteredFolders =
    folders?.filter((folder) =>
      folder.name.toLowerCase().includes(searchQuery?.toLowerCase() || "")
    ) ?? [];

  const handleDeleteNote = async (noteId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      deleteNote.mutate(noteId);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this folder? This will also delete all notes inside it. This action cannot be undone."
      )
    ) {
      deleteFolder.mutate(folderId);
    }
  };

  const getNotePermissionLevel = (note: Note) => {
    if (note.ownerId === session?.user?.id) return "Owner";
    const permission = note.permissions?.find(
      (p) => p.userId === session?.user?.id
    );
    return permission ? permission.permission : null;
  };

  const canEditNote = (note: Note) => {
    if (note.ownerId === session?.user?.id) return true;
    const permission = note.permissions?.find(
      (p) => p.userId === session?.user?.id
    );
    return permission?.permission === "WRITE";
  };

  const canDeleteNote = (note: Note) => {
    return note.ownerId === session?.user?.id;
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto p-3 sm:p-6">
        <FolderBreadcrumb currentFolderId={folderId} />

        {/* Header Section */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Notes
              </h1>
              <p className="text-muted-foreground text-sm">
                {filteredNotes.length} notes • {filteredFolders.length} folders
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* View Toggle for All Devices */}
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                className="self-start sm:self-auto"
              />

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={() => setCreateFolderOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <FolderPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">New Folder</span>
                  <span className="xs:hidden">Folder</span>
                </Button>
                <Button
                  onClick={() =>
                    navigate(folderId ? `/notes/new/${folderId}` : "/notes/new")
                  }
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <span className="hidden xs:inline">New Note</span>
                  <span className="xs:hidden">Note</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filteredFolders.length === 0 && filteredNotes.length === 0 ? (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {searchQuery ? "No results found" : "No notes yet"}
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {searchQuery
                      ? `No notes or folders match "${searchQuery}". Try different keywords.`
                      : "Create your first note to get started with collaborative editing."}
                  </p>
                </div>
                {!searchQuery && (
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <Button
                      onClick={() =>
                        navigate(
                          folderId ? `/notes/new/${folderId}` : "/notes/new"
                        )
                      }
                    >
                      New Note
                    </Button>
                    <Button
                      onClick={() => setCreateFolderOpen(true)}
                      variant="outline"
                    >
                      New Folder
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "list" ? (
          <NotesListView
            notes={filteredNotes}
            folders={filteredFolders}
            session={session}
            onEditNote={(noteId) => navigate(`/notes/${noteId}`)}
            onShareNote={(note) => {
              setShareNote(note);
              setShareOpen(true);
            }}
            onMoveNote={(note) => {
              setMoveNote(note);
              setMoveOpen(true);
            }}
            onDeleteNote={handleDeleteNote}
            onDeleteFolder={handleDeleteFolder}
            onFolderClick={(folderId) => navigate(`/notes/folder/${folderId}`)}
            canEditNote={canEditNote}
            canDeleteNote={canDeleteNote}
            isDeleting={deleteNote.isPending}
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Render Folders */}
            {filteredFolders.map((folder) => (
              <Card
                key={folder.id}
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/80"
                onClick={() => navigate(`/notes/folder/${folder.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-semibold truncate mb-2">
                            {folder.name}
                          </CardTitle>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                {folder.noteCount || 0}
                              </span>
                              <span className="flex items-center">
                                <Folder className="h-3 w-3 mr-1" />
                                {folder.subfolderCount || 0}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Folder
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 ml-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="text-destructive focus:text-destructive"
                          disabled={deleteFolder.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Render Notes in Grid */}
            {filteredNotes.map((note) => {
              const permissionLevel = getNotePermissionLevel(note);
              const isOwner = note.ownerId === session?.user?.id;
              const hasCollaborators =
                note.permissions && note.permissions.length > 0;

              return (
                <Card
                  key={note.id}
                  className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/80"
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate mb-2">
                              {note.title || "Untitled Note"}
                            </CardTitle>

                            {/* Footer with badges and info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={isOwner ? "default" : "secondary"}
                                  className="text-xs px-2 py-0"
                                >
                                  {permissionLevel}
                                </Badge>
                                {hasCollaborators && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Users className="h-3 w-3 mr-1" />
                                    {note.permissions.length + 1}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(note.updatedAt), {
                                  addSuffix: true,
                                })}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-16">
                                {isOwner ? "You" : note.owner.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 ml-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareNote(note);
                              setShareOpen(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Share2 className="h-4 w-4" />
                            Share & Permissions
                          </DropdownMenuItem>
                          {canEditNote(note) && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setMoveNote(note);
                                setMoveOpen(true);
                              }}
                              className="flex items-center gap-2"
                            >
                              <FolderOpen className="h-4 w-4" />
                              Move to Folder
                            </DropdownMenuItem>
                          )}
                          {canDeleteNote(note) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note.id);
                                }}
                                className="text-destructive focus:text-destructive flex items-center gap-2"
                                disabled={deleteNote.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialogs */}
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
        {moveNote && (
          <MoveNoteDialog
            noteId={moveNote.id}
            noteTitle={moveNote.title}
            currentFolderId={moveNote.folderId}
            open={moveOpen}
            onOpenChange={(o) => {
              setMoveOpen(o);
              if (!o) setMoveNote(null);
            }}
          />
        )}
        <CreateFolderDialog
          open={createFolderOpen}
          onOpenChange={setCreateFolderOpen}
          parentId={folderId}
        />
      </div>
    </div>
  );
}

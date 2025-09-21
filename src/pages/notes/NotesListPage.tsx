import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth-client";
import {
  useNotes,
  useDeleteNote,
  type Note,
  contentToPlainText,
} from "../../hooks/notes.hook";
import { useFolders, useDeleteFolder, useMoveNote, useUpdateFolder, type Folder } from "../../hooks/folders.hook";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
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
import { EditFolderDialog } from "../../components/folders/EditFolderDialog";
import { FolderBreadcrumb } from "../../components/folders/FolderBreadcrumb";
import { ViewToggle, type ViewMode } from "../../components/layout/ViewToggle";
import {
  useNavigate,
  useParams,
  useOutletContext,
  useSearchParams,
} from "react-router";
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
  Folder as FolderIcon,
  FileText,
  Edit,
} from "lucide-react";
import { SharePermissionsDialog } from "../../components/notes/SharePermissionsDialog";
import { NotesListView } from "../../components/notes/NotesListView";
import { formatDistanceToNow } from "date-fns";

export function NotesListPage() {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareNote, setShareNote] = useState<Note | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveNote, setMoveNote] = useState<Note | null>(null);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editFolder, setEditFolder] = useState<Folder | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{ type: 'note' | 'folder'; id: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

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
  const moveNoteMutation = useMoveNote();
  const updateFolder = useUpdateFolder();
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, type: 'note' | 'folder', id: string) => {
    console.log('Drag start:', type, id);
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverFolder(null);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (draggedItem && draggedItem.id !== folderId) {
      console.log('Drag over folder:', folderId);
      setDragOverFolder(folderId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverFolder(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop event:', draggedItem, 'onto folder:', targetFolderId);

    if (!draggedItem || draggedItem.id === targetFolderId) {
      console.log('Preventing drop: item onto itself');
      setDraggedItem(null);
      setDragOverFolder(null);
      return;
    }

    if (draggedItem.type === 'folder') {
      const targetFolder = folders?.find(f => f.id === targetFolderId);
      if (targetFolder?.parentId === draggedItem.id) {
        setDraggedItem(null);
        setDragOverFolder(null);
        return;
      }
    }

    if (draggedItem.type === 'note') {
      moveNoteMutation.mutate({
        noteId: draggedItem.id,
        data: { folderId: targetFolderId }
      });
    } else if (draggedItem.type === 'folder') {
      updateFolder.mutate({
        id: draggedItem.id,
        data: { parentId: targetFolderId }
      });
    }

    setDraggedItem(null);
    setDragOverFolder(null);
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

  const handleEditFolder = (folder: Folder) => {
    setEditFolder(folder);
    setEditFolderOpen(true);
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
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            onFolderClick={(folderId) => navigate(`/notes/folder/${folderId}`)}
            canEditNote={canEditNote}
            canDeleteNote={canDeleteNote}
            isDeleting={deleteNote.isPending}
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Render Folders */}
            {filteredFolders.map((folder) => {
              // Use folder color or fallback to blue
              const folderColor = folder.color || '#3B82F6';

              return (
                <Card
                  key={folder.id}
                  className={`group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing ${
                    draggedItem?.type === 'folder' && draggedItem.id === folder.id ? 'opacity-50' : ''
                  } ${
                    dragOverFolder === folder.id ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'folder', folder.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, folder.id)}
                  onDragLeave={(e) => handleDragLeave(e)}
                  onDrop={(e) => handleDrop(e, folder.id)}
                  onClick={(e) => {
                    if (!draggedItem && e.detail !== 0) {
                      navigate(`/notes/folder/${folder.id}`);
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: folderColor }}
                      >
                        <FolderIcon className="h-6 w-6 text-white" />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-black/5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFolder(folder);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Folder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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

                    <div className="flex-1 flex flex-col space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                          {folder.name}
                        </h3>
                        {folder.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {folder.description}
                          </p>
                        )}
                        {!folder.description && (
                          <p className="text-sm text-muted-foreground/60 italic">
                            {(folder.noteCount || 0) === 0
                              ? 'Empty folder - add your first note'
                              : 'Organize your notes and ideas here'
                            }
                          </p>
                        )}
                      </div>

                      <div className="mt-auto space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            <span>{folder.noteCount || 0} {(folder.noteCount || 0) === 1 ? 'note' : 'notes'}</span>
                          </div>
                          {(folder.subfolderCount || 0) > 0 && (
                            <div className="flex items-center gap-1.5">
                              <FolderIcon className="h-4 w-4" />
                              <span>{folder.subfolderCount} {folder.subfolderCount === 1 ? 'folder' : 'folders'}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>Created {formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative accent */}
                    <div
                      className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5"
                      style={{
                        backgroundColor: folderColor,
                        transform: 'translate(25%, -25%)'
                      }}
                    />
                  </CardContent>
                </Card>
              );
            })}

            {/* Render Notes in Grid */}
            {filteredNotes.map((note) => {
              const permissionLevel = getNotePermissionLevel(note);
              const isOwner = note.ownerId === session?.user?.id;
              const hasCollaborators =
                note.permissions && note.permissions.length > 0;

              // Generate content preview
              const contentPreview = contentToPlainText(note.content || '').trim();
              const previewText = contentPreview.length > 120
                ? contentPreview.substring(0, 120) + '...'
                : contentPreview || 'No content yet';

              return (
                <Card
                  key={note.id}
                  className={`group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing ${
                    draggedItem?.type === 'note' && draggedItem.id === note.id ? 'opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'note', note.id)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => {
                    if (!draggedItem && e.detail !== 0) {
                      navigate(`/notes/${note.id}`);
                    }
                  }}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                        <FileText className="h-6 w-6 text-white" />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-black/5"
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

                    <div className="flex-1 flex flex-col space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                          {note.title || "Untitled Note"}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {previewText}
                        </p>
                      </div>

                      <div className="mt-auto space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={isOwner ? "default" : "secondary"}
                            className="text-xs px-2 py-1"
                          >
                            {permissionLevel}
                          </Badge>
                          {hasCollaborators && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{note.permissions.length + 1} collaborators</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                          </div>
                          <span className="font-medium">
                            {isOwner ? "You" : note.owner.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Decorative accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/5 transform translate-x-6 -translate-y-6" />
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
        <EditFolderDialog
          open={editFolderOpen}
          onOpenChange={(o) => {
            setEditFolderOpen(o);
            if (!o) setEditFolder(null);
          }}
          folder={editFolder}
        />
      </div>
    </div>
  );
}

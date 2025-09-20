import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  MoreVertical,
  FileText,
  Users,
  Calendar,
  Share2,
  FolderOpen,
  Trash2,
  Folder as FolderIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Note } from "../../hooks/notes.hook";
import type { Folder } from "../../hooks/folders.hook";

interface NotesListViewProps {
  notes: Note[];
  folders: Folder[];
  session: any;
  onEditNote: (noteId: string) => void;
  onShareNote: (note: Note) => void;
  onMoveNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onFolderClick: (folderId: string) => void;
  canEditNote: (note: Note) => boolean;
  canDeleteNote: (note: Note) => boolean;
  isDeleting: boolean;
}

export function NotesListView({
  notes,
  folders,
  session,
  onEditNote,
  onShareNote,
  onMoveNote,
  onDeleteNote,
  onDeleteFolder,
  onFolderClick,
  canEditNote,
  canDeleteNote,
  isDeleting,
}: NotesListViewProps) {
  const getNotePermissionLevel = (note: Note) => {
    if (note.ownerId === session?.user?.id) return "Owner";
    const permission = note.permissions?.find(
      (p) => p.userId === session?.user?.id
    );
    return permission ? permission.permission : null;
  };

  // Sort notes by updatedAt (most recent first)
  const sortedNotes = [...notes].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Get recently edited notes (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentlyEdited = sortedNotes.filter(note =>
    new Date(note.updatedAt) > sevenDaysAgo
  );

  const olderNotes = sortedNotes.filter(note =>
    new Date(note.updatedAt) <= sevenDaysAgo
  );

  const renderNoteItem = (note: Note) => {
    const permissionLevel = getNotePermissionLevel(note);
    const isOwner = note.ownerId === session?.user?.id;
    const hasCollaborators = note.permissions && note.permissions.length > 0;

    return (
      <div
        key={note.id}
        className="group flex items-center gap-3 py-2 px-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
        onClick={() => onEditNote(note.id)}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <FileText className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">
              {note.title || "Untitled Note"}
            </h3>
            <Badge
              variant={isOwner ? "default" : "secondary"}
              className="text-xs px-2 py-0 flex-shrink-0"
            >
              {permissionLevel}
            </Badge>
            {hasCollaborators && (
              <div className="flex items-center text-xs text-muted-foreground flex-shrink-0">
                <Users className="h-3 w-3 mr-1" />
                {note.permissions.length + 1}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(note.updatedAt), {
                addSuffix: true,
              })}
            </div>
            <span>{isOwner ? "You" : note.owner.name}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onShareNote(note);
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
                  onMoveNote(note);
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
                    onDeleteNote(note.id);
                  }}
                  className="text-destructive focus:text-destructive flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderFolderItem = (folder: Folder) => {
    // Use folder color or fallback to blue
    const folderColor = folder.color || '#3B82F6';
    const rgbColor = folderColor.startsWith('#')
      ? {
          r: parseInt(folderColor.slice(1, 3), 16),
          g: parseInt(folderColor.slice(3, 5), 16),
          b: parseInt(folderColor.slice(5, 7), 16)
        }
      : { r: 59, g: 130, b: 246 }; // Default blue

    return (
      <div
        key={folder.id}
        className="group flex items-center gap-3 py-2 px-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
        onClick={() => onFolderClick(folder.id)}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.15)`,
          }}
        >
          <FolderIcon
            className="h-4 w-4"
            style={{ color: folderColor }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">
              {folder.name}
            </h3>
            {folder.description && (
              <span className="text-xs text-muted-foreground/60 italic truncate max-w-32">
                {folder.description}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              {folder.noteCount || 0} {(folder.noteCount || 0) === 1 ? 'note' : 'notes'}
            </span>
            {(folder.subfolderCount || 0) > 0 && (
              <span className="flex items-center">
                <FolderIcon className="h-3 w-3 mr-1" />
                {folder.subfolderCount} {folder.subfolderCount === 1 ? 'folder' : 'folders'}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(folder.id);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Folders Section */}
      {folders.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Folders
          </h2>
          <div className="space-y-1">
            {folders.map(renderFolderItem)}
          </div>
        </div>
      )}

      {/* Recently Edited Section */}
      {recentlyEdited.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Recently Edited
          </h2>
          <div className="space-y-1">
            {recentlyEdited.map(renderNoteItem)}
          </div>
        </div>
      )}

      {/* All Notes Section */}
      {olderNotes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            All Notes
          </h2>
          <div className="space-y-1">
            {olderNotes.map(renderNoteItem)}
          </div>
        </div>
      )}

      {/* If only recently edited notes exist and no older notes */}
      {recentlyEdited.length === 0 && olderNotes.length === 0 && folders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No items found</p>
        </div>
      )}
    </div>
  );
}
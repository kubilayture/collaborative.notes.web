import { Card, CardContent } from "../ui/card";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Note } from "../../hooks/notes.hook";

interface NoteListItemProps {
  note: Note;
  permissionLevel: string | null;
  isOwner: boolean;
  hasCollaborators: boolean;
  contentPreview: string;
  onEdit: () => void;
  onShare: () => void;
  onMove: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
  isDeleting: boolean;
}

export function NoteListItem({
  note,
  permissionLevel,
  isOwner,
  hasCollaborators,
  contentPreview,
  onEdit,
  onShare,
  onMove,
  onDelete,
  canEdit,
  canDelete,
  isDeleting,
}: NoteListItemProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer" onClick={onEdit}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
            <FileText className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate mb-1">
                  {note.title || "Untitled Note"}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {contentPreview}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(note.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isOwner ? "default" : "secondary"} className="text-xs px-2 py-0">
                      {permissionLevel}
                    </Badge>
                    {hasCollaborators && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        {note.permissions?.length ? note.permissions.length + 1 : 1}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto">
                    {isOwner ? "You" : note.owner.name}
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                      onShare();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share & Permissions
                  </DropdownMenuItem>
                  {canEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove();
                      }}
                      className="flex items-center gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Move to Folder
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
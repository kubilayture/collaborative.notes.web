import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { FolderSelect } from "./FolderSelect";
import { useMoveNote } from "../../hooks/folders.hook";
import { FileText, FolderIcon } from "lucide-react";

interface MoveNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId?: string;
  noteTitle?: string;
  currentFolderId?: string | null;
}

export function MoveNoteDialog({
  open,
  onOpenChange,
  noteId,
  noteTitle,
  currentFolderId,
}: MoveNoteDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolderId || null
  );

  const moveNote = useMoveNote();

  const handleSubmit = () => {
    if (!noteId) return;

    moveNote.mutate(
      {
        noteId,
        data: { folderId: selectedFolderId },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFolderId(currentFolderId || null);
    }
    onOpenChange(newOpen);
  };

  const hasChanged = selectedFolderId !== currentFolderId;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5" />
            Move Note
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Move "{noteTitle || "Untitled"}" to a different folder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select destination folder:</label>
            <FolderSelect
              value={selectedFolderId}
              onValueChange={setSelectedFolderId}
              placeholder="Choose a folder"
              allowRoot={true}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={moveNote.isPending || !hasChanged}
          >
            {moveNote.isPending ? "Moving..." : "Move Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
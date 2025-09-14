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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useCreateFolder, type CreateFolderData } from "../../hooks/folders.hook";
import { FolderIcon } from "lucide-react";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
}

const FOLDER_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#6b7280", // gray
];

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
}: CreateFolderDialogProps) {
  const [formData, setFormData] = useState<CreateFolderData>({
    name: "",
    description: "",
    color: FOLDER_COLORS[0],
    parentId,
  });

  const createFolder = useCreateFolder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    createFolder.mutate(
      {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        color: formData.color,
        parentId: formData.parentId,
      },
      {
        onSuccess: () => {
          setFormData({
            name: "",
            description: "",
            color: FOLDER_COLORS[0],
            parentId,
          });
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        name: "",
        description: "",
        color: FOLDER_COLORS[0],
        parentId,
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5" />
            Create New Folder
          </DialogTitle>
          <DialogDescription>
            Create a new folder to organize your notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter folder name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter folder description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Folder Color</Label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    formData.color === color
                      ? "border-foreground ring-2 ring-ring ring-offset-2"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, color }))
                  }
                  title={color}
                />
              ))}
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
            <Button type="submit" disabled={createFolder.isPending || !formData.name.trim()}>
              {createFolder.isPending ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
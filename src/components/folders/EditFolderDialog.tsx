import { useState, useEffect } from "react";
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
import { useUpdateFolder, type UpdateFolderData, type Folder } from "../../hooks/folders.hook";
import { Edit, FolderIcon } from "lucide-react";

interface EditFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder | null;
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

export function EditFolderDialog({
  open,
  onOpenChange,
  folder,
}: EditFolderDialogProps) {
  const [formData, setFormData] = useState<UpdateFolderData>({
    name: "",
    description: "",
    color: FOLDER_COLORS[0],
  });

  const updateFolder = useUpdateFolder();

  // Update form data when folder changes
  useEffect(() => {
    if (folder) {
      setFormData({
        name: folder.name,
        description: folder.description || "",
        color: folder.color || FOLDER_COLORS[0],
      });
    }
  }, [folder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim() || !folder) return;

    updateFolder.mutate(
      {
        id: folder.id,
        data: {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          color: formData.color,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && folder) {
      // Reset form data to original folder values
      setFormData({
        name: folder.name,
        description: folder.description || "",
        color: folder.color || FOLDER_COLORS[0],
      });
    }
    onOpenChange(newOpen);
  };

  if (!folder) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Folder
          </DialogTitle>
          <DialogDescription>
            Update the folder name, description, and color.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
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
              value={formData.description || ""}
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
            <Button
              type="submit"
              disabled={updateFolder.isPending || !formData.name?.trim()}
            >
              {updateFolder.isPending ? "Updating..." : "Update Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
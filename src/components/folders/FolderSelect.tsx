import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAllFolders } from "../../hooks/folders.hook";
import { FolderIcon } from "lucide-react";

interface FolderSelectProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  allowRoot?: boolean;
}

export function FolderSelect({
  value,
  onValueChange,
  placeholder = "Select a folder",
  allowRoot = true,
}: FolderSelectProps) {
  const { data: folders, isLoading } = useAllFolders();

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "root") {
      onValueChange(null);
    } else {
      onValueChange(selectedValue);
    }
  };

  const currentValue = value ?? "root";

  return (
    <Select
      value={currentValue}
      onValueChange={handleValueChange}
      disabled={isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowRoot && (
          <SelectItem value="root">
            <div className="flex items-center">
              <FolderIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              No folder (Root)
            </div>
          </SelectItem>
        )}
        {folders?.map((folder) => (
          <SelectItem key={folder.id} value={folder.id}>
            <div className="flex items-center">
              <FolderIcon
                className="h-4 w-4 mr-2"
                style={{ color: folder.color || undefined }}
              />
              {folder.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

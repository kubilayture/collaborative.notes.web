import { Button } from "../ui/button";
import { Grid3X3, List, LayoutGrid } from "lucide-react";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ viewMode, onViewModeChange, className = "" }: ViewToggleProps) {
  return (
    <div className={`flex items-center bg-muted rounded-lg p-1 ${className}`}>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="h-7 px-3"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className="h-7 px-3"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
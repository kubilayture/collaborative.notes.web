import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Input } from "../ui/input";
import { Search, FileText, MessageSquare, Users, Mail } from "lucide-react";

interface GlobalSearchProps {
  onSearch: (query: string) => void;
  value?: string;
}

export function GlobalSearch({ onSearch, value = "" }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const location = useLocation();

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const getSearchPlaceholder = () => {
    const path = location.pathname;

    if (path.startsWith("/notes")) {
      return "Search notes...";
    } else if (path.startsWith("/messaging")) {
      return "Search messages...";
    } else if (path.startsWith("/friends")) {
      return "Search friends...";
    } else if (path.startsWith("/invitations")) {
      return "Search invitations...";
    } else {
      return "Search...";
    }
  };

  const getSearchIcon = () => {
    const path = location.pathname;

    if (path.startsWith("/notes")) {
      return FileText;
    } else if (path.startsWith("/messaging")) {
      return MessageSquare;
    } else if (path.startsWith("/friends")) {
      return Users;
    } else if (path.startsWith("/invitations")) {
      return Mail;
    } else {
      return Search;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  const SearchIcon = getSearchIcon();

  return (
    <div className="relative flex-1 max-w-md">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={getSearchPlaceholder()}
        value={searchQuery}
        onChange={handleSearchChange}
        className="pl-10 pr-10 h-9 bg-muted/50 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20"
      />
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}
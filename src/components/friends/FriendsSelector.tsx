import { useState } from "react";
import {
  ChevronsUpDown,
  Users,
  X,
  Check,
  Crown,
  Edit3,
  MessageSquare,
  Eye,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useFriends, type Friend } from "../../hooks/friends.hook";

export interface SelectedFriend {
  id: string;
  name: string;
  email: string;
  role: "EDITOR" | "COMMENTER" | "VIEWER";
}

interface FriendsSelectorProps {
  selectedFriends: SelectedFriend[];
  onSelectionChange: (friends: SelectedFriend[]) => void;
  placeholder?: string;
  className?: string;
}

export function FriendsSelector({
  selectedFriends,
  onSelectionChange,
  placeholder = "Select friends to invite...",
  className,
}: FriendsSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: friends = [], isLoading } = useFriends();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isSelected = (friendId: string) => {
    return selectedFriends.some((selected) => selected.id === friendId);
  };

  const handleSelect = (friend: Friend) => {
    const friendData = {
      id: friend.friend.id,
      name: friend.friend.name,
      email: friend.friend.email,
      role: "VIEWER" as const,
    };

    if (isSelected(friend.friend.id)) {
      // Remove from selection
      onSelectionChange(
        selectedFriends.filter((f) => f.id !== friend.friend.id)
      );
    } else {
      // Add to selection with default role
      onSelectionChange([...selectedFriends, friendData]);
    }
  };

  const updateFriendRole = (
    friendId: string,
    role: "EDITOR" | "COMMENTER" | "VIEWER"
  ) => {
    onSelectionChange(
      selectedFriends.map((f) => (f.id === friendId ? { ...f, role } : f))
    );
  };

  const removeFriend = (friendId: string) => {
    onSelectionChange(selectedFriends.filter((f) => f.id !== friendId));
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        role="combobox"
        disabled
        className={cn("w-full justify-between", className)}
      >
        Loading friends...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground border rounded-lg">
        <Users className="h-4 w-4" />
        <span>No friends to invite. Add friends first!</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected friends display */}
      {selectedFriends.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Selected friends:</div>
          <div className="space-y-2">
            {selectedFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {getInitials(friend.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{friend.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {friend.email}
                  </p>
                </div>

                <Select
                  value={friend.role}
                  onValueChange={(value: "EDITOR" | "COMMENTER" | "VIEWER") =>
                    updateFriendRole(friend.id, value)
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">
                      <div className="flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        <span>Viewer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="COMMENTER">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        <span>Commenter</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EDITOR">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-3 w-3" />
                        <span>Editor</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <button
                  onClick={() => removeFriend(friend.id)}
                  className="p-1 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {selectedFriends.length > 0
                  ? `${selectedFriends.length} friend${
                      selectedFriends.length > 1 ? "s" : ""
                    } selected`
                  : placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Search friends..." className="h-9" />
            <CommandList>
              <CommandEmpty>No friends found.</CommandEmpty>
              <CommandGroup heading={`Your Friends (${friends.length})`}>
                {friends.map((friend) => {
                  const selected = isSelected(friend.friend.id);
                  return (
                    <CommandItem
                      key={friend.friend.id}
                      value={`${friend.friend.name} ${friend.friend.email}`}
                      onSelect={() => handleSelect(friend)}
                      className="flex items-center gap-3 p-3"
                    >
                      {/* Checkbox */}
                      <div className="flex items-center">
                        <div
                          className={cn(
                            "h-4 w-4 rounded border border-gray-300 flex items-center justify-center",
                            selected
                              ? "bg-primary border-primary"
                              : "bg-background"
                          )}
                        >
                          {selected && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {getInitials(friend.friend.name)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online status indicator */}
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                            friend.isOnline ? "bg-green-500" : "bg-gray-400"
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {friend.friend.name}
                          </p>
                          {friend.isOnline && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200"
                            >
                              Online
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {friend.friend.email}
                        </p>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

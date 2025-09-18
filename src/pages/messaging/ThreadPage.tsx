import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth-client";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useMarkThreadMessagesRead } from "../../hooks/notifications.hook";
import {
  useThread,
  useMessages,
  useDeleteMessage,
  useAddParticipant,
  useLeaveThread,
} from "../../hooks/messaging.hook";
import { useFriends } from "../../hooks/friends.hook";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  UserPlus,
  LogOut,
  Trash2,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { emit, on, off, isConnected } = useWebSocket();

  const [newMessage, setNewMessage] = useState("");
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const markThreadRead = useMarkThreadMessagesRead();

  const {
    data: thread,
    isLoading: threadLoading,
    error: threadError,
  } = useThread(threadId);
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages(threadId);
  const { data: friends } = useFriends();

  const deleteMessage = useDeleteMessage();
  const addParticipant = useAddParticipant();
  const leaveThread = useLeaveThread();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket event handlers
  useEffect(() => {
    if (!threadId || !isConnected) return;

    // Join the thread room
    console.log("Joining thread:", threadId);
    emit("thread:join", { threadId });

    // Listen for new messages
    const handleNewMessage = (message: unknown) => {
      console.log("Received new message:", message);
      // Invalidate and refetch messages when a new message is received
      queryClient.invalidateQueries({
        queryKey: ["messaging", "threads", threadId, "messages"],
      });
      // Also invalidate the threads list to update last message preview
      queryClient.invalidateQueries({
        queryKey: ["messaging", "threads"],
      });
    };

    // Listen for deletions
    const handleDeleted = (data: { messageId: string }) => {
      queryClient.invalidateQueries({
        queryKey: ["messaging", "threads", threadId, "messages"],
      });
    };

    // Listen for edits
    const handleEdited = (_message: unknown) => {
      queryClient.invalidateQueries({
        queryKey: ["messaging", "threads", threadId, "messages"],
      });
    };

    // Listen for typing events
    const handleUserTyping = (data: {
      userId: string;
      user: {
        id: string;
        name: string;
      };
      isTyping: boolean;
    }) => {
      if (data.userId === session?.user?.id) return;

      setTypingUsers((prev) => {
        if (data.isTyping) {
          return prev.includes(data.user.name)
            ? prev
            : [...prev, data.user.name];
        } else {
          return prev.filter((name) => name !== data.user.name);
        }
      });
    };

    on("message:new", handleNewMessage);
    on("message:typing", handleUserTyping);
    on("message:deleted", handleDeleted);
    on("message:edited", handleEdited);

    return () => {
      emit("thread:leave", { threadId });
      off("message:new", handleNewMessage);
      off("message:typing", handleUserTyping);
      off("message:deleted", handleDeleted);
      off("message:edited", handleEdited);
    };
  }, [threadId, isConnected, session?.user?.id, emit, on, off, queryClient]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!threadId || !isConnected) return;

    if (!isTyping) {
      setIsTyping(true);
      emit("message:typing", { threadId, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emit("message:typing", { threadId, isTyping: false });
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !threadId || !isConnected) return;

    // Send message via WebSocket for real-time updates
    emit("message:send", {
      threadId,
      content: newMessage.trim(),
    });

    // Clear input immediately for better UX
    setNewMessage("");
  };

  // Mark thread notifications as read when viewing
  useEffect(() => {
    if (threadId) {
      markThreadRead.mutate(threadId);
    }
  }, [threadId]);

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessage.mutate(messageId);
    }
  };

  const handleAddParticipant = () => {
    if (!selectedFriend || !threadId) return;

    addParticipant.mutate(
      {
        threadId,
        participantId: selectedFriend,
      },
      {
        onSuccess: () => {
          setIsAddParticipantOpen(false);
          setSelectedFriend("");
        },
      }
    );
  };

  const handleLeaveThread = () => {
    if (!threadId) return;

    if (window.confirm("Are you sure you want to leave this conversation?")) {
      leaveThread.mutate(threadId, {
        onSuccess: () => {
          navigate("/messaging");
        },
      });
    }
  };

  const isLoading = threadLoading || messagesLoading;
  const hasError = threadError || messagesError;

  if (isLoading) return <Loading />;

  if (hasError || !thread) {
    return (
      <Error
        message="Failed to load conversation"
        onRetry={() => navigate("/messaging")}
      />
    );
  }

  const availableFriends =
    friends?.filter(
      (f) => !thread.participants.some((p) => p.user.id === f.friend.id)
    ) || [];

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    if (!name) return "?";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Helper function to generate consistent colors based on user ID
  const generateUserColor = (userId: string): string => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-background h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/messaging")}
          className="lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">{thread.name}</h1>
            <p className="text-sm text-muted-foreground">
              {thread.participants.length} participants
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog
              open={isAddParticipantOpen}
              onOpenChange={setIsAddParticipantOpen}
            >
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Participant
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Participant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Friend</label>
                    <Select
                      value={selectedFriend}
                      onValueChange={setSelectedFriend}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a friend to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFriends.map((friendItem) => (
                          <SelectItem
                            key={friendItem.friend.id}
                            value={friendItem.friend.id}
                          >
                            {friendItem.friend.name} ({friendItem.friend.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleAddParticipant}
                      disabled={!selectedFriend || addParticipant.isPending}
                      className="flex-1"
                    >
                      {addParticipant.isPending
                        ? "Adding..."
                        : "Add Participant"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddParticipantOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <DropdownMenuItem
              onClick={handleLeaveThread}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 px-6 py-6">
            {!messages || messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    No messages yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Send the first message to start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId === session?.user?.id;
                const senderColor = generateUserColor(message.senderId);

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 items-end ${
                      isOwnMessage ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                      style={{ backgroundColor: senderColor }}
                    >
                      {getInitials(
                        isOwnMessage
                          ? session?.user?.name || "You"
                          : message.sender.name
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[60%] flex flex-col ${
                        isOwnMessage ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 relative ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed mb-1">
                          {message.content}
                        </p>

                        {/* Timestamp in bottom right corner */}
                        <div
                          className={`flex items-center gap-2 mt-1 justify-end ${
                            isOwnMessage
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {isOwnMessage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="h-4 w-4 p-0 opacity-70 hover:opacity-100 hover:bg-primary-foreground/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-border bg-background flex-shrink-0">
            {/* Connection Status */}
            {!isConnected && (
              <div className="px-6 py-2 text-sm text-destructive bg-destructive/10 border-b border-destructive/20">
                ⚠️ Connection lost - real-time messaging unavailable
              </div>
            )}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="px-6 py-2 text-sm text-muted-foreground italic bg-muted/30 border-b border-border">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.slice(0, -1).join(", ")} and ${
                      typingUsers[typingUsers.length - 1]
                    } are typing...`}
              </div>
            )}

            {/* Message Input */}
            <div className="p-6">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {getInitials(session?.user?.name || "You")}
                  </span>
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    className="flex-1 rounded-full border-muted-foreground/20 bg-muted/30"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected}
                    title={!isConnected ? "Connection lost" : "Send message"}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Participants Sidebar - Desktop Only */}
        <div className="hidden lg:flex w-80 border-l border-border bg-card/30 backdrop-blur-sm flex-col min-h-0">
          <div className="p-4 border-b border-border flex-shrink-0">
            <h2 className="font-semibold text-lg mb-1">Participants</h2>
            <p className="text-sm text-muted-foreground">
              {thread.participants.length} members
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {thread.participants.map((participant) => {
                const isCurrentUser = participant.user.id === session?.user?.id;
                const userColor = generateUserColor(participant.user.id);

                return (
                  <div
                    key={participant.user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: userColor }}
                    >
                      {getInitials(participant.user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {participant.user.name}
                        </p>
                        {isCurrentUser && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {participant.role?.toLowerCase() || "Member"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

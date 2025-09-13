import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth-client";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useMarkThreadMessagesRead } from "../../hooks/notifications.hook";
import {
  useThread,
  useMessages,
  useSendMessage,
  useDeleteMessage,
  useAddParticipant,
  useLeaveThread,
} from "../../hooks/messaging.hook";
import { useFriends } from "../../hooks/friends.hook";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
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
      if (data.userId === session?.user?.id) return; // Ignore own typing

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

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/messaging")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{thread.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {thread.participants.length} participants
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {thread.participants.slice(0, 3).map((participant) => (
              <Badge
                key={participant.user.id}
                variant="outline"
                className="text-xs"
              >
                {participant.user.name}
              </Badge>
            ))}
            {thread.participants.length > 3 && (
              <Badge
                key="more-participants"
                variant="outline"
                className="text-xs"
              >
                +{thread.participants.length - 3} more
              </Badge>
            )}
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
                      <label className="text-sm font-medium">
                        Select Friend
                      </label>
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
                              {friendItem.friend.name} (
                              {friendItem.friend.email})
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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Send the first message to start the conversation!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === session?.user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-[70%] ${
                    isOwnMessage ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {isOwnMessage ? "You" : message.sender.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {isOwnMessage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id)}
                            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mb-2">
          ⚠️ WebSocket disconnected - real-time messaging unavailable
        </div>
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="text-sm text-muted-foreground italic mb-2">
          {typingUsers.length === 1
            ? `${typingUsers[0]} is typing...`
            : `${typingUsers.slice(0, -1).join(", ")} and ${
                typingUsers[typingUsers.length - 1]
              } are typing...`}
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!newMessage.trim() || !isConnected}
          title={!isConnected ? "WebSocket disconnected" : "Send message"}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

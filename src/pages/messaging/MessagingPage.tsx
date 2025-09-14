import { useState } from "react";
import { useNavigate } from "react-router";
import { useThreads, useCreateThread } from "../../hooks/messaging.hook";
import { useFriends } from "../../hooks/friends.hook";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
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
import { MessageSquare, Plus, Users, Clock, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function MessagingPage() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const {
    data: threads,
    isLoading: threadsLoading,
    error: threadsError,
    refetch: refetchThreads,
  } = useThreads();
  const { data: friends, isLoading: friendsLoading } = useFriends();
  const createThread = useCreateThread();

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || selectedFriends.length === 0) return;

    createThread.mutate(
      {
        name: newThreadTitle.trim(),
        participantIds: selectedFriends,
      },
      {
        onSuccess: (thread) => {
          setIsCreateDialogOpen(false);
          setNewThreadTitle("");
          setSelectedFriends([]);
          navigate(`/messaging/${thread.id}`);
        },
      }
    );
  };

  const handleThreadClick = (threadId: string) => {
    navigate(`/messaging/${threadId}`);
  };

  const isLoading = threadsLoading || friendsLoading;
  const hasError = threadsError;

  if (isLoading) return <Loading />;

  if (hasError) {
    return (
      <Error message="Failed to load messaging data" onRetry={refetchThreads} />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3 sm:mb-2 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Chat with your friends and collaborate in real-time
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button title="New Conversation" className="ml-4">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline sm:ml-2">
                    New Conversation
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Conversation Title
                    </label>
                    <Input
                      placeholder="Enter conversation title"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Add Friends</label>
                    <Select
                      value=""
                      onValueChange={(friendId) => {
                        if (friendId && !selectedFriends.includes(friendId)) {
                          setSelectedFriends([...selectedFriends, friendId]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select friends to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {friends
                          ?.filter(
                            (f) => !selectedFriends.includes(f.friend.id)
                          )
                          .map((friendItem) => (
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
                  {selectedFriends.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedFriends.map((friendId) => {
                        const friendItem = friends?.find(
                          (f) => f.friend.id === friendId
                        );
                        return (
                          <Badge
                            key={friendId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {friendItem?.friend.name}
                            <button
                              onClick={() =>
                                setSelectedFriends(
                                  selectedFriends.filter(
                                    (id) => id !== friendId
                                  )
                                )
                              }
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCreateThread}
                      disabled={
                        !newThreadTitle.trim() ||
                        selectedFriends.length === 0 ||
                        createThread.isPending
                      }
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {createThread.isPending
                        ? "Creating..."
                        : "Create Conversation"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Conversation Counter - Better positioned for mobile */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{threads?.length || 0}</span>
            <span className="hidden sm:inline">conversations</span>
          </div>
        </div>
      </div>

      {!threads || threads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start a conversation with your friends to begin collaborating
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start First Conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {threads.map((thread) => (
            <Card
              key={thread.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleThreadClick(thread.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{thread.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {thread.participants.length}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {thread.participants.map((participant) => (
                    <Badge
                      key={participant.user.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {participant.user.name}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {thread.lastMessageContent && thread.lastMessageAt ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(thread.lastMessageAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {thread.lastMessageContent}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No messages yet
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

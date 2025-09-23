import { useEffect, useState } from "react";
import { useSession } from "../../lib/auth-client";
import { useOutletContext, useNavigate } from "react-router";
import { useSearchUsers } from "../../hooks/search.hook";
import { toast } from "sonner";
import {
  useFriends,
  usePendingRequests,
  useSentRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriend,
  useCancelFriendRequest,
} from "../../hooks/friends.hook";
import { useStartConversation } from "../../hooks/messaging.hook";
import { useMarkAllRead } from "../../hooks/notifications.hook";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";
import { UserAvatar } from "../../components/common/UserAvatar";
import {
  Users,
  UserPlus,
  Mail,
  Check,
  X,
  MoreVertical,
  UserMinus,
  Clock,
  Send,
  Eye,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function FriendsPage() {
  const [email, setEmail] = useState("");
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { searchQuery, searchContext } = useOutletContext<{
    searchQuery: string;
    searchContext: string;
  }>();

  const {
    data: friends,
    isLoading: friendsLoading,
    error: friendsError,
    refetch: refetchFriends,
  } = useFriends();
  const {
    data: pendingRequests,
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = usePendingRequests();
  const {
    data: sentRequests,
    isLoading: sentLoading,
    error: sentError,
    refetch: refetchSent,
  } = useSentRequests();

  const sendFriendRequest = useSendFriendRequest();
  const acceptFriendRequest = useAcceptFriendRequest();
  const declineFriendRequest = useDeclineFriendRequest();
  const removeFriend = useRemoveFriend();
  const cancelFriendRequest = useCancelFriendRequest();
  const startConversation = useStartConversation();

  // Filter friends locally based on search query
  const filteredFriends =
    friends?.filter((friend) =>
      !searchQuery || searchQuery.length < 2 || searchContext !== "friends"
        ? true
        : friend.friend.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          friend.friend.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  const markAllRead = useMarkAllRead();

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Prevent sending friend request to yourself
    if (
      session?.user?.email &&
      email.trim().toLowerCase() === session.user.email.toLowerCase()
    ) {
      toast.error("You cannot send a friend request to yourself");
      return;
    }

    sendFriendRequest.mutate(
      { email: email.trim() },
      {
        onSuccess: () => setEmail(""),
      }
    );
  };

  const handleAcceptRequest = (requestId: string) => {
    acceptFriendRequest.mutate(requestId);
  };

  const handleDeclineRequest = (requestId: string) => {
    declineFriendRequest.mutate(requestId);
  };

  const handleRemoveFriend = (friendId: string) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      removeFriend.mutate(friendId);
    }
  };

  const handleCancelRequest = (requestId: string) => {
    if (window.confirm("Are you sure you want to cancel this friend request?")) {
      cancelFriendRequest.mutate(requestId);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleStartConversation = (friendId: string, friendName: string) => {
    startConversation.mutate(
      { participantId: friendId, participantName: friendName },
      {
        onSuccess: ({ threadId, isNew }) => {
          if (isNew) {
            toast.success(`Started new conversation with ${friendName}`);
          }
          navigate(`/messaging/${threadId}`);
        },
      }
    );
  };

  const isLoading = friendsLoading || pendingLoading || sentLoading;
  const hasError = friendsError || pendingError || sentError;

  // Reset friend-related notifications when viewing this page
  useEffect(() => {
    markAllRead.mutate("friend_request");
    markAllRead.mutate("friend_accepted");
  }, []);

  if (isLoading) return <Loading />;

  if (hasError) {
    return (
      <Error
        message="Failed to load friends data"
        onRetry={() => {
          refetchFriends();
          refetchPending();
          refetchSent();
        }}
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Friends</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Manage your friend connections and collaboration network
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {friends?.length || 0}{" "}
            <span className="hidden sm:inline">friends</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Send Friend Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendRequest} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter friend's email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!email.trim() || sendFriendRequest.isPending}
                title={
                  sendFriendRequest.isPending ? "Sending..." : "Send Request"
                }
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">
                  {sendFriendRequest.isPending ? "Sending..." : "Send Request"}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Friends ({friends?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Requests ({pendingRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sent ({sentRequests?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          {filteredFriends.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your collaboration network by sending friend
                  requests
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFriends.map((friendItem) => {
                return (
                  <Card key={friendItem.friend.id} className="group transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={friendItem.friend.name}
                          avatar={friendItem.friend.profile?.avatar}
                          size="lg"
                          className="cursor-pointer transition-transform group-hover:scale-105"
                          onClick={() => handleViewProfile(friendItem.friend.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {friendItem.friend.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground truncate">
                            {friendItem.friend.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                friendItem.isOnline ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {friendItem.isOnline ? "Online" : "Offline"}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewProfile(friendItem.friend.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStartConversation(friendItem.friend.id, friendItem.friend.name)}
                              disabled={startConversation.isPending}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRemoveFriend(friendItem.friend.id)
                              }
                              className="text-destructive focus:text-destructive"
                              disabled={removeFriend.isPending}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Friend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <Badge variant="outline" className="text-xs w-fit">
                          Friends since{" "}
                          {formatDistanceToNow(
                            new Date(friendItem.friendsSince),
                            { addSuffix: true }
                          )}
                        </Badge>
                        {!friendItem.isOnline && friendItem.lastSeenAt && (
                          <p className="text-xs text-muted-foreground">
                            Last seen{" "}
                            {formatDistanceToNow(
                              new Date(friendItem.lastSeenAt),
                              { addSuffix: true }
                            )}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStartConversation(friendItem.friend.id, friendItem.friend.name)}
                            disabled={startConversation.isPending}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProfile(friendItem.friend.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {!pendingRequests || pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No pending requests
                </h3>
                <p className="text-muted-foreground text-center">
                  Friend requests will appear here when others want to connect
                  with you
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <UserAvatar
                          name={request.requester.name}
                          avatar={request.requester.profile?.avatar}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">
                            {request.requester.name}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {request.requester.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Sent{" "}
                            {formatDistanceToNow(new Date(request.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={acceptFriendRequest.isPending}
                          title="Accept"
                        >
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline sm:ml-2">
                            Accept
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                          disabled={declineFriendRequest.isPending}
                          title="Decline"
                        >
                          <X className="h-4 w-4" />
                          <span className="hidden sm:inline sm:ml-2">
                            Decline
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {!sentRequests || sentRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sent requests</h3>
                <p className="text-muted-foreground text-center">
                  Friend requests you send will appear here while pending
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sentRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <UserAvatar
                          name={request.addressee.name}
                          avatar={request.addressee.profile?.avatar}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">
                            {request.addressee.name}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {request.addressee.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Sent{" "}
                            {formatDistanceToNow(new Date(request.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Pending</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelRequest(request.id)}
                          disabled={cancelFriendRequest.isPending}
                          title="Cancel Request"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                          <span className="hidden sm:inline sm:ml-2">
                            Cancel
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { useSession } from "../../lib/auth-client";
import { toast } from "sonner";
import { 
  useFriends, 
  usePendingRequests, 
  useSentRequests, 
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriend
} from "../../hooks/friends.hook";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Check, 
  X, 
  MoreVertical, 
  UserMinus,
  Clock,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function FriendsPage() {
  const [email, setEmail] = useState("");
  const { data: session } = useSession();
  
  const { data: friends, isLoading: friendsLoading, error: friendsError, refetch: refetchFriends } = useFriends();
  const { data: pendingRequests, isLoading: pendingLoading, error: pendingError, refetch: refetchPending } = usePendingRequests();
  const { data: sentRequests, isLoading: sentLoading, error: sentError, refetch: refetchSent } = useSentRequests();
  
  const sendFriendRequest = useSendFriendRequest();
  const acceptFriendRequest = useAcceptFriendRequest();
  const declineFriendRequest = useDeclineFriendRequest();
  const removeFriend = useRemoveFriend();

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    // Prevent sending friend request to yourself
    if (session?.user?.email && email.trim().toLowerCase() === session.user.email.toLowerCase()) {
      toast.error("You cannot send a friend request to yourself");
      return;
    }
    
    sendFriendRequest.mutate({ email: email.trim() }, {
      onSuccess: () => setEmail("")
    });
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

  const isLoading = friendsLoading || pendingLoading || sentLoading;
  const hasError = friendsError || pendingError || sentError;

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Friends</h1>
            <p className="text-muted-foreground">
              Manage your friend connections and collaboration network
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {friends?.length || 0} friends
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
              >
                <Send className="h-4 w-4 mr-2" />
                {sendFriendRequest.isPending ? "Sending..." : "Send Request"}
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
          {!friends || friends.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your collaboration network by sending friend requests
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friendItem, index) => {
                return (
                  <Card key={friendItem.friend.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{friendItem.friend.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{friendItem.friend.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={friendItem.isOnline ? "default" : "secondary"} className="text-xs">
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
                              onClick={() => handleRemoveFriend(friendItem.friend.id)}
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
                        <Badge variant="outline" className="text-xs">
                          Friends since {formatDistanceToNow(new Date(friendItem.friendsSince), { addSuffix: true })}
                        </Badge>
                        {!friendItem.isOnline && friendItem.lastSeenAt && (
                          <p className="text-xs text-muted-foreground">
                            Last seen {formatDistanceToNow(new Date(friendItem.lastSeenAt), { addSuffix: true })}
                          </p>
                        )}
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
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground text-center">
                  Friend requests will appear here when others want to connect with you
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{request.requester.name}</h4>
                        <p className="text-sm text-muted-foreground">{request.requester.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sent {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={acceptFriendRequest.isPending}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                          disabled={declineFriendRequest.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
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
                      <div className="flex-1">
                        <h4 className="font-semibold">{request.addressee.name}</h4>
                        <p className="text-sm text-muted-foreground">{request.addressee.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sent {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
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
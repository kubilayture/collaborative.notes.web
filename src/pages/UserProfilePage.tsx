import { useParams, useNavigate } from "react-router";
import { useUserProfile } from "../hooks/profile.hook";
import { useStartConversation } from "../hooks/messaging.hook";
import { useSession } from "../lib/auth-client";
import { toast } from "sonner";
import { UserAvatar } from "../components/common/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, MessageCircle, Calendar, Mail, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Loading from "../components/common/Loading";
import Error from "../components/common/Error";

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data: user, isLoading, error, refetch } = useUserProfile(userId);
  const startConversation = useStartConversation();

  const isOwnProfile = session?.user?.id === userId;

  if (isLoading) return <Loading />;

  if (error || !user) {
    return (
      <Error
        message="Failed to load user profile"
        onRetry={() => refetch()}
      />
    );
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartConversation = () => {
    if (!user || !userId) return;

    startConversation.mutate(
      { participantId: userId, participantName: user.name },
      {
        onSuccess: ({ threadId, isNew }) => {
          if (isNew) {
            toast.success(`Started new conversation with ${user.name}`);
          }
          navigate(`/messaging/${threadId}`);
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <UserAvatar
                name={user.name}
                avatar={user.profile?.avatar}
                size="xl"
              />
              <div className="space-y-1">
                <CardTitle className="text-xl">{user.name}</CardTitle>
                {user.profile?.username && (
                  <p className="text-sm text-muted-foreground">
                    @{user.profile.username}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2">
                  <Badge
                    variant={user.profile?.isOnline ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {user.profile?.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.profile?.bio && (
              <div>
                <h4 className="text-sm font-semibold mb-2">About</h4>
                <p className="text-sm text-muted-foreground">{user.profile.bio}</p>
              </div>
            )}

            <Separator />

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{user.email}</span>
              </div>

              {user.profile?.timezone && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.profile.timezone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </span>
              </div>

              {!user.profile?.isOnline && user.profile?.lastSeenAt && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Last seen {formatDistanceToNow(new Date(user.profile.lastSeenAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {!isOwnProfile && (
              <>
                <Separator />
                <Button
                  className="w-full"
                  onClick={handleStartConversation}
                  disabled={startConversation.isPending}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {startConversation.isPending ? "Starting..." : "Start Conversation"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Shared Notes</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Collaborations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shared Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Shared Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shared notes yet</h3>
                <p className="text-muted-foreground text-sm">
                  {isOwnProfile
                    ? "Your shared notes will appear here when you collaborate with others."
                    : `${user.name} hasn't shared any notes yet.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                <p className="text-muted-foreground text-sm">
                  Recent activities will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useMarkAllRead } from "../../hooks/notifications.hook";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Mail, Clock, FileText, User, Check, X, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Invitation {
  id: string;
  token: string;
  noteId: string;
  note: {
    id: string;
    title: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
  };
  inviterId: string;
  inviter: {
    id: string;
    name: string;
    email: string;
  };
  inviteeEmail: string;
  role: "VIEWER" | "COMMENTER" | "EDITOR";
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
}

const getRoleInfo = (role: string) => {
  const roleLabels = {
    VIEWER: {
      label: "Viewer",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    COMMENTER: {
      label: "Commenter",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    EDITOR: {
      label: "Editor",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
  };
  const key = (role || "").toUpperCase() as keyof typeof roleLabels;
  return roleLabels[key] || roleLabels.VIEWER;
};

export function InvitationsPage() {
  const queryClient = useQueryClient();
  const markAllRead = useMarkAllRead();

  // Reset invitation notifications on view (must run before any early returns)
  useEffect(() => {
    markAllRead.mutate("note_invitation");
  }, []);

  // Fetch my pending invitations (received)
  const {
    data: invitations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-invitations"],
    queryFn: async (): Promise<Invitation[]> => {
      const response = await api.get("/invitations");
      return response.data;
    },
  });

  // Fetch my sent invitations
  const {
    data: sentInvitations = [],
    isLoading: sentLoading,
    error: sentError,
  } = useQuery({
    queryKey: ["my-sent-invitations"],
    queryFn: async (): Promise<Invitation[]> => {
      const response = await api.get("/invitations/sent");
      return response.data;
    },
  });

  // Accept invitation mutation
  const acceptInvitation = useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post(`/invitations/${token}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      toast.success("Invitation accepted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to accept invitation"
      );
    },
  });

  // Decline invitation mutation
  const declineInvitation = useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post(`/invitations/${token}/decline`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      toast.success("Invitation declined");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to decline invitation"
      );
    },
  });

  // Cancel sent invitation mutation
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await api.delete(`/invitations/${invitationId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-sent-invitations"] });
      toast.success("Invitation cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel invitation"
      );
    },
  });

  if (isLoading || sentLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center">
          <div className="text-muted-foreground">Loading invitations...</div>
        </div>
      </div>
    );
  }

  if (error || sentError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center">
          <div className="text-destructive">Failed to load invitations</div>
        </div>
      </div>
    );
  }

  const handleCancelInvitation = (invitationId: string) => {
    if (window.confirm("Are you sure you want to cancel this invitation?")) {
      cancelInvitation.mutate(invitationId);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Invitations</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Manage your note collaboration invitations
        </p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Received ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent ({sentInvitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {invitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invitations</h3>
                <p className="text-muted-foreground text-center">
                  You don't have any pending invitations at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const roleInfo = getRoleInfo(invitation.role);
                const status = (invitation.status || "").toUpperCase();
                const isExpired = new Date(invitation.expiresAt) < new Date();

                return (
                  <Card key={invitation.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {invitation.note.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Invited by {invitation.inviter.name} (
                            {invitation.inviter.email})
                          </CardDescription>
                        </div>
                        <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Sent{" "}
                            {formatDistanceToNow(new Date(invitation.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Expires{" "}
                            {formatDistanceToNow(new Date(invitation.expiresAt))}
                          </div>
                        </div>

                        {status === "PENDING" && !isExpired ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                declineInvitation.mutate(invitation.token)
                              }
                              disabled={declineInvitation.isPending}
                              title="Decline"
                            >
                              <X className="h-4 w-4" />
                              <span className="hidden sm:inline sm:ml-1">
                                Decline
                              </span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                acceptInvitation.mutate(invitation.token)
                              }
                              disabled={acceptInvitation.isPending}
                              title="Accept"
                            >
                              <Check className="h-4 w-4" />
                              <span className="hidden sm:inline sm:ml-1">
                                Accept
                              </span>
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary">
                            {isExpired ? "Expired" : status}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {sentInvitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sent invitations</h3>
                <p className="text-muted-foreground text-center">
                  You haven't sent any pending invitations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sentInvitations.map((invitation) => {
                const roleInfo = getRoleInfo(invitation.role);
                const status = (invitation.status || "").toUpperCase();
                const isExpired = new Date(invitation.expiresAt) < new Date();

                return (
                  <Card key={invitation.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {invitation.note.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Sent to {invitation.inviteeEmail}
                          </CardDescription>
                        </div>
                        <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Sent{" "}
                            {formatDistanceToNow(new Date(invitation.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Expires{" "}
                            {formatDistanceToNow(new Date(invitation.expiresAt))}
                          </div>
                        </div>

                        {status === "PENDING" && !isExpired ? (
                          <div className="flex gap-2">
                            <Badge variant="outline">Pending</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelInvitation(invitation.id)}
                              disabled={cancelInvitation.isPending}
                              title="Cancel"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                              <span className="hidden sm:inline sm:ml-1">
                                Cancel
                              </span>
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary">
                            {isExpired ? "Expired" : status}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

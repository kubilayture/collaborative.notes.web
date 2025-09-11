import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "../../lib/auth-client";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";
import { 
  FileText, 
  Users, 
  Crown, 
  Edit3, 
  MessageSquare, 
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Note {
  id: string;
  title: string;
  owner: User;
}

interface Invitation {
  id: string;
  token: string;
  note: Note;
  inviter: User;
  inviteeEmail: string;
  role: 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

const roleInfo = {
  OWNER: { label: "Owner", icon: Crown, color: "bg-yellow-100 text-yellow-800", description: "Full control over the note" },
  EDITOR: { label: "Editor", icon: Edit3, color: "bg-blue-100 text-blue-800", description: "Can edit and collaborate" },
  COMMENTER: { label: "Commenter", icon: MessageSquare, color: "bg-green-100 text-green-800", description: "Can add comments and suggestions" },
  VIEWER: { label: "Viewer", icon: Eye, color: "bg-gray-100 text-gray-800", description: "Can view and read only" },
};

export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data: session, isPending: sessionLoading } = useSession();
  
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  // Fetch invitation details
  const { data: invitation, isLoading, error, refetch } = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      const response = await fetch(`/api/invitations/token/${token}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch invitation');
      }
      return response.json();
    },
    enabled: !!token,
  });

  // Accept invitation mutation
  const acceptInvitation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to accept invitation');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setIsAccepting(false);
      // Redirect to the note
      navigate(`/notes/${invitation.note.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message);
      setIsAccepting(false);
    },
  });

  // Decline invitation mutation
  const declineInvitation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/invitations/${token}/decline`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to decline invitation');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setIsDeclining(false);
      navigate('/notes');
    },
    onError: (error: any) => {
      toast.error(error.message);
      setIsDeclining(false);
    },
  });

  const handleAccept = () => {
    setIsAccepting(true);
    acceptInvitation.mutate();
  };

  const handleDecline = () => {
    setIsDeclining(true);
    declineInvitation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (sessionLoading || isLoading) return <Loading />;
  
  if (!session) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              You need to be signed in to accept this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth/signin')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Error 
          message={error.message || "Failed to load invitation"} 
          onRetry={refetch} 
        />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Invitation not found</CardTitle>
            <CardDescription>
              This invitation link may be invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/notes')}>
              Go to Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if invitation has expired
  const isExpired = new Date(invitation.expiresAt) < new Date();
  const currentRole = roleInfo[invitation.role];
  const IconComponent = currentRole.icon;

  // Handle already processed invitations
  if (invitation.status !== 'PENDING') {
    const statusConfig = {
      ACCEPTED: { icon: CheckCircle, color: 'text-green-600', message: 'You have already accepted this invitation.' },
      DECLINED: { icon: XCircle, color: 'text-red-600', message: 'You have declined this invitation.' },
      EXPIRED: { icon: Clock, color: 'text-gray-600', message: 'This invitation has expired.' },
    };
    
    const config = statusConfig[invitation.status];
    const StatusIcon = config.icon;
    
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${config.color}`} />
              Invitation {invitation.status.toLowerCase()}
            </CardTitle>
            <CardDescription>
              {config.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitation.status === 'ACCEPTED' ? (
              <Button onClick={() => navigate(`/notes/${invitation.note.id}`)}>
                Go to Note
              </Button>
            ) : (
              <Button onClick={() => navigate('/notes')}>
                Go to Notes
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user's email matches invitation
  if (session.user?.email !== invitation.inviteeEmail) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Wrong account</CardTitle>
            <CardDescription>
              This invitation is for {invitation.inviteeEmail}, but you're signed in as {session.user?.email}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please sign in with the correct account or ask the sender to send a new invitation.
              </p>
              <Button onClick={() => navigate('/auth/signin')}>
                Sign in with different account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Invitation expired
            </CardTitle>
            <CardDescription>
              This invitation expired {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please ask {invitation.inviter.name} to send you a new invitation.
              </p>
              <Button onClick={() => navigate('/notes')}>
                Go to Notes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            You're invited to collaborate
          </CardTitle>
          <CardDescription>
            {invitation.inviter.name} has invited you to collaborate on a note.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Inviter info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={invitation.inviter.image} />
              <AvatarFallback>{getInitials(invitation.inviter.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{invitation.inviter.name}</p>
              <p className="text-sm text-muted-foreground">{invitation.inviter.email}</p>
            </div>
          </div>

          {/* Note info */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-medium">{invitation.note.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Owned by {invitation.note.owner.name}
                </p>
              </div>
            </div>
          </div>

          {/* Role info */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Your role:</span>
              <Badge className={currentRole.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {currentRole.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentRole.description}
            </p>
          </div>

          {/* Expiration info */}
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              This invitation expires {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleAccept}
              disabled={isAccepting || isDeclining}
              className="flex-1"
            >
              {isAccepting ? "Accepting..." : "Accept invitation"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleDecline}
              disabled={isAccepting || isDeclining}
              className="flex-1"
            >
              {isDeclining ? "Declining..." : "Decline"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { 
  Users, 
  Mail, 
  X, 
  Crown, 
  Eye, 
  Edit3, 
  MessageSquare, 
  Plus,
  Copy,
  Check,
  Trash2,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  ownerId: string;
}

interface Invitation {
  id: string;
  token: string;
  inviteeEmail: string;
  invitee?: User;
  role: 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

interface SharePermissionsDialogProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleLabels = {
  OWNER: { label: "Owner", icon: Crown, color: "bg-yellow-100 text-yellow-800" },
  EDITOR: { label: "Editor", icon: Edit3, color: "bg-blue-100 text-blue-800" },
  COMMENTER: { label: "Commenter", icon: MessageSquare, color: "bg-green-100 text-green-800" },
  VIEWER: { label: "Viewer", icon: Eye, color: "bg-gray-100 text-gray-800" },
};

export function SharePermissionsDialog({ note, open, onOpenChange }: SharePermissionsDialogProps) {
  const queryClient = useQueryClient();
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'COMMENTER' | 'VIEWER'>('VIEWER');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  // Fetch invitations for this note
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['note-invitations', note.id],
    queryFn: async () => {
      const response = await fetch(`/api/invitations/note/${note.id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch invitations');
      return response.json();
    },
    enabled: open,
  });

  // Create invitation mutation
  const createInvitation = useMutation({
    mutationFn: async (data: { noteId: string; inviteeEmail: string; role: string }) => {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create invitation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-invitations', note.id] });
      setInviteEmail("");
      setInviteRole('VIEWER');
      toast.success("Invitation sent successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Cancel invitation mutation
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch(`/api/invitations/${invitationId}/cancel`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to cancel invitation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-invitations', note.id] });
      toast.success("Invitation cancelled");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;
    
    createInvitation.mutate({
      noteId: note.id,
      inviteeEmail: inviteEmail.trim(),
      role: inviteRole,
    });
  };

  const handleCopyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedToken(token);
      toast.success("Invitation link copied to clipboard!");
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleInfo = (role: string) => {
    return roleLabels[role as keyof typeof roleLabels] || roleLabels.VIEWER;
  };

  const pendingInvitations = invitations.filter((inv: Invitation) => inv.status === 'PENDING');
  const acceptedInvitations = invitations.filter((inv: Invitation) => inv.status === 'ACCEPTED');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share "{note.title}"
          </DialogTitle>
          <DialogDescription>
            Manage who can access and collaborate on this note.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite new user */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <Label className="text-sm font-medium">Invite people</Label>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInviteUser();
                    }
                  }}
                />
              </div>
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="COMMENTER">Commenter</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleInviteUser}
                disabled={!inviteEmail.trim() || createInvitation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>

          <Separator />

          {/* Current collaborators */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Label className="text-sm font-medium">People with access</Label>
            </div>

            <div className="space-y-3">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={note.owner.image} />
                    <AvatarFallback>{getInitials(note.owner.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{note.owner.name}</p>
                    <p className="text-xs text-muted-foreground">{note.owner.email}</p>
                  </div>
                </div>
                <Badge className={getRoleInfo('OWNER').color}>
                  <Crown className="h-3 w-3 mr-1" />
                  Owner
                </Badge>
              </div>

              {/* Accepted collaborators */}
              {acceptedInvitations.map((invitation: Invitation) => {
                const roleInfo = getRoleInfo(invitation.role);
                const IconComponent = roleInfo.icon;
                
                return (
                  <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={invitation.invitee?.image} />
                        <AvatarFallback>
                          {invitation.invitee?.name ? getInitials(invitation.invitee.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {invitation.invitee?.name || invitation.inviteeEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">{invitation.inviteeEmail}</p>
                      </div>
                    </div>
                    <Badge className={roleInfo.color}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {roleInfo.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending invitations */}
          {pendingInvitations.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label className="text-sm font-medium">Pending invitations</Label>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvitations.map((invitation: Invitation) => {
                      const roleInfo = getRoleInfo(invitation.role);
                      const IconComponent = roleInfo.icon;
                      
                      return (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">{invitation.inviteeEmail}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <IconComponent className="h-3 w-3" />
                              {roleInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(invitation.expiresAt))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyInviteLink(invitation.token)}
                              >
                                {copiedToken === invitation.token ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel invitation?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will cancel the invitation to {invitation.inviteeEmail}. 
                                      They will no longer be able to accept this invitation.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep invitation</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => cancelInvitation.mutate(invitation.id)}
                                      disabled={cancelInvitation.isPending}
                                    >
                                      Cancel invitation
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useNavigate, useLocation, useParams } from "react-router";
import { useSession, signOut } from "../../lib/auth-client";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  Mail,
  Settings,
  LogOut,
  Plus,
  FolderPlus,
  ChevronDown,
} from "lucide-react";
import { useNotificationCounts } from "../../hooks/notifications.hook";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams<{ folderId: string }>();
  const { data: session } = useSession();
  const { data: counts } = useNotificationCounts();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/messaging") {
      return (
        location.pathname === path ||
        location.pathname.startsWith("/messaging/")
      );
    }
    return location.pathname === path;
  };

  const navigationItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      badge: null,
    },
    {
      icon: FileText,
      label: "Notes",
      path: "/notes",
      badge: null,
    },
    {
      icon: Users,
      label: "Friends",
      path: "/friends",
      badge: counts?.friends,
    },
    {
      icon: Mail,
      label: "Invitations",
      path: "/invitations",
      badge: counts?.invitations,
    },
    {
      icon: MessageSquare,
      label: "Messages",
      path: "/messaging",
      badge: counts?.messages,
    },
  ];

  if (!session) return null;

  return (
    <div className={`h-full bg-card border-r border-border flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Header */}
      <div className="h-14 px-4 border-b border-border flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-sm">Collaborative Notes</h1>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              const basePath = folderId ? `/notes/folder/${folderId}` : "/notes";
              navigate(`${basePath}?createFolder=true`);
            }}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Button
                key={item.path}
                variant={active ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start ${collapsed ? 'px-2' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="h-5 min-w-[20px] px-1">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* New Note Section */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={() => navigate("/notes/new")}
          className="w-full"
          size={collapsed ? "icon" : "default"}
        >
          <Plus className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
          {!collapsed && "New Note"}
        </Button>
      </div>
    </div>
  );
}
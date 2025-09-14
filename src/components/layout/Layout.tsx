import { Outlet, useNavigate, useLocation } from "react-router";
import { ThemeToggle } from "../common/ThemeToggle";
import { useSession, signOut } from "../../lib/auth-client";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  FileText,
  Users,
  User,
  LogOut,
  Home,
  MessageSquare,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useNotificationCounts } from "../../hooks/notifications.hook";
import { useNotificationToasts } from "../../hooks/useNotificationToasts";
import { Badge } from "../ui/badge";
import { useState } from "react";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session } = useSession();
  const { data: counts } = useNotificationCounts();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Enable notification toasts
  useNotificationToasts();

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

  const navigateAndCloseMobile = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl font-bold">
                  Collaborative Notes
                </h1>
              </div>

              {/* Desktop Navigation */}
              {session && (
                <div className="hidden md:flex items-center space-x-4 ml-8">
                  <Button
                    variant={isActive("/") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate("/")}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                  <Button
                    variant={isActive("/notes") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate("/notes")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Notes
                  </Button>
                  <Button
                    variant={isActive("/friends") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate("/friends")}
                  >
                    <div className="relative flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Friends
                      {!!counts?.friends && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-5 min-w-[20px] px-1"
                        >
                          {counts.friends}
                        </Badge>
                      )}
                    </div>
                  </Button>
                  <Button
                    variant={isActive("/invitations") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate("/invitations")}
                  >
                    <div className="relative flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Invitations
                      {!!counts?.invitations && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-5 min-w-[20px] px-1"
                        >
                          {counts.invitations}
                        </Badge>
                      )}
                    </div>
                  </Button>
                  <Button
                    variant={isActive("/messaging") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate("/messaging")}
                  >
                    <div className="relative flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                      {!!counts?.messages && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-5 min-w-[20px] px-1"
                        >
                          {counts.messages}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle />

              {/* Sign In Button for non-authenticated users */}
              {!session && (
                <div className="hidden md:block">
                  <Button onClick={() => navigate("/login")}>Sign In</Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              {session && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-input w-input p-0"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {session && isMobileMenuOpen && (
            <div className="md:hidden border-t border-border">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Navigation Items */}
                <Button
                  variant={isActive("/") ? "default" : "ghost"}
                  className="w-full justify-start h-input"
                  onClick={() => navigateAndCloseMobile("/")}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Home className="h-5 w-5 mr-3" />
                      Home
                    </div>
                  </div>
                </Button>
                <Button
                  variant={isActive("/notes") ? "default" : "ghost"}
                  className="w-full justify-start h-input"
                  onClick={() => navigateAndCloseMobile("/notes")}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3" />
                      Notes
                    </div>
                  </div>
                </Button>
                <Button
                  variant={isActive("/friends") ? "default" : "ghost"}
                  className="w-full justify-start h-input"
                  onClick={() => navigateAndCloseMobile("/friends")}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3" />
                      Friends
                    </div>
                    {!!counts?.friends && (
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-[20px] px-1"
                      >
                        {counts.friends}
                      </Badge>
                    )}
                  </div>
                </Button>
                <Button
                  variant={isActive("/invitations") ? "default" : "ghost"}
                  className="w-full justify-start h-input"
                  onClick={() => navigateAndCloseMobile("/invitations")}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-3" />
                      Invitations
                    </div>
                    {!!counts?.invitations && (
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-[20px] px-1"
                      >
                        {counts.invitations}
                      </Badge>
                    )}
                  </div>
                </Button>
                <Button
                  variant={isActive("/messaging") ? "default" : "ghost"}
                  className="w-full justify-start h-input"
                  onClick={() => navigateAndCloseMobile("/messaging")}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-3" />
                      Messages
                    </div>
                    {!!counts?.messages && (
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-[20px] px-1"
                      >
                        {counts.messages}
                      </Badge>
                    )}
                  </div>
                </Button>

                {/* User Info Only */}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex items-center px-3 py-2">
                    <User className="h-5 w-5 mr-3" />
                    <span className="text-sm text-muted-foreground">
                      {session.user.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Login Button */}
          {!session && (
            <div className="md:hidden border-t border-border px-2 py-3">
              <Button
                className="w-full h-input"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </nav>
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

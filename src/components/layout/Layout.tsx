import { Outlet, useNavigate, useLocation } from "react-router";
import { useSession, signOut } from "../../lib/auth-client";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Switch } from "../ui/switch";
import {
  FileText,
  Users,
  User,
  LogOut,
  Home,
  MessageSquare,
  Mail,
  Menu,
  Settings,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { useNotificationCounts } from "../../hooks/notifications.hook";
import { useNotificationToasts } from "../../hooks/useNotificationToasts";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { useTheme } from "../../providers/theme-provider";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session } = useSession();
  const { data: counts } = useNotificationCounts();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useNotificationToasts();

  console.log("Current theme:", theme);

  // Get the resolved theme (system preference if theme is "system")
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

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
              {/* Mobile Menu Trigger - Left Side */}
              {session && (
                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden mr-3"
                      aria-label="Toggle navigation menu"
                    >
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="flex flex-col h-full">
                      <SheetHeader className="p-6 border-b relative">
                        <SheetTitle className="text-left">
                          Collaborative Notes
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto">
                        <div className="px-4 py-6 space-y-2">
                          {/* Navigation Items */}
                          <Button
                            variant={isActive("/") ? "default" : "ghost"}
                            className="w-full justify-start h-12"
                            onClick={() => navigateAndCloseMobile("/")}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <Home className="size-5 mr-3" />
                                Home
                              </div>
                            </div>
                          </Button>

                          <Button
                            variant={isActive("/notes") ? "default" : "ghost"}
                            className="w-full justify-start h-12"
                            onClick={() => navigateAndCloseMobile("/notes")}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <FileText className="size-5 mr-3" />
                                Notes
                              </div>
                            </div>
                          </Button>

                          <Button
                            variant={isActive("/friends") ? "default" : "ghost"}
                            className="w-full justify-start h-12"
                            onClick={() => navigateAndCloseMobile("/friends")}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <Users className="size-5 mr-3" />
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
                            variant={
                              isActive("/invitations") ? "default" : "ghost"
                            }
                            className="w-full justify-start h-12"
                            onClick={() =>
                              navigateAndCloseMobile("/invitations")
                            }
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <Mail className="size-5 mr-3" />
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
                            variant={
                              isActive("/messaging") ? "default" : "ghost"
                            }
                            className="w-full justify-start h-12"
                            onClick={() => navigateAndCloseMobile("/messaging")}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <MessageSquare className="size-5 mr-3" />
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
                        </div>
                      </div>

                      {/* Theme Toggle & User Info */}
                      <div className="border-t px-4 py-6 space-y-2">
                        {/* Theme Switch */}
                        <div className="flex items-center justify-between h-12 px-3">
                          <div className="flex items-center">
                            {resolvedTheme === "dark" ? (
                              <Moon className="size-5 mr-3" />
                            ) : (
                              <Sun className="size-5 mr-3" />
                            )}
                            <span className="text-sm font-medium">
                              Dark mode
                            </span>
                          </div>
                          <Switch
                            checked={resolvedTheme === "dark"}
                            onCheckedChange={(checked) => {
                              setTheme(checked ? "dark" : "light");
                            }}
                          />
                        </div>

                        {/* Settings */}
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-12"
                          onClick={() => navigateAndCloseMobile("/settings")}
                        >
                          <Settings className="size-5 mr-1" />
                          Settings
                        </Button>

                        {/* User Info with Sign Out */}
                        <div className="flex items-center justify-between h-12 px-3">
                          <div className="flex items-center min-w-0 flex-1">
                            <User className="size-5 mr-3 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground truncate">
                              {session.user.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="ml-2 h-8 w-8 p-0 flex-shrink-0"
                          >
                            <LogOut className="size-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}

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
              {/* Sign In Button for non-authenticated users */}
              {!session && (
                <Button onClick={() => navigate("/login")}>Sign In</Button>
              )}

              {/* Desktop User Dropdown */}
              {session && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hidden md:flex items-center space-x-2 h-input"
                    >
                      <span className="text-sm font-medium">
                        {session.user.name}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/settings")}
                      className="flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        console.log(
                          "Desktop dropdown clicked:",
                          theme,
                          "resolved:",
                          resolvedTheme
                        );
                        setTheme(resolvedTheme === "dark" ? "light" : "dark");
                      }}
                      className="flex items-center"
                    >
                      {resolvedTheme === "dark" ? (
                        <Sun className="h-4 w-4 mr-2" />
                      ) : (
                        <Moon className="h-4 w-4 mr-2" />
                      )}
                      {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

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

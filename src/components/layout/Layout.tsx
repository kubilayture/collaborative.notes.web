import { Outlet, useNavigate, useLocation } from "react-router";
import { ThemeToggle } from "../common/ThemeToggle";
import { useSession, signOut } from "../../lib/auth-client";
import { Button } from "../ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { FileText, Users, User, LogOut, Home } from "lucide-react";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold">Collaborative Notes</h1>
              </div>
              {session && (
                <div className="hidden md:flex items-center space-x-4">
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
                    <Users className="h-4 w-4 mr-2" />
                    Friends
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{session.user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate("/login")}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

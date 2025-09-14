import { useSession } from "../lib/auth-client";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useNavigate } from "react-router";
import { useLogout } from "../hooks/auth.hook";
import { LogOut } from "lucide-react";

export function HomePage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Collaborative Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Please log in to access your notes and start collaborating.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/login")} className="flex-1">
                Log In
              </Button>
              <Button
                onClick={() => navigate("/sign-up")}
                variant="outline"
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Ready to collaborate on your notes?
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          title="Log Out"
          className="flex-shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline sm:ml-2">Log Out</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My Notes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full justify-between">
            <p className="text-muted-foreground mb-4">
              Access and manage your collaborative notes.
            </p>
            <Button onClick={() => navigate("/notes")} className="w-full">
              View Notes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Friends</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full justify-between">
            <p className="text-muted-foreground mb-4">
              Manage your friends and send collaboration invites.
            </p>
            <Button
              onClick={() => navigate("/friends")}
              className="w-full"
              variant="outline"
            >
              Manage Friends
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full justify-between">
            <p className="text-muted-foreground mb-4">
              Chat with your collaborators in real-time.
            </p>
            <Button
              onClick={() => navigate("/messages")}
              className="w-full"
              variant="outline"
            >
              View Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

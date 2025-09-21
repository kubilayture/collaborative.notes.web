import { useSession } from "../lib/auth-client";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Users,
  FileText,
  MessageSquare,
  Zap,
  Shield,
  Globe,
  Plus,
  Clock,
  Mail,
  UserPlus,
  TrendingUp,
  Activity,
  Eye,
  Edit,
  Calendar,
} from "lucide-react";
import { useNotes } from "../hooks/notes.hook";
import { useFolders } from "../hooks/folders.hook";
import { useFriends } from "../hooks/friends.hook";
import { useThreads } from "../hooks/messaging.hook";
import { useNotificationCounts } from "../hooks/notifications.hook";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { BackgroundBeams } from "../components/ui/background-beams";
import { Spotlight } from "../components/ui/spotlight";
import { InfiniteMovingCards } from "../components/ui/infinite-moving-cards";
import { NotesListView } from "../components/notes/NotesListView";

const testimonials = [
  {
    quote:
      "This collaborative notes app has revolutionized how our team works together. Real-time editing feels seamless!",
    name: "Sarah Chen",
    title: "Product Manager at TechCorp",
  },
  {
    quote:
      "The folder organization is incredibly intuitive. We can structure our knowledge base exactly how we want.",
    name: "Marcus Rodriguez",
    title: "Lead Developer",
  },
  {
    quote:
      "Finally, a notes app that actually understands collaboration. The live cursors are a game-changer.",
    name: "Emily Johnson",
    title: "UX Designer",
  },
  {
    quote:
      "The real-time messaging keeps our team connected while we work on documents together.",
    name: "David Kim",
    title: "Project Coordinator",
  },
  {
    quote:
      "Beautiful interface, powerful features. This is how modern note-taking should work.",
    name: "Lisa Zhang",
    title: "Content Strategist",
  },
];

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "See live cursors, edit together seamlessly, and collaborate in real-time with your team members.",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    icon: FileText,
    title: "Smart Organization",
    description:
      "Unlimited nested folders, intuitive breadcrumbs, and powerful search to keep everything organized.",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Integrated Messaging",
    description:
      "Built-in chat system to discuss ideas without leaving your workspace. Context-aware conversations.",
    gradient: "from-green-400 to-green-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Powered by modern tech stack. Instant sync, optimistic updates, and blazing-fast performance.",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Enterprise-grade security with encrypted data, secure authentication, and privacy controls.",
    gradient: "from-red-400 to-pink-500",
  },
  {
    icon: Globe,
    title: "Access Anywhere",
    description:
      "Responsive design works perfectly on desktop, tablet, and mobile. Your notes, everywhere.",
    gradient: "from-indigo-400 to-cyan-400",
  },
];

export function HomePage() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  // Fetch dashboard data (hooks must be called before any conditional returns)
  const { data: notes, isLoading: notesLoading } = useNotes();
  const { data: folders, isLoading: foldersLoading } = useFolders();
  const { data: friends, isLoading: friendsLoading } = useFriends();
  const { data: threads, isLoading: threadsLoading } = useThreads();
  const { data: notificationCounts, isLoading: notificationsLoading } =
    useNotificationCounts();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
          <BackgroundBeams />

          <div className="relative z-10 text-center max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <motion.h1
                className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 leading-tight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                Collaborative Notes
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  Reimagined
                </span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Experience the future of collaborative note-taking. Real-time
                editing, intelligent organization, and seamless team
                communication - all in one beautiful, lightning-fast
                application.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/sign-up")}
                  className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-pulse-glow"
                >
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Everything You Need to
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Collaborate
                </span>
              </h2>
              <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                Powerful features designed for modern teams who value
                efficiency, creativity, and seamless collaboration.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative"
                >
                  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 hover:border-neutral-600 transition-all duration-300 hover:shadow-2xl h-full flex flex-col">
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors duration-300 flex-grow">
                      {feature.description}
                    </p>

                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Collaborative Demo Section */}
        <section className="relative py-32 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                See It in
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  {" "}
                  Action
                </span>
              </h2>
              <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                Watch how teams collaborate seamlessly with live cursors,
                real-time edits, and instant synchronization.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm text-neutral-400">
                      collaborative-notes.app
                    </div>
                  </div>

                  <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                          S
                        </div>
                        <div className="text-blue-400 text-sm">
                          Sarah is typing...
                        </div>
                      </div>

                      <motion.div
                        className="text-white space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                      >
                        <p>
                          📝 <strong>Project Roadmap Q1 2024</strong>
                        </p>
                        <p>• Implement real-time collaboration features</p>
                        <p>• Design mobile-responsive interface</p>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2, duration: 0.5 }}
                        >
                          • Launch beta testing program{" "}
                          <span className="text-green-400">
                            ← Marcus just added this
                          </span>
                        </motion.p>
                      </motion.div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          M
                        </div>
                        <div className="text-purple-400 text-sm">
                          Marcus: "Great addition! Should we set a timeline?"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Loved by
                <span className="bg-gradient-to-r from-pink-400 to-violet-600 bg-clip-text text-transparent">
                  {" "}
                  Teams Worldwide
                </span>
              </h2>
              <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                See what teams are saying about their collaborative note-taking
                experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <InfiniteMovingCards
                items={testimonials}
                direction="right"
                speed="slow"
              />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                  {" "}
                  Workflow?
                </span>
              </h2>

              <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                Join thousands of teams already collaborating more effectively.
                Start your journey with collaborative notes today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <Button
                  size="lg"
                  onClick={() => navigate("/sign-up")}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-float"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-sm text-neutral-500">
                  No credit card required • 14-day free trial
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  // Process data for dashboard
  const recentNotes = notes?.slice(0, 5) || [];
  const recentThreads = threads?.slice(0, 3) || [];
  const pendingInvitationsCount = notificationCounts?.invitations || 0;
  const unreadMessages = threads?.filter((t) => t.unreadCount > 0) || [];

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentActivity =
    notes?.filter((note) => new Date(note.updatedAt) > sevenDaysAgo) || [];

  // Calculate stats
  const totalNotes = notes?.length || 0;
  const totalFolders = folders?.length || 0;
  const totalFriends = friends?.length || 0;
  const onlineFriends = friends?.filter((f) => f.isOnline)?.length || 0;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Here's what's happening with your collaborative workspace
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate("/notes/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
        <Button
          onClick={() => navigate("/messaging")}
          variant="outline"
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          New Message
        </Button>
        <Button
          onClick={() => navigate("/friends")}
          variant="outline"
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite Friends
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalNotes}</p>
                <p className="text-xs text-muted-foreground">Total Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalFriends}</p>
                <p className="text-xs text-muted-foreground">Friends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{onlineFriends}</p>
                <p className="text-xs text-muted-foreground">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{recentActivity.length}</p>
                <p className="text-xs text-muted-foreground">Recent Activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Notes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Notes
            </CardTitle>
            <Button
              onClick={() => navigate("/notes")}
              variant="outline"
              size="sm"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {notesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentNotes.length > 0 ? (
              <NotesListView
                notes={recentNotes}
                folders={[]}
                session={session}
                onEditNote={(noteId) => navigate(`/notes/${noteId}`)}
                onShareNote={() => {}}
                onMoveNote={() => {}}
                onDeleteNote={() => {}}
                onEditFolder={() => {}}
                onDeleteFolder={() => {}}
                onFolderClick={() => {}}
                canEditNote={() => true}
                canDeleteNote={() => false}
                isDeleting={false}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notes yet. Create your first note to get started!</p>
                <Button
                  onClick={() => navigate("/notes/new")}
                  className="mt-4"
                  size="sm"
                >
                  Create Note
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar - Messages & Notifications */}
        <div className="space-y-6">
          {/* Pending Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invitations
                {pendingInvitationsCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingInvitationsCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ) : pendingInvitationsCount > 0 ? (
                <div className="space-y-2">
                  <div className="p-2 rounded border bg-card">
                    <p className="text-sm font-medium">Friend Requests</p>
                    <p className="text-xs text-muted-foreground">
                      {pendingInvitationsCount}{" "}
                      {pendingInvitationsCount === 1
                        ? "invitation"
                        : "invitations"}{" "}
                      pending
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/friends")}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View All ({pendingInvitationsCount})
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No pending invitations
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
                {unreadMessages.length > 0 && (
                  <Badge variant="destructive">
                    {unreadMessages.reduce(
                      (acc, thread) => acc + thread.unreadCount,
                      0
                    )}
                  </Badge>
                )}
              </CardTitle>
              <Button
                onClick={() => navigate("/messaging")}
                variant="outline"
                size="sm"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {threadsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-full mb-1"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : recentThreads.length > 0 ? (
                <div className="space-y-3">
                  {recentThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className="p-2 rounded border bg-card hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/messaging/${thread.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {thread.name ||
                            `Chat with ${thread.participants
                              ?.map((p) => p.user.name)
                              .join(", ")}`}
                        </p>
                        {thread.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(thread.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Folders</span>
                <span className="font-medium">{totalFolders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Shared Notes
                </span>
                <span className="font-medium">
                  {notes?.filter(
                    (n) => n.permissions && n.permissions.length > 0
                  ).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Active Conversations
                </span>
                <span className="font-medium">{threads?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

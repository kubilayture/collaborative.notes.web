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
import {
  LogOut,
  ArrowRight,
  Users,
  FileText,
  MessageSquare,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundBeams } from "../components/ui/background-beams";
import { Spotlight } from "../components/ui/spotlight";
import { InfiniteMovingCards } from "../components/ui/infinite-moving-cards";

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

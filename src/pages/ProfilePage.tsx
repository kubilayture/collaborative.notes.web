import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { useSession } from "../lib/auth-client";
import { useCurrentUser, useUpdateProfile } from "../hooks/profile.hook";
import { UserAvatar } from "../components/common/UserAvatar";
import { User, Settings, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import Loading from "../components/common/Loading";

const profileSchema = z.object({
  username: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  timezone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { data: session } = useSession();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      bio: "",
      avatar: "",
      timezone: "",
    },
  });

  useEffect(() => {
    if (currentUser?.profile) {
      reset({
        username: currentUser.profile.username || "",
        bio: currentUser.profile.bio || "",
        avatar: currentUser.profile.avatar || "",
        timezone: currentUser.profile.timezone || "",
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile.mutateAsync(data);
      reset(data);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (userLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Profile Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <UserAvatar
                name={session.user.name}
                avatar={currentUser?.profile?.avatar}
                size="xl"
              />
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Note: Avatar URL set below will be displayed here and throughout the app
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={session.user.name}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Name is managed by your authentication provider
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session.user.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email is managed by your authentication provider
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    {...register("timezone")}
                    placeholder="e.g., America/New_York"
                  />
                  {errors.timezone && (
                    <p className="text-xs text-destructive">
                      {errors.timezone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive">{errors.bio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  {...register("avatar")}
                  placeholder="https://example.com/your-profile-image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a direct URL to an image. This will be your profile picture displayed throughout the app.
                </p>
                {errors.avatar && (
                  <p className="text-xs text-destructive">
                    {errors.avatar.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={!isDirty || updateProfile.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={!isDirty || updateProfile.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Account Created</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(session.user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Updated</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(session.user.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">User ID</Label>
              <p className="text-sm text-muted-foreground font-mono">
                {session.user.id}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email Verified</Label>
              <p className="text-sm text-muted-foreground">
                {session.user.emailVerified ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
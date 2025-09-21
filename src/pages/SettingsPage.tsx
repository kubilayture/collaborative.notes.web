import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import { useSession } from "../lib/auth-client";
import { useUserSettings, useUpdateSettings } from "../hooks/settings.hook";
import { Settings, Save, Monitor, Bell, Edit, Globe } from "lucide-react";
import Loading from "../components/common/Loading";

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  desktopNotifications: z.boolean().optional(),
  soundNotifications: z.boolean().optional(),
  autoSaveInterval: z.number().min(5).max(300).optional(),
  defaultEditorMode: z.enum(["rich", "markdown", "plain"]).optional(),
  showLineNumbers: z.boolean().optional(),
  wordWrap: z.boolean().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { data: session } = useSession();
  const { data: userSettings, isLoading: settingsLoading } = useUserSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      theme: "system",
      language: "en",
      emailNotifications: true,
      pushNotifications: true,
      desktopNotifications: true,
      soundNotifications: true,
      autoSaveInterval: 30,
      defaultEditorMode: "rich",
      showLineNumbers: false,
      wordWrap: true,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (userSettings) {
      reset({
        theme: userSettings.theme as "light" | "dark" | "system" | undefined,
        language: userSettings.language || undefined,
        emailNotifications: userSettings.emailNotifications,
        pushNotifications: userSettings.pushNotifications,
        desktopNotifications: userSettings.desktopNotifications,
        soundNotifications: userSettings.soundNotifications,
        autoSaveInterval: userSettings.autoSaveInterval,
        defaultEditorMode: userSettings.defaultEditorMode as "rich" | "markdown" | "plain" | undefined,
        showLineNumbers: userSettings.showLineNumbers,
        wordWrap: userSettings.wordWrap,
      });
    }
  }, [userSettings, reset]);

  const onSubmit = async (data: SettingsForm) => {
    try {
      await updateSettings.mutateAsync(data);
      reset(data);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please sign in to view settings.</p>
      </div>
    );
  }

  if (settingsLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={watchedValues.theme}
                  onValueChange={(value) => setValue("theme", value as any, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={watchedValues.language}
                  onValueChange={(value) => setValue("language", value, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="tr">Türkçe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={watchedValues.emailNotifications}
                  onCheckedChange={(checked) => setValue("emailNotifications", checked, { shouldDirty: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={watchedValues.pushNotifications}
                  onCheckedChange={(checked) => setValue("pushNotifications", checked, { shouldDirty: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="desktopNotifications">Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show desktop notifications
                  </p>
                </div>
                <Switch
                  id="desktopNotifications"
                  checked={watchedValues.desktopNotifications}
                  onCheckedChange={(checked) => setValue("desktopNotifications", checked, { shouldDirty: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="soundNotifications">Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications
                  </p>
                </div>
                <Switch
                  id="soundNotifications"
                  checked={watchedValues.soundNotifications}
                  onCheckedChange={(checked) => setValue("soundNotifications", checked, { shouldDirty: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultEditorMode">Default Editor Mode</Label>
                <Select
                  value={watchedValues.defaultEditorMode}
                  onValueChange={(value) => setValue("defaultEditorMode", value as any, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select editor mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rich">Rich Text</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="plain">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoSaveInterval">Auto-save Interval (seconds)</Label>
                <Input
                  id="autoSaveInterval"
                  type="number"
                  min="5"
                  max="300"
                  {...register("autoSaveInterval", { valueAsNumber: true })}
                />
                {errors.autoSaveInterval && (
                  <p className="text-xs text-destructive">
                    {errors.autoSaveInterval.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showLineNumbers">Show Line Numbers</Label>
                  <p className="text-sm text-muted-foreground">
                    Display line numbers in the editor
                  </p>
                </div>
                <Switch
                  id="showLineNumbers"
                  checked={watchedValues.showLineNumbers}
                  onCheckedChange={(checked) => setValue("showLineNumbers", checked, { shouldDirty: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="wordWrap">Word Wrap</Label>
                  <p className="text-sm text-muted-foreground">
                    Wrap long lines in the editor
                  </p>
                </div>
                <Switch
                  id="wordWrap"
                  checked={watchedValues.wordWrap}
                  onCheckedChange={(checked) => setValue("wordWrap", checked, { shouldDirty: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={!isDirty || updateSettings.isPending}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={!isDirty || updateSettings.isPending}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
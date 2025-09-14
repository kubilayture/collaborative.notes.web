import { useState } from "react";
import { useCreateNote } from "../../hooks/notes.hook";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FolderSelect } from "../../components/folders/FolderSelect";
import { useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";

export function NewNotePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const createNote = useCreateNote();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createNote.mutate({
      title: title.trim(),
      content: content.trim(),
      folderId: folderId || undefined,
    });
  };

  const handleCancel = () => {
    const hasChanges = title.trim() || content.trim();
    if (hasChanges && !window.confirm("Are you sure you want to cancel? Your changes will be lost.")) {
      return;
    }
    navigate("/notes");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </div>
        
        <h1 className="text-lg sm:text-3xl font-bold">Create New Note</h1>
        <p className="hidden sm:block text-muted-foreground">
          Create a new collaborative note that you can share with others
        </p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Note Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <FolderSelect
                value={folderId}
                onValueChange={setFolderId}
                placeholder="Select a folder (optional)"
                allowRoot={true}
              />
              <p className="text-xs text-muted-foreground">
                Choose a folder to organize your note, or leave empty for the root level.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                placeholder="Start writing your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This will be a basic text editor for now. Rich text editing will be available after creation.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                * Required fields
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={createNote.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!title.trim() || createNote.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createNote.isPending ? "Creating..." : "Create Note"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
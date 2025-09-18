import { useState, useEffect } from "react";
import { useCreateNote } from "../../hooks/notes.hook";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FolderSelect } from "../../components/folders/FolderSelect";
import { SimpleEditor } from "../../components/editor/SimpleEditor";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save } from "lucide-react";

export function NewNotePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { folderId: folderIdParam } = useParams<{ folderId: string }>();
  const [folderId, setFolderId] = useState<string | null>(folderIdParam || null);

  // Update folderId when URL params change
  useEffect(() => {
    setFolderId(folderIdParam || null);
  }, [folderIdParam]);
  const createNote = useCreateNote();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createNote.mutate({
      title: title.trim(),
      content: content.trim(),
      folderId: folderId || undefined,
    }, {
      onSuccess: () => {
        // Navigate back to the correct folder context
        navigate(folderIdParam ? `/notes/folder/${folderIdParam}` : "/notes");
      }
    });
  };

  const handleCancel = () => {
    const hasChanges = title.trim() || content.trim();
    if (hasChanges && !window.confirm("Are you sure you want to cancel? Your changes will be lost.")) {
      return;
    }
    navigate(folderIdParam ? `/notes/folder/${folderIdParam}` : "/notes");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first responsive container */}
      <div className="container mx-auto p-3 sm:p-6">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back to Notes</span>
              <span className="xs:hidden">Back</span>
            </Button>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Create New Note</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Create a new collaborative note with rich text editing
          </p>
        </div>

        {/* Form Card */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Note Details</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base sm:text-lg font-medium"
                  required
                />
              </div>

              {/* Folder Field */}
              <div className="space-y-2">
                <Label htmlFor="folder" className="text-sm sm:text-base">Folder</Label>
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

              {/* Content Field with Rich Text Editor */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm sm:text-base">Content</Label>
                <SimpleEditor
                  content={content}
                  onUpdate={setContent}
                  placeholder="Start writing your note..."
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Rich text editor with formatting options including headings, lists, and more.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 border-t">
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  * Required fields
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={createNote.isPending}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!title.trim() || createNote.isPending}
                    className="w-full sm:w-auto order-1 sm:order-2"
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
    </div>
  );
}
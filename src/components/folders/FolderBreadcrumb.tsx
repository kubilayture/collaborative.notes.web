import { useNavigate } from "react-router";
import { useFolderPath } from "../../hooks/folders.hook";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Home, Folder } from "lucide-react";
import Loading from "../common/Loading";

interface FolderBreadcrumbProps {
  currentFolderId?: string;
}

export function FolderBreadcrumb({ currentFolderId }: FolderBreadcrumbProps) {
  const navigate = useNavigate();
  const { data: folderPath, isLoading } = useFolderPath(currentFolderId);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbItem>
        <BreadcrumbLink onClick={() => navigate("/notes")} className="flex items-center">
          <Home className="h-4 w-4 mr-1" />
          Notes
        </BreadcrumbLink>
      </BreadcrumbItem>

      {folderPath && folderPath.length > 0 && (
        <>
          <BreadcrumbSeparator />
          {folderPath.map((folder, index) => {
            const isLast = index === folderPath.length - 1;

            return (
              <BreadcrumbItem key={folder.id}>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center">
                    <Folder className="h-4 w-4 mr-1" />
                    {folder.name}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink
                      onClick={() => navigate(`/notes/folder/${folder.id}`)}
                      className="flex items-center"
                    >
                      <Folder className="h-4 w-4 mr-1" />
                      {folder.name}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </>
      )}
    </Breadcrumb>
  );
}
import { Route, Routes } from "react-router";
import Layout from "./components/layout/Layout";
import AuthPage from "./pages/auth/AuthPage";
import { NotesListPage } from "./pages/notes/NotesListPage";
import { NoteEditorPage } from "./pages/notes/NoteEditorPage";
import { NewNotePage } from "./pages/notes/NewNotePage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { AuthenticatedRoute } from "./components/auth/AuthenticatedRoute";
import AuthLayout from "./components/layout/AuthLayout";

export const RoutesContainer = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <AuthenticatedRoute>
              <AuthPage />
            </AuthenticatedRoute>
          }
        />
        <Route
          path="sign-up"
          element={
            <AuthenticatedRoute>
              <AuthPage />
            </AuthenticatedRoute>
          }
        />
      </Route>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route
          path="notes"
          element={
            <ProtectedRoute>
              <NotesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notes/new"
          element={
            <ProtectedRoute>
              <NewNotePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notes/:noteId"
          element={
            <ProtectedRoute>
              <NoteEditorPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

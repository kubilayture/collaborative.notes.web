import { Route, Routes } from "react-router";
import Layout from "./components/layout/Layout";
import AuthPage from "./pages/auth/AuthPage";
// import { NotesListPage } from "./pages/notes/NotesListPage";
// import { NoteEditorPage } from "./pages/notes/NoteEditorPage";
// import { InvitationsPage } from "./pages/invitations/InvitationsPage";
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
              <div>Protected Notes Page</div>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

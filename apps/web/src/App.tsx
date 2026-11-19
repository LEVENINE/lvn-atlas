import { Route, Routes } from "react-router-dom";

import { RequireAuth } from "./auth/AuthContext";
import { AppShell } from "./components/AppShell";
import { BlueprintDetailPage } from "./pages/BlueprintDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NewBlueprintPage } from "./pages/NewBlueprintPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegisterPage } from "./pages/RegisterPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="blueprints/new" element={<NewBlueprintPage />} />
        <Route path="blueprints/:id" element={<BlueprintDetailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/auth-context";
import { FiltersProvider } from "./components/filters-context";
import { AppLayout } from "./components/layout";
import { LoginPage } from "./pages/login-page";
import { DashboardPage } from "./pages/dashboard-page";
import { RecordsPage } from "./pages/records-page";
import { SaleFormPage } from "./pages/sale-form-page";
import { MapPage } from "./pages/map-page";
import { AiPage } from "./pages/ai-page";
import "./styles/global.css";
import "leaflet/dist/leaflet.css";

const queryClient = new QueryClient();

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-center">Loading dashboard...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <FiltersProvider>
          <AppLayout />
        </FiltersProvider>
      </Protected>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "records", element: <RecordsPage /> },
      { path: "sales/new", element: <SaleFormPage mode="create" /> },
      { path: "sales/:id/edit", element: <SaleFormPage mode="edit" /> },
      { path: "map", element: <MapPage /> },
      { path: "ai", element: <AiPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

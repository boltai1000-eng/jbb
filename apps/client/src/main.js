import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
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
function Protected({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("div", { className: "screen-center", children: "Loading dashboard..." });
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(_Fragment, { children: children });
}
const router = createBrowserRouter([
    {
        path: "/login",
        element: _jsx(LoginPage, {}),
    },
    {
        path: "/",
        element: (_jsx(Protected, { children: _jsx(FiltersProvider, { children: _jsx(AppLayout, {}) }) })),
        children: [
            { index: true, element: _jsx(DashboardPage, {}) },
            { path: "records", element: _jsx(RecordsPage, {}) },
            { path: "sales/new", element: _jsx(SaleFormPage, { mode: "create" }) },
            { path: "sales/:id/edit", element: _jsx(SaleFormPage, { mode: "edit" }) },
            { path: "map", element: _jsx(MapPage, {}) },
            { path: "ai", element: _jsx(AiPage, {}) },
        ],
    },
]);
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(RouterProvider, { router: router }) }) }) }));

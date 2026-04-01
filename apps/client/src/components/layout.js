import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Bot, Database, LogOut, MapPinned, Plus } from "lucide-react";
import { useAuth } from "./auth-context";
import { FilterBar } from "./filter-bar";
import { cx } from "../lib/utils";
const navItems = [
    { to: "/", label: "Dashboard", icon: BarChart3, end: true },
    { to: "/records", label: "Records", icon: Database },
    { to: "/map", label: "Map View", icon: MapPinned },
    { to: "/ai", label: "AI Insights", icon: Bot },
];
export function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { children: [_jsx("div", { className: "brand-mark", children: "JBB" }), _jsxs("div", { className: "brand-copy", children: [_jsx("h1", { children: "Tables Dashboard" }), _jsx("p", { children: "Sales, installs, analytics, and planning" })] })] }), _jsx("nav", { className: "nav-list", children: navItems.map(({ to, label, icon: Icon, end }) => (_jsxs(NavLink, { to: to, end: end, className: ({ isActive }) => cx("nav-item", isActive && "nav-item-active"), children: [_jsx(Icon, { size: 18 }), _jsx("span", { children: label })] }, to))) }), _jsxs("button", { className: "primary-button wide", onClick: () => navigate("/sales/new"), children: [_jsx(Plus, { size: 16 }), "Add Sale"] }), _jsxs("div", { className: "sidebar-footer", children: [_jsxs("div", { children: [_jsx("strong", { children: user?.name }), _jsx("p", { children: user?.email })] }), _jsx("button", { className: "ghost-icon", onClick: logout, "aria-label": "Logout", children: _jsx(LogOut, { size: 18 }) })] })] }), _jsxs("main", { className: "main-area", children: [_jsxs("header", { className: "topbar", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Overview" }), _jsx("h2", { children: "Sales operations" })] }), _jsx(FilterBar, {})] }), _jsx(Outlet, {})] })] }));
}

import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem("jbb_token");
        if (!token) {
            setLoading(false);
            return;
        }
        api
            .me()
            .then((data) => setUser(data.user))
            .catch(() => {
            localStorage.removeItem("jbb_token");
            setUser(null);
        })
            .finally(() => setLoading(false));
    }, []);
    async function login(email, password) {
        const response = await api.login({ email, password });
        localStorage.setItem("jbb_token", response.token);
        setUser(response.user);
    }
    function logout() {
        localStorage.removeItem("jbb_token");
        setUser(null);
    }
    return (_jsx(AuthContext.Provider, { value: { user, loading, login, logout }, children: children }));
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value)
        throw new Error("useAuth must be used inside AuthProvider");
    return value;
}

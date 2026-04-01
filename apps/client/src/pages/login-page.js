import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../components/auth-context";
export function LoginPage() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [email, setEmail] = useState("admin@jbbtables.com");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        if (user)
            navigate("/");
    }, [navigate, user]);
    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await login(email, password);
            navigate("/");
        }
        catch (issue) {
            setError(issue instanceof Error ? issue.message : "Login failed");
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsx("div", { className: "login-shell", children: _jsxs("div", { className: "login-panel", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "JBB Tables" }), _jsx("h1", { children: "Sales dashboard" }), _jsx("p", { className: "muted", children: "Log in to manage sales, track installations across India, and review AI-backed business insights." })] }), _jsxs("form", { className: "form-stack", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "Email" }), _jsxs("div", { className: "input-with-icon", children: [_jsx(Mail, { size: 16 }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), type: "email", required: true })] })] }), _jsxs("label", { children: [_jsx("span", { children: "Password" }), _jsxs("div", { className: "input-with-icon", children: [_jsx(LockKeyhole, { size: 16 }), _jsx("input", { value: password, onChange: (e) => setPassword(e.target.value), type: "password", required: true })] })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { className: "primary-button", disabled: submitting, type: "submit", children: submitting ? "Signing in..." : "Login" })] })] }) }));
}

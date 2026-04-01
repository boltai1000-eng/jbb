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
    if (user) navigate("/");
  }, [navigate, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-panel">
        <div>
          <p className="eyebrow">JBB Tables</p>
          <h1>Sales dashboard</h1>
          <p className="muted">
            Log in to manage sales, track installations across India, and review AI-backed business insights.
          </p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <div className="input-with-icon">
              <Mail size={16} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-with-icon">
              <LockKeyhole size={16} />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </div>
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FileText, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        setError("Invalid email or password");
        return;
      }

      window.location.href = "/admin";
    } catch (err: unknown) {
      const errStr = String(err);
      if (errStr.includes("CredentialsSignin") || errStr.includes("Credentials") || errStr.includes("CallbackRouteError")) {
        setLoading(false);
        setError("Invalid email or password");
      } else {
        window.location.href = "/admin";
      }
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 60%), var(--bg-main)",
      }}
    >
      <div className="human-card animate-fade-in" style={{ width: "100%", maxWidth: 400, padding: 36 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "var(--accent-primary)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              color: "#ffffff",
            }}
          >
            <FileText size={22} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Login</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Sign in to manage your surveys</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@surveyflow.com"
              className="input"
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 12px",
                background: "var(--status-error-bg)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 8,
                color: "var(--status-error)",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button id="login-btn" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6, justifyContent: "center", padding: "11px" }}>
            <LogIn size={16} />
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Registration failed");
    } else {
      router.push("/admin/login");
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
            <UserPlus size={22} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create Account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Register your admin credentials</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "name", label: "Full Name", type: "text", placeholder: "Jane Doe" },
            { key: "email", label: "Email Address", type: "email", placeholder: "admin@surveyflow.com" },
            { key: "password", label: "Password", type: "password", placeholder: "At least 6 characters" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>
                {label}
              </label>
              <input
                id={key}
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="input"
                required
              />
            </div>
          ))}

          {error && (
            <div style={{ padding: "10px 12px", background: "var(--status-error-bg)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, color: "var(--status-error)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button id="register-btn" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6, justifyContent: "center", padding: "11px" }}>
            <UserPlus size={16} />
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-secondary)" }}>
          Already registered?{" "}
          <Link href="/admin/login" style={{ color: "var(--accent-light)", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

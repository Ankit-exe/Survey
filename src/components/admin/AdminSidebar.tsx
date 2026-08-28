"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, PlusCircle, LogOut, FileText } from "lucide-react";

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    href: "/admin/surveys/new",
    label: "New Survey",
    icon: <PlusCircle size={18} />,
  },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 250,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "20px 18px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "var(--accent-primary)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
        >
          <FileText size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-main)" }}>SurveyFlow</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Admin Workspace</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--text-main)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-card)" : "transparent",
                border: isActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ color: isActive ? "var(--accent-light)" : "var(--text-muted)" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 8,
            marginBottom: 8,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--bg-muted)",
              color: "var(--accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 13,
              border: "1px solid var(--border-subtle)",
            }}
          >
            {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name ?? "Admin"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="btn-secondary"
          style={{ width: "100%", justifyContent: "center", fontSize: 13, padding: "8px 12px" }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

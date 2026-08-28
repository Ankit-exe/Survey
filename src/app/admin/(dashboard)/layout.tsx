import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar user={session.user} />
      <main
        style={{
          flex: 1,
          marginLeft: 260,
          padding: "32px 36px",
          overflowY: "auto",
          background: "radial-gradient(ellipse at top right, rgba(139,92,246,0.08) 0%, transparent 50%)",
        }}
      >
        {children}
      </main>
    </div>
  );
}

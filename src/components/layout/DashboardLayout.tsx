import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SystemStatusBar } from "./SystemStatusBar";
import { useAuth } from "@/lib/auth";

const PUBLIC = ["/login", "/recuperar-password"];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = PUBLIC.includes(pathname);
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !isPublic && !user) navigate({ to: "/login" });
  }, [ready, isPublic, user, navigate]);

  if (isPublic) return <>{children}</>;
  if (!ready || !user) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="lg:ml-[232px] flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar />
        <main className="flex-1 px-3 py-3 lg:px-5 lg:py-4">{children}</main>
        <SystemStatusBar />
      </div>
    </div>
  );
}

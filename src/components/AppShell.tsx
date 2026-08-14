import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, FolderKanban, LogOut, Menu, X, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

const NAV = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/projects",
    label: "Proyectos",
    icon: FolderKanban,
  },
  {
    to: "/clients",
    label: "Clientes",
    icon: Building2,
  },
  {
    to: "/tasks",
    label: "Tareas",
    icon: ListTodo,
  },
  {
    to: "/documents",
    label: "Documentos",
    icon: FolderOpen,
  },
  {
    to: "/admin",
    label: "Administración",
    icon: ShieldCheck,
  },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{
            className:
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-sidebar-accent text-sidebar-primary",
          }}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        <Brand />
        {nav}
        <UserBlock user={user?.email ?? null} onSignOut={signOut} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-5">
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            {nav}
            <UserBlock user={user?.email ?? null} onSignOut={signOut} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <span className="bg-gradient-brand flex size-9 items-center justify-center rounded-lg">
        <Zap className="size-5 text-primary-foreground" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">Backdoor</span>
    </Link>
  );
}

function UserBlock({ user, onSignOut }: { user: string | null; onSignOut: () => void }) {
  return (
    <div className="rounded-lg border border-sidebar-border p-3">
      <p className="text-xs text-muted-foreground">Signed in as</p>
      <p className="truncate text-sm font-medium">{user ?? "—"}</p>
      <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={onSignOut}>
        <LogOut className="size-4" /> Sign out
      </Button>
    </div>
  );
}

import {
  Building2,
  FolderOpen,
  ListTodo,
  ShieldCheck,
} from "lucide-react";

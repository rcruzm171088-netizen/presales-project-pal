import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/projects-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Backdoor Presales Platform" },
      {
        name: "description",
        content:
          "Sign in to Backdoor, the presales project management platform for tracking opportunities, engineers and delivery status.",
      },
      { property: "og:title", content: "Backdoor — Presales Project Management" },
      {
        property: "og:description",
        content: "Manage presales projects, opportunities and engineer workload in one workspace.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user, ready } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("ana.villalobos@backdoor.io");
  const [password, setPassword] = useState("presales2026");

  useEffect(() => {
    if (ready && user) router.navigate({ to: "/dashboard" });
  }, [ready, user, router]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        <div className="bg-gradient-brand absolute -top-40 -left-24 size-96 rounded-full opacity-20 blur-3xl" />
        <div className="flex items-center gap-2.5">
          <span className="bg-gradient-brand flex size-9 items-center justify-center rounded-lg">
            <Zap className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Backdoor</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight">
            The <span className="text-gradient-brand">presales</span> command center.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Track every opportunity, engineer assignment and delivery milestone from qualification
            to handover.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4" /> Internal use only · Presales Operations
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="surface-panel w-full max-w-sm rounded-2xl border border-border p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your Backdoor workspace.</p>
          <form
            className="mt-6 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              signIn(email);
              router.navigate({ to: "/dashboard" });
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="mt-2 w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo credentials are pre-filled.
          </p>
        </div>
      </div>
    </div>
  );
}

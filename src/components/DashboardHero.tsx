import { useEffect, useRef, useState } from "react";
import { useSession } from "@/hooks/use-session";

const MESSAGES = [
  "Backdoor centraliza tu operación de preventa.",
  "Convierte requerimientos en proyectos exitosos.",
  "Gestiona oportunidades, cotizaciones y SOWs desde un solo lugar.",
  "La plataforma diseñada para acelerar la preventa.",
  "Transformando requerimientos en soluciones.",
];

function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: Node[] = [];

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.min(56, Math.round((w * h) / 14000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.8,
      }));
    };

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--primary").trim() || "oklch(0.72 0.16 178)";
    const line = styles.getPropertyValue("--chart-2").trim() || "oklch(0.65 0.17 250)";
    const withAlpha = (color: string, a: number) =>
      color.startsWith("oklch(") ? color.replace(/\)$/, ` / ${a})`) : color;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            ctx.strokeStyle = withAlpha(line, 0.18 * (1 - d / 130));
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = withAlpha(accent, 0.7);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    build();
    if (reduced) {
      draw();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />;
}

export function DashboardHero() {
  const { user } = useSession();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    user?.email?.split("@")[0] ||
    "invitado";

  return (
    <section className="surface-panel relative isolate mb-6 overflow-hidden rounded-xl border border-border">
      <NetworkCanvas />
      <div className="from-background/85 via-background/50 absolute inset-0 bg-gradient-to-r to-transparent" />
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase">
          Presales command center
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Bienvenido, <span className="text-gradient-brand">{fullName}</span>
        </h2>
        <p
          key={index}
          className="text-muted-foreground animate-fade-in mt-3 max-w-xl text-sm md:text-base"
        >
          {MESSAGES[index]}
        </p>
      </div>
    </section>
  );
}

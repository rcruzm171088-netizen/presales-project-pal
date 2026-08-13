import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ProjectStatus = "Planning" | "In Progress" | "On Hold" | "Completed" | "Cancelled";

export type Project = {
  id: string;
  customer: string;
  opportunity: string;
  name: string;
  engineer: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  description: string;
  pendingTasks: number;
};

export const STATUSES: ProjectStatus[] = [
  "Planning",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
];

export const ENGINEERS = [
  "Ana Villalobos",
  "Marcus Deane",
  "Priya Raghavan",
  "Tomás Ferreira",
  "Julia Kowalski",
  "Daniel Okafor",
];

const SEED: Project[] = [
  {
    id: "PRJ-1042",
    customer: "Northwind Logistics",
    opportunity: "OPP-88231",
    name: "SD-WAN Refresh — 42 Branch Sites",
    engineer: "Ana Villalobos",
    status: "In Progress",
    startDate: "2026-06-01",
    endDate: "2026-09-15",
    description:
      "Design and bill of materials for a nationwide SD-WAN refresh, including failover LTE and centralized policy management.",
    pendingTasks: 6,
  },
  {
    id: "PRJ-1043",
    customer: "Helvetia Bank",
    opportunity: "OPP-88410",
    name: "Zero Trust Access Pilot",
    engineer: "Marcus Deane",
    status: "Planning",
    startDate: "2026-08-10",
    endDate: "2026-11-30",
    description:
      "Scoping workshop and pilot architecture for identity-aware access covering 1,200 hybrid workers.",
    pendingTasks: 9,
  },
  {
    id: "PRJ-1044",
    customer: "Aurora Health Group",
    opportunity: "OPP-87995",
    name: "Clinical Data Lake Migration",
    engineer: "Priya Raghavan",
    status: "In Progress",
    startDate: "2026-05-18",
    endDate: "2026-10-02",
    description:
      "Technical validation of a HIPAA-compliant data lake migration with anonymization pipeline and BI handover.",
    pendingTasks: 4,
  },
  {
    id: "PRJ-1045",
    customer: "Vertex Manufacturing",
    opportunity: "OPP-88502",
    name: "Smart Factory IoT Rollout",
    engineer: "Tomás Ferreira",
    status: "On Hold",
    startDate: "2026-04-06",
    endDate: "2026-12-18",
    description:
      "Edge gateway design for 3 plants. Currently paused pending customer budget approval for Q4.",
    pendingTasks: 2,
  },
  {
    id: "PRJ-1046",
    customer: "Cascade Retail",
    opportunity: "OPP-88677",
    name: "Unified Commerce POS Assessment",
    engineer: "Julia Kowalski",
    status: "Completed",
    startDate: "2026-02-03",
    endDate: "2026-05-29",
    description:
      "Store-level readiness assessment and vendor comparison delivered ahead of the peak season freeze.",
    pendingTasks: 0,
  },
  {
    id: "PRJ-1047",
    customer: "Orion Energy",
    opportunity: "OPP-88720",
    name: "SCADA Network Segmentation",
    engineer: "Daniel Okafor",
    status: "In Progress",
    startDate: "2026-07-14",
    endDate: "2026-11-07",
    description:
      "OT/IT segmentation design across 6 substations with compliance mapping to IEC 62443.",
    pendingTasks: 7,
  },
  {
    id: "PRJ-1048",
    customer: "Meridian Airlines",
    opportunity: "OPP-88801",
    name: "Crew Mobility Platform RFP",
    engineer: "Ana Villalobos",
    status: "Planning",
    startDate: "2026-08-25",
    endDate: "2027-01-20",
    description:
      "RFP response covering mobile device management, offline sync, and airport Wi-Fi optimization.",
    pendingTasks: 11,
  },
  {
    id: "PRJ-1049",
    customer: "Lumina Media",
    opportunity: "OPP-87740",
    name: "Broadcast Cloud Failover",
    engineer: "Marcus Deane",
    status: "Cancelled",
    startDate: "2026-01-12",
    endDate: "2026-03-30",
    description: "Cancelled after the customer consolidated onto an incumbent provider contract.",
    pendingTasks: 0,
  },
];

const STORAGE_KEY = "backdoor.projects.v1";
const AUTH_KEY = "backdoor.auth.v1";

type Ctx = {
  projects: Project[];
  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (id: string, p: Omit<Project, "id">) => void;
  deleteProject: (id: string) => void;
  user: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
  ready: boolean;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(SEED);
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProjects(JSON.parse(raw));
      setUser(localStorage.getItem(AUTH_KEY));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects, ready]);

  const value = useMemo<Ctx>(
    () => ({
      projects,
      ready,
      user,
      signIn: (email) => {
        localStorage.setItem(AUTH_KEY, email);
        setUser(email);
      },
      signOut: () => {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
      },
      addProject: (p) =>
        setProjects((prev) => {
          const max = prev.reduce((acc, cur) => {
            const n = Number(cur.id.replace(/\D/g, ""));
            return Number.isFinite(n) && n > acc ? n : acc;
          }, 1041);
          return [{ ...p, id: `PRJ-${max + 1}` }, ...prev];
        }),
      updateProject: (id, p) =>
        setProjects((prev) => prev.map((item) => (item.id === id ? { ...p, id } : item))),
      deleteProject: (id) => setProjects((prev) => prev.filter((item) => item.id !== id)),
    }),
    [projects, user, ready],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

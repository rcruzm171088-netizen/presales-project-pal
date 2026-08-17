export const PROJECT_STATUSES = [
  "En Proceso",
  "Ganado",
  "Perdido",
  "Cancelado",
  "Standby",
  "Completo",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PRIORITIES = ["Alta", "Media", "Baja"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_STATUSES = [
  "Pendiente",
  "En Progreso",
  "Bloqueada",
  "Completada",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const BUSINESS_LINES = [
  "Networking",
  "Ciberseguridad",
  "Cloud",
  "Colaboración",
  "Datacenter",
  "Servicios Administrados",
] as const;

export const PRESALES_ENGINEERS = ["Ricardo Cruz", "Diego Herrera", "Preventa 1"] as const;
export const PRESALES_LEADS = ["Jorge Ramirez Benitez"] as const;

export const DOC_TYPES = [
  "Documento",
  "Cotización",
  "Quote",
  "SOW",
  "HLD",
  "LLD",
  "BOM",
  "Otro",
] as const;

export const QUOTE_STATUSES = ["Borrador", "Enviada", "Aprobada", "Rechazada"] as const;

export const APP_ROLES = [
  "usuario_pendiente",
  "preventa",
  "lider_preventa",
  "administrador",
] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  usuario_pendiente: "Usuario Pendiente",
  preventa: "Preventa",
  lider_preventa: "Líder Preventa",
  administrador: "Administrador",
};

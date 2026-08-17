import {
  ArrowLeft,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProjectDetail() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            className="mb-3 text-slate-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <h1 className="text-3xl font-bold">
            PR-0025 | Migración Data Center Cliente X
          </h1>

          <div className="mt-2 flex gap-4 text-sm text-slate-400">
            <span>Cliente: Grupo ABC</span>
            <span>Vendedor: Juan Pérez</span>
            <span>Preventa: Ricardo Cruz</span>
            <span>Líder: Jorge Ramírez</span>
          </div>
        </div>

        <Badge className="bg-blue-600 hover:bg-blue-600">
          EN PROCESO
        </Badge>
      </div>

      {/* KPIS */}

      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <KPICard
          icon={<CheckCircle2 />}
          value="18"
          label="Tareas Totales"
        />

        <KPICard
          icon={<Clock />}
          value="5"
          label="Pendientes"
        />

        <KPICard
          icon={<AlertTriangle />}
          value="2"
          label="Vencidas"
        />

        <KPICard
          icon={<FolderOpen />}
          value="12"
          label="Documentos"
        />

        <KPICard
          icon={<FileText />}
          value="34"
          label="Días Abierto"
        />
      </div>

      {/* GRID */}

      <div className="grid grid-cols-12 gap-6">

        {/* MAIN */}

        <div className="col-span-12 lg:col-span-9">

          <Tabs defaultValue="summary">

            <TabsList className="w-full mb-6 bg-slate-900">

              <TabsTrigger value="summary">
                Resumen
              </TabsTrigger>

              <TabsTrigger value="tasks">
                Tareas
              </TabsTrigger>

              <TabsTrigger value="notes">
                Notas
              </TabsTrigger>

              <TabsTrigger value="documents">
                Documentos
              </TabsTrigger>

              <TabsTrigger value="quotes">
                Cotizaciones
              </TabsTrigger>

              <TabsTrigger value="sow">
                SOW
              </TabsTrigger>

              <TabsTrigger value="history">
                Historial
              </TabsTrigger>

            </TabsList>

            {/* RESUMEN */}

            <TabsContent value="summary">

              <div className="grid md:grid-cols-2 gap-6">

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle>
                      Información Comercial
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">

                    <Field
                      label="Cliente"
                      value="Grupo ABC"
                    />

                    <Field
                      label="Razón Social"
                      value="Grupo ABC SA de CV"
                    />

                    <Field
                      label="Contacto"
                      value="Carlos Pérez"
                    />

                    <Field
                      label="Correo"
                      value="carlos@grupoabc.com"
                    />

                    <Field
                      label="Teléfono"
                      value="+52 55 5555 5555"
                    />

                    <Field
                      label="Vendedor"
                      value="Juan Pérez"
                    />

                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">

                  <CardHeader>
                    <CardTitle>
                      Información Técnica
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">

                    <Field
                      label="Línea de Negocio"
                      value="Infraestructura"
                    />

                    <Field
                      label="Presales Engineer"
                      value="Ricardo Cruz"
                    />

                    <Field
                      label="Requerimiento"
                      value="Migración completa de Data Center."
                    />

                  </CardContent>

                </Card>

              </div>

            </TabsContent>

            {/* TAREAS */}

            <TabsContent value="tasks">

              <div className="grid md:grid-cols-4 gap-4">

                <KanbanColumn
                  title="Pendiente"
                  color="border-yellow-500"
                />

                <KanbanColumn
                  title="En Progreso"
                  color="border-blue-500"
                />

                <KanbanColumn
                  title="Bloqueada"
                  color="border-red-500"
                />

                <KanbanColumn
                  title="Completada"
                  color="border-green-500"
                />

              </div>

            </TabsContent>

            {/* NOTAS */}

            <TabsContent value="notes">

              <Card className="bg-slate-900 border-slate-800">

                <CardContent className="p-6 space-y-6">

                  <TimelineItem
                    user="Ricardo Cruz"
                    date="17 Ago 2026"
                    note="Cliente solicita agregar HA."
                  />

                  <TimelineItem
                    user="Jorge Ramirez"
                    date="17 Ago 2026"
                    note="Aprobado para cotización."
                  />

                </CardContent>

              </Card>

            </TabsContent>

            {/* DOCUMENTOS */}

            <TabsContent value="documents">

              <Card className="bg-slate-900 border-slate-800">

                <CardContent className="p-4">

                  <table className="w-full text-sm">

                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3">
                          Documento
                        </th>

                        <th>Tipo</th>

                        <th>Versión</th>

                        <th>Autor</th>

                        <th>Fecha</th>
                      </tr>
                    </thead>

                    <tbody>

                      <tr>
                        <td className="py-3">
                          SOW_v3.pdf
                        </td>

                        <td>SOW</td>

                        <td>v3</td>

                        <td>Ricardo</td>

                        <td>17/08/2026</td>
                      </tr>

                    </tbody>

                  </table>

                </CardContent>

              </Card>

            </TabsContent>

            <TabsContent value="quotes">
              <div className="text-slate-400">
                Módulo de Cotizaciones
              </div>
            </TabsContent>

            <TabsContent value="sow">
              <div className="text-slate-400">
                Módulo SOW
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="text-slate-400">
                Bitácora automática del proyecto
              </div>
            </TabsContent>

          </Tabs>

        </div>

        {/* SIDEBAR */}

        <div className="col-span-12 lg:col-span-3">

          <Card className="bg-slate-900 border-slate-800 mb-4">

            <CardHeader>
              <CardTitle>
                Participantes
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">

              <UserRow
                name="Jorge Ramírez"
                role="Líder Preventa"
              />

              <UserRow
                name="Ricardo Cruz"
                role="Preventa"
              />

              <UserRow
                name="Juan Pérez"
                role="Vendedor"
              />

            </CardContent>

          </Card>

          <Card className="bg-slate-900 border-slate-800">

            <CardHeader>
              <CardTitle>
                Próximos Vencimientos
              </CardTitle>
            </CardHeader>

            <CardContent>

              <ul className="space-y-3 text-sm">

                <li>HLD - 18 Ago</li>

                <li>BoM - 20 Ago</li>

                <li>Cotización - 22 Ago</li>

              </ul>

            </CardContent>

          </Card>

        </div>

      </div>

    </div>
  );
}

function KPICard({
  icon,
  value,
  label,
}: any) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-5">
        <div className="text-cyan-400 mb-2">
          {icon}
        </div>

        <div className="text-3xl font-bold">
          {value}
        </div>

        <div className="text-slate-400 text-sm">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
}: any) {
  return (
    <div>
      <div className="text-xs text-slate-500">
        {label}
      </div>

      <div>{value}</div>
    </div>
  );
}

function KanbanColumn({
  title,
  color,
}: any) {
  return (
    <Card className={`bg-slate-900 border ${color}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>

        <div className="bg-slate-800 rounded-lg p-3">

          <div className="font-medium">
            Diseño HLD
          </div>

          <div className="text-xs text-slate-400 mt-2">
            Ricardo • Diego
          </div>

        </div>

      </CardContent>
    </Card>
  );
}

function TimelineItem({
  user,
  date,
  note,
}: any) {
  return (
    <div className="flex gap-3">

      <div className="w-3 h-3 rounded-full bg-cyan-400 mt-2" />

      <div>
        <div className="font-medium">
          {user}
        </div>

        <div className="text-xs text-slate-500">
          {date}
        </div>

        <div className="mt-1">
          {note}
        </div>
      </div>

    </div>
  );
}

function UserRow({
  name,
  role,
}: any) {
  return (
    <div className="flex items-center gap-3">
      <Users size={18} />

      <div>
        <div>{name}</div>

        <div className="text-xs text-slate-500">
          {role}
        </div>
      </div>
    </div>
  );
}

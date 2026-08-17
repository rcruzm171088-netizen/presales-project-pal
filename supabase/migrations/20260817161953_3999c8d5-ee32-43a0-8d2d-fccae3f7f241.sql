-- CLIENTS: código automático
CREATE SEQUENCE IF NOT EXISTS public.client_number_seq;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_code text NOT NULL DEFAULT ('CL-' || lpad(nextval('public.client_number_seq')::text, 4, '0'));

-- PROJECTS: prioridad
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'Media';

-- DOCUMENTS: tipo, versión, url
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS doc_type text NOT NULL DEFAULT 'Documento';
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS version text NOT NULL DEFAULT 'v1';
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS url text NOT NULL DEFAULT '';
ALTER TABLE public.project_documents ALTER COLUMN storage_path SET DEFAULT '';

-- QUOTES
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'Cotizacion',
  folio text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT 'v1',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'MXN',
  issue_date date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'Borrador',
  author_id uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operators read quotes" ON public.quotes FOR SELECT TO authenticated USING (public.can_operate(auth.uid()));
CREATE POLICY "operators insert quotes" ON public.quotes FOR INSERT TO authenticated WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "operators update quotes" ON public.quotes FOR UPDATE TO authenticated USING (public.can_operate(auth.uid())) WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "leads delete quotes" ON public.quotes FOR DELETE TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'lider_preventa'));
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SOWS
CREATE TABLE IF NOT EXISTS public.sows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT 'v1',
  status text NOT NULL DEFAULT 'Borrador',
  issue_date date NOT NULL DEFAULT current_date,
  url text NOT NULL DEFAULT '',
  author_id uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sows TO authenticated;
GRANT ALL ON public.sows TO service_role;
ALTER TABLE public.sows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operators read sows" ON public.sows FOR SELECT TO authenticated USING (public.can_operate(auth.uid()));
CREATE POLICY "operators insert sows" ON public.sows FOR INSERT TO authenticated WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "operators update sows" ON public.sows FOR UPDATE TO authenticated USING (public.can_operate(auth.uid())) WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "leads delete sows" ON public.sows FOR DELETE TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'lider_preventa'));
CREATE TRIGGER update_sows_updated_at BEFORE UPDATE ON public.sows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DEMO DATA
INSERT INTO public.clients (id, name, legal_name, contact_name, contact_email, contact_phone, sector, status, created_by) VALUES
 ('11111111-1111-4111-8111-000000000001','Northwind Logistics','Northwind Logistics S.A. de C.V.','Laura Méndez','laura.mendez@northwind.mx','+52 55 1234 5678','Logística','Activo','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('11111111-1111-4111-8111-000000000002','Banco Aurora','Grupo Financiero Aurora S.A.','Carlos Peña','carlos.pena@aurora.mx','+52 55 8765 4321','Financiero','Activo','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('11111111-1111-4111-8111-000000000003','RetailMax','RetailMax Comercializadora S.A.','Ana Torres','ana.torres@retailmax.mx','+52 81 5544 3322','Retail','Activo','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('11111111-1111-4111-8111-000000000004','HealthCore','HealthCore Servicios Médicos S.C.','Luis Ramírez','luis.ramirez@healthcore.mx','+52 33 2211 9988','Salud','Activo','293fd83c-ce65-42a8-9f14-e870fa85f574')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (id, user_id, client_id, customer, legal_name, client_contact, client_email, client_phone, sales_rep, business_line, project_name, opportunity, presales_engineer, presales_engineer_id, status, priority, start_date, end_date, description) VALUES
 ('22222222-2222-4222-8222-000000000001','293fd83c-ce65-42a8-9f14-e870fa85f574','11111111-1111-4111-8111-000000000001','Northwind Logistics','Northwind Logistics S.A. de C.V.','Laura Méndez','laura.mendez@northwind.mx','+52 55 1234 5678','Mónica Salas','Networking','SD-WAN Refresh 42 sitios','OPP-88231','Ricardo Cruz','293fd83c-ce65-42a8-9f14-e870fa85f574','En Proceso','Alta',current_date - 20, current_date + 10,'Renovación de MPLS a SD-WAN en 42 sucursales con salida a internet local.'),
 ('22222222-2222-4222-8222-000000000002','293fd83c-ce65-42a8-9f14-e870fa85f574','11111111-1111-4111-8111-000000000002','Banco Aurora','Grupo Financiero Aurora S.A.','Carlos Peña','carlos.pena@aurora.mx','+52 55 8765 4321','Jorge Luna','Ciberseguridad','Zero Trust y microsegmentación','OPP-88240','Diego Herrera',NULL,'Ganado','Alta',current_date - 60, current_date - 5,'Implementación de arquitectura Zero Trust para banca digital.'),
 ('22222222-2222-4222-8222-000000000003','293fd83c-ce65-42a8-9f14-e870fa85f574','11111111-1111-4111-8111-000000000003','RetailMax','RetailMax Comercializadora S.A.','Ana Torres','ana.torres@retailmax.mx','+52 81 5544 3322','Mónica Salas','Cloud','Migración a Azure Landing Zone','OPP-88255','Preventa 1',NULL,'Standby','Media',current_date - 35, current_date + 25,'Diseño de landing zone y migración de 30 cargas de trabajo.'),
 ('22222222-2222-4222-8222-000000000004','293fd83c-ce65-42a8-9f14-e870fa85f574','11111111-1111-4111-8111-000000000004','HealthCore','HealthCore Servicios Médicos S.C.','Luis Ramírez','luis.ramirez@healthcore.mx','+52 33 2211 9988','Pablo Ortiz','Colaboración','Teams Voice para 800 usuarios','OPP-88261','Ricardo Cruz','293fd83c-ce65-42a8-9f14-e870fa85f574','Perdido','Baja',current_date - 80, current_date - 30,'Telefonía en la nube con Direct Routing.'),
 ('22222222-2222-4222-8222-000000000005','293fd83c-ce65-42a8-9f14-e870fa85f574','11111111-1111-4111-8111-000000000001','Northwind Logistics','Northwind Logistics S.A. de C.V.','Laura Méndez','laura.mendez@northwind.mx','+52 55 1234 5678','Jorge Luna','Ciberseguridad','NGFW en datacenter principal','OPP-88270','Diego Herrera',NULL,'Completo','Media',current_date - 15, current_date + 3,'Sustitución de firewalls perimetrales en HA.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tasks (id, project_id, title, description, priority, due_date, status, created_by) VALUES
 ('33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000001','Levantamiento de sitios','Recopilar inventario de enlaces y equipos por sucursal.','Alta',current_date + 3,'En Progreso','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('33333333-3333-4333-8333-000000000002','22222222-2222-4222-8222-000000000001','Diseño HLD','Documento de arquitectura SD-WAN.','Alta',current_date - 2,'Pendiente','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('33333333-3333-4333-8333-000000000003','22222222-2222-4222-8222-000000000002','Taller Zero Trust','Sesión de descubrimiento con el cliente.','Media',current_date - 20,'Completada','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('33333333-3333-4333-8333-000000000004','22222222-2222-4222-8222-000000000003','Assessment de cargas','Inventario de VMs y dependencias.','Media',current_date + 8,'Bloqueada','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('33333333-3333-4333-8333-000000000005','22222222-2222-4222-8222-000000000005','BOM y cotización','Armar lista de materiales y precios.','Alta',current_date + 1,'Pendiente','293fd83c-ce65-42a8-9f14-e870fa85f574')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.task_assignees (task_id, user_id) VALUES
 ('33333333-3333-4333-8333-000000000001','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('33333333-3333-4333-8333-000000000005','293fd83c-ce65-42a8-9f14-e870fa85f574')
ON CONFLICT DO NOTHING;

INSERT INTO public.project_notes (project_id, content, author_id) VALUES
 ('22222222-2222-4222-8222-000000000001','Cliente solicita incluir SLA de 99.9% en la propuesta.','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('22222222-2222-4222-8222-000000000001','Se agendó visita técnica a 3 sucursales piloto.','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('22222222-2222-4222-8222-000000000002','Propuesta aprobada por el comité de seguridad.','293fd83c-ce65-42a8-9f14-e870fa85f574');

INSERT INTO public.project_documents (project_id, file_name, file_type, doc_type, version, url, storage_path, uploaded_by) VALUES
 ('22222222-2222-4222-8222-000000000001','HLD_SDWAN_Northwind.pdf','pdf','HLD','v2','','','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('22222222-2222-4222-8222-000000000001','BOM_SDWAN.xlsx','xlsx','BOM','v1','','','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('22222222-2222-4222-8222-000000000002','SOW_ZeroTrust.docx','docx','SOW','v3','','','293fd83c-ce65-42a8-9f14-e870fa85f574');

INSERT INTO public.quotes (project_id, kind, folio, version, amount, issue_date, status, author_id) VALUES
 ('22222222-2222-4222-8222-000000000001','Cotizacion','COT-2026-0142','v1',1850000, current_date - 10,'Enviada','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('22222222-2222-4222-8222-000000000001','Quote','QTE-CISCO-9981','v2',1720000, current_date - 4,'Borrador','293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('22222222-2222-4222-8222-000000000002','Cotizacion','COT-2026-0120','v3',4300000, current_date - 40,'Aprobada','293fd83c-ce65-42a8-9f14-e870fa85f574');

INSERT INTO public.sows (project_id, title, version, status, issue_date, author_id) VALUES
 ('22222222-2222-4222-8222-000000000001','SOW Implementación SD-WAN','v1','Borrador', current_date - 3,'293fd83c-ce65-42a8-9f14-e870fa85f574'),
 ('22222222-2222-4222-8222-000000000002','SOW Zero Trust Fase 1','v2','Aprobada', current_date - 35,'293fd83c-ce65-42a8-9f14-e870fa85f574');
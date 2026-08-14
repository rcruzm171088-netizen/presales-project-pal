-- ============ ROLES & PROFILES ============
CREATE TYPE public.app_role AS ENUM ('usuario_pendiente','preventa','lider_preventa','administrador');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_active_user(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND is_active);
$$;

CREATE OR REPLACE FUNCTION public.can_operate(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_active_user(_user_id) AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('preventa','lider_preventa','administrador')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'administrador');
$$;

CREATE POLICY "profiles readable by operators" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.can_operate(auth.uid()));
CREATE POLICY "admins manage profiles" ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "roles readable by operators" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_operate(auth.uid()));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), COALESCE(NEW.email,''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario_pendiente')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.profiles (id, full_name, email, is_active)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1)), COALESCE(u.email,''), true
FROM auth.users u ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'administrador'::public.app_role FROM auth.users u
ON CONFLICT (user_id, role) DO NOTHING;

-- ============ CLIENTS ============
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  legal_name text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Activo',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operators read clients" ON public.clients FOR SELECT TO authenticated USING (public.can_operate(auth.uid()));
CREATE POLICY "operators insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "operators update clients" ON public.clients FOR UPDATE TO authenticated USING (public.can_operate(auth.uid())) WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "admins delete clients" ON public.clients FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROJECTS ============
CREATE SEQUENCE IF NOT EXISTS public.project_number_seq START 1;
ALTER TABLE public.projects
  ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN legal_name text NOT NULL DEFAULT '',
  ADD COLUMN client_contact text NOT NULL DEFAULT '',
  ADD COLUMN client_email text NOT NULL DEFAULT '',
  ADD COLUMN client_phone text NOT NULL DEFAULT '',
  ADD COLUMN sales_rep text NOT NULL DEFAULT '',
  ADD COLUMN business_line text NOT NULL DEFAULT '',
  ADD COLUMN presales_engineer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN presales_lead_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.projects ALTER COLUMN project_id SET DEFAULT ('PR-' || lpad(nextval('public.project_number_seq')::text, 4, '0'));
UPDATE public.projects SET status = 'En Proceso' WHERE status NOT IN ('En Proceso','Ganado','Perdido','Cancelado','Standby');
ALTER TABLE public.projects ALTER COLUMN status SET DEFAULT 'En Proceso';

DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "operators read projects" ON public.projects FOR SELECT TO authenticated USING (public.can_operate(auth.uid()));
CREATE POLICY "operators insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.can_operate(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "operators update projects" ON public.projects FOR UPDATE TO authenticated USING (public.can_operate(auth.uid())) WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "leads delete projects" ON public.projects FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'lider_preventa'));

-- ============ TASKS ============
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'Media',
  due_date date,
  status text NOT NULL DEFAULT 'Pendiente',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operators read tasks" ON public.tasks FOR SELECT TO authenticated USING (public.can_operate(auth.uid()));
CREATE POLICY "operators insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "operators update tasks" ON public.tasks FOR UPDATE TO authenticated USING (public.can_operate(auth.uid())) WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "leads delete tasks" ON public.tasks FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'lider_preventa') OR created_by = auth.uid());
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.task_assignees (
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_assignees TO authenticated;
GRANT ALL ON public.task_assignees TO service_role;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operators read assignees" ON public.task_assignees FOR SELECT TO authenticated USING (public.can_operate(auth.uid()));
CREATE POLICY "operators write assignees" ON public.task_assignees FOR INSERT TO authenticated WITH CHECK (public.can_operate(auth.uid()));
CREATE POLICY "operators delete assignees" ON public.task_assignees FOR DELETE TO authenticated USING (public.can_operate(auth.uid()));

-- ============ NOTES (append only) ============
CREATE TABLE public.project_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.project_notes TO authenticated;
GRANT ALL ON public.project_notes TO service_role;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operators read notes" ON public.project_notes FOR SELECT TO authenticated USING (public.can_operate(auth.uid()));
CREATE POLICY "operators insert notes" ON public.project_notes FOR INSERT TO authenticated WITH CHECK (public.can_operate(auth.uid()) AND author_id = auth.uid());

-- ============ DOCUMENTS ============
CREATE TABLE public.project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL DEFAULT '',
  storage_path text NOT NULL,
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.project_documents TO authenticated;
GRANT ALL ON public.project_documents TO service_role;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operators read docs" ON public.project_documents FOR SELECT TO authenticated USING (public.can_operate(auth.uid()));
CREATE POLICY "operators insert docs" ON public.project_documents FOR INSERT TO authenticated WITH CHECK (public.can_operate(auth.uid()) AND uploaded_by = auth.uid());
CREATE POLICY "owners delete docs" ON public.project_documents FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "operators read project files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-documents' AND public.can_operate(auth.uid()));
CREATE POLICY "operators upload project files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-documents' AND public.can_operate(auth.uid()));
CREATE POLICY "operators delete project files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-documents' AND public.can_operate(auth.uid()));

-- ============ HISTORY ============
CREATE TABLE public.project_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text NOT NULL DEFAULT '',
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_events TO authenticated;
GRANT ALL ON public.project_events TO service_role;
ALTER TABLE public.project_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operators read events" ON public.project_events FOR SELECT TO authenticated USING (public.can_operate(auth.uid()));

CREATE OR REPLACE FUNCTION public.log_project_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.project_events (project_id, event_type, description, actor_id)
    VALUES (NEW.id, 'project_created', 'Proyecto creado: ' || NEW.project_name, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.project_events (project_id, event_type, description, actor_id)
    VALUES (NEW.id, 'status_changed', 'Estado: ' || OLD.status || ' -> ' || NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_project_created AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_project_event();
CREATE TRIGGER trg_project_status AFTER UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_project_event();

CREATE OR REPLACE FUNCTION public.log_note_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.project_events (project_id, event_type, description, actor_id)
  VALUES (NEW.project_id, 'note_added', 'Nota agregada', NEW.author_id);
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_note_added AFTER INSERT ON public.project_notes FOR EACH ROW EXECUTE FUNCTION public.log_note_event();

CREATE OR REPLACE FUNCTION public.log_document_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.project_events (project_id, event_type, description, actor_id)
  VALUES (NEW.project_id, 'document_added', 'Documento agregado: ' || NEW.file_name, NEW.uploaded_by);
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_document_added AFTER INSERT ON public.project_documents FOR EACH ROW EXECUTE FUNCTION public.log_document_event();

CREATE OR REPLACE FUNCTION public.log_task_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.project_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.project_events (project_id, event_type, description, actor_id)
    VALUES (NEW.project_id, 'task_created', 'Tarea creada: ' || NEW.title, auth.uid());
  ELSIF NEW.status = 'Completada' AND OLD.status IS DISTINCT FROM 'Completada' THEN
    INSERT INTO public.project_events (project_id, event_type, description, actor_id)
    VALUES (NEW.project_id, 'task_completed', 'Tarea completada: ' || NEW.title, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_task_created AFTER INSERT ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.log_task_event();
CREATE TRIGGER trg_task_updated AFTER UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.log_task_event();
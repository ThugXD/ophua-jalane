-- Audit logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT '',
  entity_id text NOT NULL DEFAULT '',
  group_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_group ON public.audit_logs(group_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert their own log entries
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- Also allow anonymous insert for login attempts (no user yet)
CREATE POLICY "Anyone can insert auth-related logs"
  ON public.audit_logs FOR INSERT
  TO anon
  WITH CHECK (action IN ('login_failed','signup_attempt'));

-- Superadmins see everything
CREATE POLICY "Superadmins view all logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'::app_role));

-- Group admins see logs for their group members
CREATE POLICY "Group admins view their group logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = audit_logs.group_id AND g.admin_id = auth.uid()
    )
  );

-- Superadmins can delete logs (cleanup)
CREATE POLICY "Superadmins delete logs"
  ON public.audit_logs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'::app_role));
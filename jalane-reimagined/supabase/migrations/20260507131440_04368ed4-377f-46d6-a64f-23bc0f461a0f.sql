
-- Enum dos planos
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'business');

-- Tabela de definições globais (trial dias, etc.)
CREATE TABLE public.app_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  free_trial_days integer NOT NULL DEFAULT 14,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

INSERT INTO public.app_settings (id, free_trial_days) VALUES (true, 14);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view settings"
  ON public.app_settings FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Superadmins update settings"
  ON public.app_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'))
  WITH CHECK (has_role(auth.uid(), 'superadmin'));

-- Subscrições
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan public.subscription_plan NOT NULL DEFAULT 'free',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  group_id uuid,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_group ON public.user_subscriptions(group_id);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription"
  ON public.user_subscriptions FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Superadmins view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmins manage subscriptions"
  ON public.user_subscriptions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'))
  WITH CHECK (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Group admins view member subscriptions"
  ON public.user_subscriptions FOR SELECT
  TO authenticated USING (
    group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = user_subscriptions.group_id AND g.admin_id = auth.uid()
    )
  );

CREATE TRIGGER set_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Função: devolve plano efetivo do utilizador
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS TABLE(plan public.subscription_plan, expires_at timestamptz, is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    s.plan,
    s.expires_at,
    CASE
      WHEN s.plan IN ('pro','business') AND (s.expires_at IS NULL OR s.expires_at > now()) THEN true
      WHEN s.plan = 'free' AND (s.expires_at IS NULL OR s.expires_at > now()) THEN true
      ELSE false
    END AS is_active
  FROM public.user_subscriptions s
  WHERE s.user_id = _user_id
  LIMIT 1;
$$;

-- Trigger: ao criar perfil, criar subscrição Free com trial
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_days integer;
BEGIN
  SELECT free_trial_days INTO v_days FROM public.app_settings WHERE id = true;
  IF v_days IS NULL THEN v_days := 14; END IF;
  INSERT INTO public.user_subscriptions (user_id, plan, expires_at)
  VALUES (NEW.id, 'free', now() + (v_days || ' days')::interval)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_subscription();

-- Backfill para perfis existentes
INSERT INTO public.user_subscriptions (user_id, plan, expires_at)
SELECT p.id, 'free', now() + interval '14 days'
FROM public.profiles p
LEFT JOIN public.user_subscriptions s ON s.user_id = p.id
WHERE s.id IS NULL;

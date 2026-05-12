CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  viewer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profile_views_profile ON public.profile_views(profile_id);
CREATE INDEX idx_profile_views_created ON public.profile_views(created_at);

CREATE TABLE public.profile_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  click_type text NOT NULL,
  viewer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profile_clicks_profile ON public.profile_clicks(profile_id);
CREATE INDEX idx_profile_clicks_type ON public.profile_clicks(click_type);
CREATE INDEX idx_profile_clicks_created ON public.profile_clicks(created_at);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a view on existing profile"
ON public.profile_views FOR INSERT TO anon, authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id));

CREATE POLICY "Owners view their views"
ON public.profile_views FOR SELECT TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Superadmins view all views"
ON public.profile_views FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Anyone can log a click on existing profile"
ON public.profile_clicks FOR INSERT TO anon, authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id));

CREATE POLICY "Owners view their clicks"
ON public.profile_clicks FOR SELECT TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Superadmins view all clicks"
ON public.profile_clicks FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));
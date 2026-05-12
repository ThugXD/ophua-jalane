-- Groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  admin_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);
CREATE INDEX idx_groups_admin ON public.groups(admin_id);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Security definer helpers
CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = _group_id AND admin_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.user_admin_groups(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.groups WHERE admin_id = _user_id
$$;

-- RLS policies for groups
CREATE POLICY "Superadmins manage all groups"
ON public.groups FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Group admins can view their group"
ON public.groups FOR SELECT
TO authenticated
USING (admin_id = auth.uid());

CREATE POLICY "Members can view their group"
ON public.groups FOR SELECT
TO authenticated
USING (public.is_group_member(auth.uid(), id));

-- RLS policies for group_members
CREATE POLICY "Superadmins manage all members"
ON public.group_members FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Group admins can view group members"
ON public.group_members FOR SELECT
TO authenticated
USING (public.is_group_admin(auth.uid(), group_id));

CREATE POLICY "Users can view their own membership"
ON public.group_members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow superadmins to view all profiles already covered.
-- Allow group admins to view profiles of their group members
CREATE POLICY "Group admins can view member profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    JOIN public.groups g ON g.id = gm.group_id
    WHERE gm.user_id = profiles.id AND g.admin_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER set_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
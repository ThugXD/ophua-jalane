
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS cover_url text;

-- Function: when group cover changes, update all members' cover
CREATE OR REPLACE FUNCTION public.sync_group_cover_to_members()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.cover_url IS DISTINCT FROM OLD.cover_url THEN
    UPDATE public.profiles p
    SET cover_url = NEW.cover_url
    FROM public.group_members gm
    WHERE gm.group_id = NEW.id AND gm.user_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_group_cover ON public.groups;
CREATE TRIGGER trg_sync_group_cover
AFTER UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.sync_group_cover_to_members();

-- Function: when a member is added, set their cover to group's cover
CREATE OR REPLACE FUNCTION public.sync_member_cover_on_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cover text;
BEGIN
  SELECT cover_url INTO v_cover FROM public.groups WHERE id = NEW.group_id;
  IF v_cover IS NOT NULL THEN
    UPDATE public.profiles SET cover_url = v_cover WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_member_cover_on_join ON public.group_members;
CREATE TRIGGER trg_sync_member_cover_on_join
AFTER INSERT ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.sync_member_cover_on_join();

-- Allow group admins and superadmins to update member profile covers
-- (current policy only allows users to update their own profile)
DROP POLICY IF EXISTS "Group admins can update member covers" ON public.profiles;
CREATE POLICY "Group admins can update member covers"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    JOIN public.groups g ON g.id = gm.group_id
    WHERE gm.user_id = profiles.id AND g.admin_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'superadmin'::app_role)
);

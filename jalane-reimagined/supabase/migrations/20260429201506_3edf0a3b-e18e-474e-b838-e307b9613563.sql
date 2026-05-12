-- Add address field to groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';

-- Sync group address to members when group address changes
CREATE OR REPLACE FUNCTION public.sync_group_address_to_members()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.address IS DISTINCT FROM OLD.address THEN
    UPDATE public.profiles p
    SET address = COALESCE(NEW.address, '')
    FROM public.group_members gm
    WHERE gm.group_id = NEW.id AND gm.user_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_group_address ON public.groups;
CREATE TRIGGER trg_sync_group_address
AFTER UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.sync_group_address_to_members();

-- Sync group address to a new member when they join
CREATE OR REPLACE FUNCTION public.sync_member_address_on_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_address text;
BEGIN
  SELECT address INTO v_address FROM public.groups WHERE id = NEW.group_id;
  IF v_address IS NOT NULL AND v_address <> '' THEN
    UPDATE public.profiles SET address = v_address WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_member_address_join ON public.group_members;
CREATE TRIGGER trg_sync_member_address_join
AFTER INSERT ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.sync_member_address_on_join();

-- Allow group admins to update address column on member profiles
-- (Existing policy "Group admins can update member covers" already allows UPDATE on profiles for admins)

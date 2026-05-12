
CREATE OR REPLACE FUNCTION public.sync_group_name_to_members()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.profiles p
    SET company = COALESCE(NEW.name, '')
    FROM public.group_members gm
    WHERE gm.group_id = NEW.id AND gm.user_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_group_name_to_members ON public.groups;
CREATE TRIGGER trg_sync_group_name_to_members
AFTER UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.sync_group_name_to_members();

CREATE OR REPLACE FUNCTION public.sync_member_company_on_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_name text;
BEGIN
  SELECT name INTO v_name FROM public.groups WHERE id = NEW.group_id;
  IF v_name IS NOT NULL AND v_name <> '' THEN
    UPDATE public.profiles SET company = v_name WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_member_company_on_join ON public.group_members;
CREATE TRIGGER trg_sync_member_company_on_join
AFTER INSERT ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.sync_member_company_on_join();

-- Backfill: alinhar todos os perfis ao nome atual do grupo
UPDATE public.profiles p
SET company = g.name
FROM public.group_members gm
JOIN public.groups g ON g.id = gm.group_id
WHERE gm.user_id = p.id
  AND p.company IS DISTINCT FROM g.name;

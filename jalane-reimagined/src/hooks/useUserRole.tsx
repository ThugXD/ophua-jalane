import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "superadmin" | "admin" | "user";

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [adminGroupIds, setAdminGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setAdminGroupIds([]);
      setLoading(false);
      return;
    }
    (async () => {
      const [{ data: r }, { data: g }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("groups").select("id").eq("admin_id", user.id),
      ]);
      setRoles((r ?? []).map((x) => x.role as AppRole));
      setAdminGroupIds((g ?? []).map((x) => x.id as string));
      setLoading(false);
    })();
  }, [user, authLoading]);

  const isSuperadmin = roles.includes("superadmin");
  const isGroupAdmin = adminGroupIds.length > 0;

  return {
    roles,
    loading,
    isSuperadmin,
    isAdmin: roles.includes("admin") || isSuperadmin,
    isGroupAdmin,
    adminGroupIds,
  };
}

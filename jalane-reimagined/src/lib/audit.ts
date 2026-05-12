import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "login"
  | "logout"
  | "login_failed"
  | "signup"
  | "profile_updated"
  | "avatar_updated"
  | "cover_updated"
  | "user_created"
  | "user_updated"
  | "user_deleted"
  | "role_granted"
  | "role_revoked"
  | "group_created"
  | "group_updated"
  | "group_deleted"
  | "group_member_added"
  | "group_member_removed";

export async function logAudit(params: {
  action: AuditAction;
  entity_type?: string;
  entity_id?: string;
  group_id?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    await (supabase.from("audit_logs" as never) as any).insert({
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? "",
      action: params.action,
      entity_type: params.entity_type ?? "",
      entity_id: params.entity_id ?? "",
      group_id: params.group_id ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (e) {
    console.warn("audit log failed", e);
  }
}

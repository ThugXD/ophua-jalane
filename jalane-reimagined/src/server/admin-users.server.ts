import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function assertCallerIsSuperadmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "superadmin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: requer superadmin");
}

export async function adminCreateUser(input: {
  email: string;
  password: string;
  full_name: string;
  job_title: string;
  role: "user" | "superadmin" | "admin";
  group_id?: string | null;
}) {
  if (input.role === "admin" && !input.group_id) {
    throw new Error("Seleccione a empresa para administrar.");
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });
  if (error) throw new Error(error.message);
  const newId = data.user!.id;

  const { error: pErr } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: newId,
      full_name: input.full_name,
      job_title: input.job_title,
      primary_email: input.email,
    });
  if (pErr) throw new Error(pErr.message);

  if (input.role === "superadmin") {
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newId, role: "superadmin" });
    if (rErr) throw new Error(rErr.message);
  }

  if (input.role === "admin" && input.group_id) {
    // Ensure the chosen group does not already have an admin
    const { data: existing, error: cErr } = await supabaseAdmin
      .from("groups")
      .select("id, admin_id")
      .eq("id", input.group_id)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (existing?.admin_id) {
      throw new Error("Esta empresa já tem um administrador atribuído.");
    }

    const { error: gErr } = await supabaseAdmin
      .from("groups")
      .update({ admin_id: newId })
      .eq("id", input.group_id);
    if (gErr) throw new Error(gErr.message);

    // Ensure they're a member too
    const { error: mErr } = await supabaseAdmin
      .from("group_members")
      .upsert({ user_id: newId, group_id: input.group_id }, { onConflict: "group_id,user_id" });
    if (mErr) throw new Error(mErr.message);
  }

  return { id: newId };
}

export async function assertCallerIsGroupAdmin(userId: string, groupId: string) {
  const { data, error } = await supabaseAdmin
    .from("groups")
    .select("id")
    .eq("id", groupId)
    .eq("admin_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: não é admin desta empresa");
}

export async function groupAdminCreateUser(input: {
  caller_id: string;
  group_id: string;
  email: string;
  password: string;
  full_name: string;
  job_title: string;
}) {
  await assertCallerIsGroupAdmin(input.caller_id, input.group_id);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });
  if (error) throw new Error(error.message);
  const newId = data.user!.id;

  const { error: pErr } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: newId,
      full_name: input.full_name,
      job_title: input.job_title,
      primary_email: input.email,
    });
  if (pErr) throw new Error(pErr.message);

  const { error: mErr } = await supabaseAdmin
    .from("group_members")
    .upsert({ user_id: newId, group_id: input.group_id }, { onConflict: "group_id,user_id" });
  if (mErr) throw new Error(mErr.message);

  return { id: newId };
}

export async function adminUpdateUser(input: {
  caller_id: string;
  target_id: string;
  group_id?: string | null;
  full_name: string;
  job_title: string;
  primary_email: string;
  secondary_email: string;
  mobile_phone: string;
  work_phone: string;
  company: string;
  address: string;
  password?: string;
}) {
  // Authorization: superadmin OR (group admin and target is in their group)
  const { data: superRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", input.caller_id)
    .eq("role", "superadmin")
    .maybeSingle();
  const isSuper = !!superRow;

  if (!isSuper) {
    if (!input.group_id) throw new Error("Acesso negado");
    await assertCallerIsGroupAdmin(input.caller_id, input.group_id);
    const { data: mem, error: mErr } = await supabaseAdmin
      .from("group_members")
      .select("user_id")
      .eq("group_id", input.group_id)
      .eq("user_id", input.target_id)
      .maybeSingle();
    if (mErr) throw new Error(mErr.message);
    if (!mem) throw new Error("Utilizador não pertence à sua empresa");
  }

  // Update auth (email + optional password)
  const authPayload: { email?: string; password?: string } = {};
  if (input.primary_email) authPayload.email = input.primary_email;
  if (input.password && input.password.length > 0) authPayload.password = input.password;
  if (Object.keys(authPayload).length > 0) {
    const { error: aErr } = await supabaseAdmin.auth.admin.updateUserById(
      input.target_id,
      authPayload,
    );
    if (aErr) throw new Error(aErr.message);
  }

  const { error: pErr } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: input.full_name,
      job_title: input.job_title,
      primary_email: input.primary_email,
      secondary_email: input.secondary_email,
      mobile_phone: input.mobile_phone,
      work_phone: input.work_phone,
      company: input.company,
      address: input.address,
    })
    .eq("id", input.target_id);
  if (pErr) throw new Error(pErr.message);

  return { ok: true };
}

export async function groupAdminRemoveMember(input: {
  caller_id: string;
  group_id: string;
  user_id: string;
}) {
  await assertCallerIsGroupAdmin(input.caller_id, input.group_id);
  if (input.user_id === input.caller_id) {
    throw new Error("Não pode remover-se a si próprio.");
  }
  const { error } = await supabaseAdmin
    .from("group_members")
    .delete()
    .eq("group_id", input.group_id)
    .eq("user_id", input.user_id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function setUserActive(input: {
  caller_id: string;
  target_id: string;
  active: boolean;
}) {
  if (input.caller_id === input.target_id) {
    throw new Error("Não pode desactivar a sua própria conta.");
  }

  // Authorization: superadmin OR group admin of a group the target belongs to
  const { data: superRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", input.caller_id)
    .eq("role", "superadmin")
    .maybeSingle();
  const isSuper = !!superRow;

  if (!isSuper) {
    // Caller must be admin of a group that contains the target user
    const { data: callerGroups, error: cgErr } = await supabaseAdmin
      .from("groups")
      .select("id")
      .eq("admin_id", input.caller_id);
    if (cgErr) throw new Error(cgErr.message);
    const groupIds = (callerGroups ?? []).map((g) => g.id);
    if (groupIds.length === 0) throw new Error("Acesso negado");

    const { data: mem, error: mErr } = await supabaseAdmin
      .from("group_members")
      .select("user_id")
      .eq("user_id", input.target_id)
      .in("group_id", groupIds)
      .maybeSingle();
    if (mErr) throw new Error(mErr.message);
    if (!mem) throw new Error("Utilizador não pertence à sua empresa");

    // Group admins can never deactivate a superadmin
    const { data: targetSuper } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", input.target_id)
      .eq("role", "superadmin")
      .maybeSingle();
    if (targetSuper) throw new Error("Não pode alterar uma conta superadmin.");
  }

  // Use Supabase Auth admin API to ban/unban (effectively disable login)
  // ban_duration: "none" to unban, or a long duration to ban
  const ban_duration = input.active ? "none" : "876000h"; // 100 years
  const { error } = await supabaseAdmin.auth.admin.updateUserById(input.target_id, {
    ban_duration,
  } as { ban_duration: string });
  if (error) throw new Error(error.message);

  return { ok: true, active: input.active };
}

export async function listUserActiveStatus(input: {
  caller_id: string;
  user_ids: string[];
}) {
  // Authorization: superadmin OR group admin
  const { data: superRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", input.caller_id)
    .eq("role", "superadmin")
    .maybeSingle();
  const isSuper = !!superRow;

  let allowedIds = input.user_ids;
  if (!isSuper) {
    const { data: callerGroups } = await supabaseAdmin
      .from("groups")
      .select("id")
      .eq("admin_id", input.caller_id);
    const groupIds = (callerGroups ?? []).map((g) => g.id);
    if (groupIds.length === 0) return {} as Record<string, boolean>;
    const { data: mems } = await supabaseAdmin
      .from("group_members")
      .select("user_id")
      .in("group_id", groupIds);
    const memberIds = new Set((mems ?? []).map((m) => m.user_id));
    allowedIds = input.user_ids.filter((id) => memberIds.has(id));
  }

  const result: Record<string, boolean> = {};
  for (const id of allowedIds) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
    if (error || !data?.user) continue;
    const banned = (data.user as { banned_until?: string | null }).banned_until;
    const isActive = !banned || new Date(banned).getTime() <= Date.now();
    result[id] = isActive;
  }
  return result;
}

export async function groupAdminImportUsers(input: {
  caller_id: string;
  group_id: string;
  rows: Array<{
    email: string;
    full_name: string;
    job_title: string;
    mobile_phone: string;
    work_phone: string;
    secondary_email: string;
    password: string;
  }>;
}) {
  await assertCallerIsGroupAdmin(input.caller_id, input.group_id);

  let created = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const row of input.rows) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: row.email,
        password: row.password,
        email_confirm: true,
        user_metadata: { full_name: row.full_name },
      });
      if (error) throw new Error(error.message);
      const newId = data.user!.id;

      const { error: pErr } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: newId,
          full_name: row.full_name,
          job_title: row.job_title,
          primary_email: row.email,
          secondary_email: row.secondary_email,
          mobile_phone: row.mobile_phone,
          work_phone: row.work_phone,
        });
      if (pErr) throw new Error(pErr.message);

      const { error: mErr } = await supabaseAdmin
        .from("group_members")
        .upsert(
          { user_id: newId, group_id: input.group_id },
          { onConflict: "group_id,user_id" },
        );
      if (mErr) throw new Error(mErr.message);

      created++;
    } catch (e) {
      errors.push({
        email: row.email,
        error: e instanceof Error ? e.message : "Erro desconhecido",
      });
    }
  }

  return { created, failed: errors.length, errors };
}

export { createClient };
export type { Database };

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  adminCreateUser,
  adminUpdateUser,
  assertCallerIsSuperadmin,
  groupAdminCreateUser,
  groupAdminRemoveMember,
  setUserActive,
  listUserActiveStatus,
} from "./admin-users.server";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  full_name: z.string().trim().min(1).max(120),
  job_title: z.string().trim().max(120).default(""),
  role: z.enum(["user", "superadmin", "admin"]).default("user"),
  group_id: z.string().uuid().nullable().optional(),
});

export const createUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data, context }) => {
    await assertCallerIsSuperadmin(context.userId);
    return adminCreateUser(data);
  });

const groupCreateSchema = z.object({
  group_id: z.string().uuid(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  full_name: z.string().trim().min(1).max(120),
  job_title: z.string().trim().max(120).default(""),
});

export const groupCreateUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => groupCreateSchema.parse(data))
  .handler(async ({ data, context }) => {
    return groupAdminCreateUser({ ...data, caller_id: context.userId });
  });

const groupRemoveSchema = z.object({
  group_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const groupRemoveMemberFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => groupRemoveSchema.parse(data))
  .handler(async ({ data, context }) => {
    return groupAdminRemoveMember({ ...data, caller_id: context.userId });
  });

const updateSchema = z.object({
  target_id: z.string().uuid(),
  group_id: z.string().uuid().nullable().optional(),
  full_name: z.string().trim().min(1).max(120),
  job_title: z.string().trim().max(120).default(""),
  primary_email: z.string().email().max(255),
  secondary_email: z.union([z.literal(""), z.string().email().max(255)]).default(""),
  mobile_phone: z.string().trim().max(40).default(""),
  work_phone: z.string().trim().max(40).default(""),
  company: z.string().trim().max(120).default(""),
  address: z.string().trim().max(200).default(""),
  password: z.union([z.literal(""), z.string().min(8).max(72)]).optional(),
});

export const adminUpdateUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateSchema.parse(data))
  .handler(async ({ data, context }) => {
    return adminUpdateUser({ ...data, caller_id: context.userId, group_id: data.group_id ?? null });
  });

const importRowSchema = z.object({
  email: z.string().trim().email().max(255),
  full_name: z.string().trim().min(1).max(120),
  job_title: z.string().trim().max(120).default(""),
  mobile_phone: z.string().trim().max(40).default(""),
  work_phone: z.string().trim().max(40).default(""),
  secondary_email: z.union([z.literal(""), z.string().email().max(255)]).default(""),
  password: z.string().min(8).max(72),
});

const importSchema = z.object({
  group_id: z.string().uuid(),
  rows: z.array(importRowSchema).min(1).max(500),
});

export const groupImportUsersFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => importSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { groupAdminImportUsers } = await import("./admin-users.server");
    return groupAdminImportUsers({ ...data, caller_id: context.userId });
  });

const setActiveSchema = z.object({
  target_id: z.string().uuid(),
  active: z.boolean(),
});

export const setUserActiveFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => setActiveSchema.parse(data))
  .handler(async ({ data, context }) => {
    return setUserActive({ ...data, caller_id: context.userId });
  });

const listActiveSchema = z.object({
  user_ids: z.array(z.string().uuid()).max(500),
});

export const listUserActiveStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => listActiveSchema.parse(data))
  .handler(async ({ data, context }) => {
    return listUserActiveStatus({ ...data, caller_id: context.userId });
  });

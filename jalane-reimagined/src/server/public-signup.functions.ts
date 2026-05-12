import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  full_name: z.string().trim().min(1).max(120),
});

export const publicSignupFn = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    // Create user already confirmed but banned (inactive) until a superadmin activates
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
      ban_duration: "876000h",
    });
    if (error) throw new Error(error.message);
    const newId = created.user!.id;

    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newId,
        full_name: data.full_name,
        primary_email: data.email,
      });
    if (pErr) throw new Error(pErr.message);

    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({ email: z.string().email().max(255) });

export const forgotPasswordFn = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    // Trigger Supabase password reset email (best-effort, ignore errors to avoid email enumeration)
    try {
      await supabaseAdmin.auth.resetPasswordForEmail(data.email);
    } catch (e) {
      console.warn("resetPasswordForEmail failed", e);
    }

    // Notify admins
    try {
      await supabaseAdmin.rpc("notify_admins" as never, {
        _type: "password_reset",
        _title: "Pedido de recuperação de palavra-passe",
        _body: data.email,
        _metadata: { email: data.email },
      } as never);
    } catch (e) {
      console.warn("notify_admins failed", e);
    }

    return { ok: true };
  });

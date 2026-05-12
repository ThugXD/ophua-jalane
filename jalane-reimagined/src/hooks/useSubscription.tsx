import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Plan = "free" | "pro" | "business";

export type SubscriptionInfo = {
  plan: Plan;
  expiresAt: string | null;
  isActive: boolean;
  isExpired: boolean;
  daysLeft: number | null;
};

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setInfo(null); setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select("plan, expires_at")
        .eq("user_id", user.id)
        .maybeSingle();
      const plan = (data?.plan ?? "free") as Plan;
      const expiresAt = data?.expires_at ?? null;
      const expDate = expiresAt ? new Date(expiresAt) : null;
      const now = new Date();
      const isExpired = !!expDate && expDate.getTime() < now.getTime();
      const daysLeft = expDate
        ? Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / 86400000))
        : null;
      const isActive = !isExpired;
      setInfo({ plan, expiresAt, isActive, isExpired, daysLeft });
      setLoading(false);
    })();
  }, [user, authLoading]);

  return { ...(info ?? { plan: "free" as Plan, expiresAt: null, isActive: false, isExpired: true, daysLeft: 0 }), loading };
}

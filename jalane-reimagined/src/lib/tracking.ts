import { supabase } from "@/integrations/supabase/client";

const VIEW_DEDUP_WINDOW_MS = 30 * 60 * 1000; // 30 min

export async function trackProfileView(profileId: string) {
  if (!profileId || typeof window === "undefined") return;
  try {
    const key = `pv:${profileId}`;
    const last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last < VIEW_DEDUP_WINDOW_MS) return;
    sessionStorage.setItem(key, String(Date.now()));
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("profile_views").insert({
      profile_id: profileId,
      viewer_id: user?.id ?? null,
    });
  } catch {
    /* ignore */
  }
}

export async function trackProfileClick(profileId: string, clickType: string) {
  if (!profileId) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("profile_clicks").insert({
      profile_id: profileId,
      click_type: clickType,
      viewer_id: user?.id ?? null,
    });
  } catch {
    /* ignore */
  }
}

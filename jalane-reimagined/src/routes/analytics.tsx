import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Eye, MousePointerClick, Percent } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminSidebar } from "@/components/AdminSidebar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useT } from "@/hooks/useT";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperadmin } = useUserRole();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [viewsSeries, setViewsSeries] = useState<{ date: string; views: number }[]>([]);
  const [clicksByCategory, setClicksByCategory] = useState<{ category: string; clicks: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const days = 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const sinceISO = since.toISOString();

      const [viewsRes, clicksRes] = await Promise.all([
        supabase.from("profile_views").select("created_at")
          .eq("profile_id", user.id).gte("created_at", sinceISO),
        supabase.from("profile_clicks").select("created_at, click_type")
          .eq("profile_id", user.id).gte("created_at", sinceISO),
      ]);

      const views = viewsRes.data ?? [];
      const clicks = clicksRes.data ?? [];

      // Build daily series for last 30 days
      const buckets: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(since.getTime() + i * 86400000);
        const key = d.toISOString().slice(0, 10);
        buckets[key] = 0;
      }
      for (const v of views) {
        const key = new Date(v.created_at as string).toISOString().slice(0, 10);
        if (key in buckets) buckets[key]++;
      }
      const series = Object.entries(buckets).map(([date, v]) => ({ date, views: v }));

      // Clicks by category (split on ":" prefix like "social:Instagram")
      const catMap: Record<string, number> = {};
      for (const c of clicks) {
        const ct = (c.click_type as string) ?? "other";
        const cat = ct.includes(":") ? ct.split(":")[0] : ct;
        catMap[cat] = (catMap[cat] ?? 0) + 1;
      }
      const cats = Object.entries(catMap)
        .map(([category, n]) => ({ category, clicks: n }))
        .sort((a, b) => b.clicks - a.clicks);

      setStats({ views: views.length, clicks: clicks.length });
      setViewsSeries(series);
      setClicksByCategory(cats);
      setLoaded(true);
    })();
  }, [user]);

  if (authLoading || !user || !loaded) {
    return (
      <div className="min-h-screen flex bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 text-sm text-muted-foreground">{t("loading")}</main>
      </div>
    );
  }

  const locale = lang === "pt" ? "pt-PT" : "en-US";
  const ctr = stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(2) : "0.00";
  const rows = [
    { icon: Eye, label: "Page Views", value: stats.views.toLocaleString(locale), desc: t("views_desc") },
    { icon: MousePointerClick, label: "Page Clicks", value: stats.clicks.toLocaleString(locale), desc: t("clicks_desc") },
    { icon: Percent, label: "CTR", value: `${ctr}%`, desc: t("ctr_desc") },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{t("analytics_title")}</h1>
          <span className="ml-auto text-xs text-muted-foreground">{t("last_30_days")}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {rows.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Icon className="h-4 w-4" /> {s.label}
                </div>
                <div className="mt-2 text-2xl font-bold">{s.value}</div>
              </div>
            );
          })}
        </div>

        {/* Page Views over time */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm mb-6">
          <h2 className="text-sm font-semibold mb-4">Page Views</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7DB9FF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#7DB9FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#9ca3af" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#ffffff" }}
                  tickFormatter={(d: string) => new Date(d).toLocaleDateString(locale, { month: "short", day: "numeric" })}
                  minTickGap={16}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#ffffff" }} width={28} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(d: string) => new Date(d).toLocaleDateString(locale, { month: "short", day: "numeric" })}
                />
                <Area type="monotone" dataKey="views" stroke="#7DB9FF" strokeWidth={2} fill="url(#viewsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type of views + Clicks per category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <h2 className="text-sm font-semibold mb-4">Type of views</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ name: "Web", value: stats.views || 1 }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    <Cell fill="#7DB9FF" />
                  </Pie>
                  <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <h2 className="text-sm font-semibold mb-4">Clicks per category</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clicksByCategory} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#9ca3af" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#ffffff" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#ffffff" }} width={28} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="clicks" fill="#7DB9FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("metric")}</TableHead>
                  <TableHead>{t("value")}</TableHead>
                  <TableHead>{t("description")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const Icon = r.icon;
                  return (
                    <TableRow key={r.label}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {r.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-lg font-semibold">{r.value}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.desc}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {isSuperadmin && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t("superadmin_global_hint")} <a href="/admin/analytics" className="underline">Admin → {t("nav_analytics")}</a>.
          </p>
        )}
      </main>
    </div>
  );
}

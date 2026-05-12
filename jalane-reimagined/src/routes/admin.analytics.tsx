import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Eye, MousePointerClick, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics" }] }),
  component: AdminAnalytics,
});

type Row = {
  profile_id: string;
  full_name: string;
  company: string;
  views: number;
  clicks: number;
};

function AdminAnalytics() {
  const { isSuperadmin, loading: roleLoading } = useUserRole();
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState({ views: 0, clicks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading || !isSuperadmin) return;
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [{ data: views }, { data: clicks }, { data: profiles }] = await Promise.all([
        supabase.from("profile_views").select("profile_id").gte("created_at", since),
        supabase.from("profile_clicks").select("profile_id").gte("created_at", since),
        supabase.from("profiles").select("id, full_name, company"),
      ]);

      const vMap = new Map<string, number>();
      const cMap = new Map<string, number>();
      (views ?? []).forEach((v) => vMap.set(v.profile_id, (vMap.get(v.profile_id) ?? 0) + 1));
      (clicks ?? []).forEach((c) => cMap.set(c.profile_id, (cMap.get(c.profile_id) ?? 0) + 1));

      const list: Row[] = (profiles ?? []).map((p) => ({
        profile_id: p.id,
        full_name: p.full_name || "(sem nome)",
        company: p.company || "—",
        views: vMap.get(p.id) ?? 0,
        clicks: cMap.get(p.id) ?? 0,
      }))
        .filter((r) => r.views > 0 || r.clicks > 0)
        .sort((a, b) => b.views - a.views);

      const totalViews = (views ?? []).length;
      const totalClicks = (clicks ?? []).length;

      setRows(list);
      setTotals({ views: totalViews, clicks: totalClicks });
      setLoading(false);
    })();
  }, [isSuperadmin, roleLoading]);

  if (roleLoading) return <main className="p-8 text-sm text-muted-foreground">Carregando...</main>;
  if (!isSuperadmin) return <main className="p-8 text-sm text-muted-foreground">Sem acesso.</main>;

  const ctr = totals.views > 0 ? ((totals.clicks / totals.views) * 100).toFixed(2) : "0.00";

  return (
    <main className="p-8 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Analytics</h1>
        <span className="ml-auto text-xs text-muted-foreground">Últimos 30 dias</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Eye, label: "Total Page Views", value: totals.views.toLocaleString("pt-PT") },
          { icon: MousePointerClick, label: "Total Page Clicks", value: totals.clicks.toLocaleString("pt-PT") },
          { icon: Percent, label: "CTR Global", value: `${ctr}%` },
        ].map((s) => {
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

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-sm font-semibold">Por cartão</div>
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground text-center">Sem atividade nos últimos 30 dias.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const rowCtr = r.views > 0 ? ((r.clicks / r.views) * 100).toFixed(2) : "0.00";
                  return (
                    <TableRow key={r.profile_id}>
                      <TableCell className="font-medium">{r.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.company}</TableCell>
                      <TableCell className="text-right">{r.views}</TableCell>
                      <TableCell className="text-right">{r.clicks}</TableCell>
                      <TableCell className="text-right">{rowCtr}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </main>
  );
}

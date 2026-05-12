import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({ meta: [{ title: "Subscrições" }] }),
  component: AdminSubsPage,
});

type Plan = "free" | "pro" | "business";

type Row = {
  user_id: string;
  plan: Plan;
  expires_at: string | null;
  full_name: string;
  primary_email: string;
};

function AdminSubsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperadmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [trialDays, setTrialDays] = useState<number>(14);
  const [savingDays, setSavingDays] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!isSuperadmin) { navigate({ to: "/profile" }); return; }
    (async () => {
      const [{ data: settings }, { data: subs }, { data: profs }] = await Promise.all([
        supabase.from("app_settings").select("free_trial_days").eq("id", true).maybeSingle(),
        supabase.from("user_subscriptions").select("user_id, plan, expires_at"),
        supabase.from("profiles").select("id, full_name, primary_email"),
      ]);
      if (settings?.free_trial_days) setTrialDays(settings.free_trial_days);
      const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
      setRows((subs ?? []).map((s) => {
        const p = profMap.get(s.user_id);
        return {
          user_id: s.user_id,
          plan: s.plan as Plan,
          expires_at: s.expires_at,
          full_name: p?.full_name ?? "",
          primary_email: p?.primary_email ?? "",
        };
      }));
      setLoaded(true);
    })();
  }, [user, authLoading, isSuperadmin, roleLoading, navigate]);

  const saveTrialDays = async () => {
    setSavingDays(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ free_trial_days: trialDays, updated_by: user!.id, updated_at: new Date().toISOString() })
      .eq("id", true);
    setSavingDays(false);
    if (error) toast.error(error.message); else toast.success("Período do trial atualizado");
  };

  const updateUser = async (userId: string, plan: Plan, expiresAt: string | null) => {
    setSavingUser(userId);
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ plan, expires_at: expiresAt })
      .eq("user_id", userId);
    setSavingUser(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Subscrição atualizada");
    setRows((rs) => rs.map((r) => r.user_id === userId ? { ...r, plan, expires_at: expiresAt } : r));
  };

  const filtered = rows.filter((r) => {
    const q = filter.toLowerCase();
    return !q || r.full_name.toLowerCase().includes(q) || r.primary_email.toLowerCase().includes(q);
  });

  if (!loaded) return <div className="p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscrições</h1>
        <p className="text-muted-foreground">Defina o período do trial Free e gira os planos dos utilizadores.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração global</CardTitle>
          <CardDescription>Duração do trial Free para novos utilizadores.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="days">Dias de trial Free</Label>
            <Input id="days" type="number" min={0} value={trialDays}
              onChange={(e) => setTrialDays(Math.max(0, Number(e.target.value) || 0))}
              className="w-32" />
          </div>
          <Button onClick={saveTrialDays} disabled={savingDays}>
            {savingDays && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Guardar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle>Utilizadores</CardTitle>
              <CardDescription>Atribua planos manualmente.</CardDescription>
            </div>
            <Input placeholder="Pesquisar..." value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilizador</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const exp = r.expires_at ? new Date(r.expires_at) : null;
                const expired = !!exp && exp.getTime() < Date.now();
                return (
                  <TableRow key={r.user_id}>
                    <TableCell>
                      <div className="font-medium">{r.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.primary_email}</div>
                    </TableCell>
                    <TableCell>
                      <Select value={r.plan} onValueChange={(v: Plan) =>
                        setRows((rs) => rs.map((x) => x.user_id === r.user_id ? { ...x, plan: v } : x))}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={r.expires_at ? r.expires_at.slice(0, 10) : ""}
                        onChange={(e) => {
                          const v = e.target.value ? new Date(e.target.value).toISOString() : null;
                          setRows((rs) => rs.map((x) => x.user_id === r.user_id ? { ...x, expires_at: v } : x));
                        }}
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      {expired
                        ? <Badge variant="destructive">Expirado</Badge>
                        : <Badge>Ativo</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" disabled={savingUser === r.user_id}
                        onClick={() => updateUser(r.user_id, r.plan, r.expires_at)}>
                        {savingUser === r.user_id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Guardar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Sem utilizadores.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

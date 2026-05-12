import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Briefcase, Building2, LogOut, Pencil, ArrowLeft, Trash2, Inbox, BarChart3, Eye, MousePointerClick, Percent, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShareSidebar } from "@/components/ShareSidebar";
import { useT } from "@/hooks/useT";

export const Route = createFileRoute("/profile/")({
  head: () => ({ meta: [{ title: "Meu perfil" }] }),
  component: ProfileViewPage,
});

type Profile = {
  full_name: string;
  job_title: string;
  company: string;
  address: string;
  primary_email: string;
  secondary_email: string;
  mobile_phone: string;
  work_phone: string;
  avatar_url: string | null;
  cover_url: string | null;
};

type Exchange = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  created_at: string;
};

function ProfileViewPage() {
  const { user, loading } = useAuth();
  const { isSuperadmin, isGroupAdmin } = useUserRole();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groupCompany, setGroupCompany] = useState<string | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [loaded, setLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Exchange | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setProfile(data as Profile);

      const { data: membership } = await supabase
        .from("group_members")
        .select("groups(name)")
        .eq("user_id", user.id)
        .maybeSingle();
      setGroupCompany((membership?.groups as { name?: string } | null)?.name ?? null);

      const { data: ex, error } = await supabase
        .from("contact_exchanges")
        .select("id, full_name, email, phone, company, message, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      if (ex) setExchanges(ex);

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [{ count: viewsCount }, { count: clicksCount }] = await Promise.all([
        supabase.from("profile_views").select("id", { count: "exact", head: true })
          .eq("profile_id", user.id).gte("created_at", since),
        supabase.from("profile_clicks").select("id", { count: "exact", head: true })
          .eq("profile_id", user.id).gte("created_at", since),
      ]);
      setStats({ views: viewsCount ?? 0, clicks: clicksCount ?? 0 });

      setLoaded(true);
    })();
  }, [user]);

  const confirmDeleteExchange = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const { error } = await supabase.from("contact_exchanges").delete().eq("id", id);
    setDeleteTarget(null);
    if (error) return toast.error(error.message);
    setExchanges((xs) => xs.filter((x) => x.id !== id));
    toast.success(t("contact_removed"));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (loading || !user || !loaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">{t("loading")}</p>
      </main>
    );
  }

  const p = profile ?? ({} as Profile);
  const companyValue = groupCompany || p.company;

  const cardUrl = typeof window !== "undefined" && user
    ? `${window.location.origin}/u/${user.id}`
    : "/";

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
        <div className="min-w-0">
        {!isSuperadmin && !isGroupAdmin && (
          <div className="flex items-center justify-end mb-6">
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> {t("logout")}
            </Button>
          </div>
        )}

        <h1 className="text-2xl font-bold mb-6">{t("my_profile")}</h1>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="relative">
            <div className="w-full aspect-[2/1] bg-muted overflow-hidden">
              {p.cover_url && <img src={p.cover_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 w-20 h-20 rounded-2xl overflow-hidden border-4 border-card bg-muted flex items-center justify-center text-muted-foreground">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
          </div>

          <div className="pt-14 px-6 pb-6 text-center">
            <h2 className="text-xl font-bold text-foreground">{p.full_name || t("no_name")}</h2>
            {p.job_title && <p className="mt-1 text-sm text-muted-foreground">{p.job_title}</p>}
            {companyValue && <p className="mt-1 text-sm font-medium text-foreground">{companyValue}</p>}
            {p.address && <p className="mt-0.5 text-xs text-muted-foreground">{p.address}</p>}
          </div>


          <div className="px-6 pb-6">
            <Button asChild className="w-full">
              <Link to="/profile/edit">
                <Pencil className="h-4 w-4 mr-2" /> {t("edit_profile")}
              </Link>
            </Button>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Inbox className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">{t("received_contacts")}</h2>
            <span className="ml-auto text-xs text-muted-foreground">{exchanges.length} {t("total_count")}</span>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {exchanges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-8">
                {t("no_one_shared")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("email")}</TableHead>
                      <TableHead>{t("phone")}</TableHead>
                      <TableHead>{t("company")}</TableHead>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exchanges.map((x) => (
                      <TableRow key={x.id}>
                        <TableCell className="font-medium">
                          {x.full_name}
                          {x.message && (
                            <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate" title={x.message}>
                              "{x.message}"
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {x.email ? (
                            <a href={`mailto:${x.email}`} className="text-primary hover:underline">{x.email}</a>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {x.phone ? (
                            <a href={`tel:${x.phone.replace(/\s+/g, "")}`} className="text-primary hover:underline">{x.phone}</a>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{x.company || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(x.created_at).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-US", { day: "2-digit", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(x)} aria-label={t("remove")}>
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">{t("analytics_title")}</h2>
            <span className="ml-auto text-xs text-muted-foreground">{t("last_30_days")}</span>
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
                  {(() => {
                    const locale = lang === "pt" ? "pt-PT" : "en-US";
                    const pageViews = stats.views;
                    const pageClicks = stats.clicks;
                    const ctr = pageViews > 0 ? ((pageClicks / pageViews) * 100).toFixed(2) : "0.00";
                    const rows = [
                      { icon: Eye, label: "Page Views", value: pageViews.toLocaleString(locale), desc: t("views_desc") },
                      { icon: MousePointerClick, label: "Page Clicks", value: pageClicks.toLocaleString(locale), desc: t("clicks_desc") },
                      { icon: Percent, label: "CTR", value: `${ctr}%`, desc: t("ctr_desc") },
                    ];
                    return rows.map((r) => {
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
                    });
                  })()}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
        </div>

        <ShareSidebar cardUrl={cardUrl} ownerName={p.full_name || (lang === "pt" ? "o titular" : "the owner")} />
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("remove")}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.full_name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteExchange}>{t("remove")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

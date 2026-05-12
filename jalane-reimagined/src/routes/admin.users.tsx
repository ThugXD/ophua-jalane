import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ShieldOff, Loader2, UserPlus, Pencil, Eye, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminUpdateUserFn, createUserFn, setUserActiveFn, listUserActiveStatusFn } from "@/server/admin-users.functions";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Gestão de utilizadores" }] }),
  component: AdminUsersPage,
});

type ProfileRow = {
  id: string;
  full_name: string;
  primary_email: string;
  secondary_email: string;
  job_title: string;
  mobile_phone: string;
  work_phone: string;
  company: string;
  address: string;
  created_at: string;
};

type RoleRow = { user_id: string; role: "superadmin" | "admin" | "user" };

function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperadmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, string[]>>({});
  const [groups, setGroups] = useState<{ id: string; name: string; admin_id: string | null }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [togglingActive, setTogglingActive] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    password_confirm: "",
    job_title: "",
    role: "user" as "user" | "superadmin" | "admin",
    group_id: "" as string,
  });

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (roleLoading || authLoading) return;
    if (!user) return;
    if (!isSuperadmin) {
      navigate({ to: "/profile" });
      return;
    }
    void load();
  }, [user, isSuperadmin, roleLoading, authLoading, navigate]);

  async function load() {
    const [{ data: p }, { data: r }, { data: g }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, primary_email, secondary_email, job_title, mobile_phone, work_phone, company, address, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("groups").select("id, name, admin_id").order("name"),
    ]);
    setProfiles((p ?? []) as ProfileRow[]);
    const map: Record<string, string[]> = {};
    ((r ?? []) as RoleRow[]).forEach((row) => {
      map[row.user_id] = [...(map[row.user_id] ?? []), row.role];
    });
    setRolesByUser(map);
    setGroups((g ?? []) as { id: string; name: string; admin_id: string | null }[]);
    setLoaded(true);

    // fetch active status for all users
    const ids = ((p ?? []) as ProfileRow[]).map((row) => row.id);
    if (ids.length > 0) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          const status = await listUserActiveStatusFn({
            data: { user_ids: ids },
            headers: { Authorization: `Bearer ${token}` },
          });
          setActiveMap(status as Record<string, boolean>);
        }
      } catch {
        // non-critical
      }
    }
  }

  async function toggleActive(target: ProfileRow, currentlyActive: boolean) {
    if (target.id === user?.id) {
      toast.error("Não pode desactivar a sua própria conta.");
      return;
    }
    setTogglingActive(target.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sessão expirada.");
      await setUserActiveFn({
        data: { target_id: target.id, active: !currentlyActive },
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveMap((m) => ({ ...m, [target.id]: !currentlyActive }));
      toast.success(!currentlyActive ? "Conta activada." : "Conta desactivada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao alterar estado.");
    } finally {
      setTogglingActive(null);
    }
  }

  async function toggleSuperadmin(target: ProfileRow, isCurrentlySuper: boolean) {
    if (target.id === user?.id) {
      toast.error("Não pode alterar a sua própria função.");
      return;
    }
    if (!isCurrentlySuper) {
      setPromotePassword("");
      setPromoteTarget(target);
      return;
    }
    setRemoveSuperTarget(target);
  }

  async function confirmRemoveSuperadmin() {
    if (!removeSuperTarget) return;
    const target = removeSuperTarget;
    setRemoveSuperTarget(null);
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", target.id)
      .eq("role", "superadmin");
    if (error) return toast.error(error.message);
    toast.success("Função superadmin removida.");
    await load();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      toast.error("As palavras-passe não coincidem.");
      return;
    }
    if (form.role === "admin" && !form.group_id) {
      toast.error("Seleccione a empresa que este admin irá administrar.");
      return;
    }
    setCreating(true);
    try {
      const { password_confirm, group_id, role, ...rest } = form;
      void password_confirm;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
      await createUserFn({
        data: {
          ...rest,
          role,
          group_id: role === "admin" ? group_id : null,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Utilizador criado.");
      setCreateOpen(false);
      setForm({ full_name: "", email: "", password: "", password_confirm: "", job_title: "", role: "user", group_id: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar utilizador");
    } finally {
      setCreating(false);
    }
  }

  const [promoteTarget, setPromoteTarget] = useState<ProfileRow | null>(null);
  const [removeSuperTarget, setRemoveSuperTarget] = useState<ProfileRow | null>(null);
  const [promotePassword, setPromotePassword] = useState("");
  const [promoting, setPromoting] = useState(false);

  async function confirmPromote(e: React.FormEvent) {
    e.preventDefault();
    if (!promoteTarget || !user?.email) return;
    setPromoting(true);
    try {
      const { error: pwErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: promotePassword,
      });
      if (pwErr) {
        toast.error("Palavra-passe incorrecta.");
        setPromoting(false);
        return;
      }
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: promoteTarget.id, role: "superadmin" });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Função superadmin atribuída.");
        setPromoteTarget(null);
        setPromotePassword("");
        await load();
      }
    } finally {
      setPromoting(false);
    }
  }

  const [editTarget, setEditTarget] = useState<ProfileRow | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "", job_title: "", primary_email: "", secondary_email: "",
    mobile_phone: "", work_phone: "", company: "", address: "", password: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  if (authLoading || roleLoading || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  function openEdit(p: ProfileRow) {
    setEditForm({
      full_name: p.full_name ?? "",
      job_title: p.job_title ?? "",
      primary_email: p.primary_email ?? "",
      secondary_email: p.secondary_email ?? "",
      mobile_phone: p.mobile_phone ?? "",
      work_phone: p.work_phone ?? "",
      company: p.company ?? "",
      address: p.address ?? "",
      password: "",
    });
    setEditTarget(p);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sessão expirada.");
      await adminUpdateUserFn({
        data: { ...editForm, target_id: editTarget.id },
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Utilizador actualizado");
      setEditTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao guardar");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-end">
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" /> Superadmin
          </Badge>
        </div>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Utilizadores do sistema</h1>
            <p className="text-muted-foreground">
              {profiles.length} utilizador{profiles.length === 1 ? "" : "es"} registados
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Criar utilizador
          </Button>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Funções</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => {
                const baseRoles = rolesByUser[p.id] ?? [];
                const isGroupAdmin = groups.some((g) => g.admin_id === p.id);
                const displayRoles = Array.from(
                  new Set([...baseRoles, ...(isGroupAdmin ? ["admin"] : [])]),
                );
                const isSuper = baseRoles.includes("superadmin");
                const isSelf = p.id === user?.id;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.full_name || "(sem nome)"}
                      {isSelf && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.primary_email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{p.job_title || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {displayRoles.length === 0 ? (
                          <Badge variant="outline">user</Badge>
                        ) : (
                          displayRoles.map((r) => (
                            <Badge key={r} variant={r === "superadmin" ? "default" : "secondary"}>
                              {r}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activeMap[p.id] === false ? (
                        <Badge variant="outline" className="border-destructive text-destructive">Inactiva</Badge>
                      ) : (
                        <Badge variant="secondary">Activa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(p.created_at).toLocaleDateString("pt-PT")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" asChild aria-label="Ver perfil">
                          <Link to="/u/$id" params={{ id: p.id }} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)} aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={isSelf || togglingActive === p.id}
                          onClick={() => toggleActive(p, activeMap[p.id] !== false)}
                          aria-label={activeMap[p.id] === false ? "Activar conta" : "Desactivar conta"}
                        >
                          {togglingActive === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : activeMap[p.id] === false ? (
                            <Power className="h-4 w-4" />
                          ) : (
                            <PowerOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant={isSuper ? "outline" : "default"}
                          disabled={isSelf}
                          onClick={() => toggleSuperadmin(p, isSuper)}
                          aria-label={isSuper ? "Remover superadmin" : "Tornar superadmin"}
                        >
                          {isSuper ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar utilizador</DialogTitle>
            <DialogDescription>
              Os dados são preenchidos imediatamente e a conta fica activa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cu_name">Nome completo *</Label>
              <Input id="cu_name" value={form.full_name} required maxLength={120}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu_email">Email *</Label>
              <Input id="cu_email" type="email" value={form.email} required maxLength={255}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu_pass">Palavra-passe *</Label>
              <Input id="cu_pass" type="password" value={form.password} required minLength={8} maxLength={72}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu_pass2">Confirmar palavra-passe *</Label>
              <Input id="cu_pass2" type="password" value={form.password_confirm} required minLength={8} maxLength={72}
                onChange={(e) => setForm({ ...form, password_confirm: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu_job">Cargo</Label>
              <Input id="cu_job" value={form.job_title} maxLength={120}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu_role">Função *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as "user" | "superadmin" | "admin" })}>
                <SelectTrigger id="cu_role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilizador</SelectItem>
                  <SelectItem value="admin">Admin de empresa</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role === "admin" && (
              <div className="space-y-1.5">
                <Label htmlFor="cu_group">Empresa *</Label>
                <Select value={form.group_id} onValueChange={(v) => setForm({ ...form, group_id: v })}>
                  <SelectTrigger id="cu_group">
                    <SelectValue placeholder="Seleccione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.filter((g) => !g.admin_id).length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma empresa disponível (todas já têm administrador)</div>
                    ) : (
                      groups.filter((g) => !g.admin_id).map((g) => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Criando..." : "Criar utilizador"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar utilizador</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleEditSave}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Nome completo *</Label>
                <Input required value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email principal *</Label>
                <Input type="email" required value={editForm.primary_email}
                  onChange={(e) => setEditForm({ ...editForm, primary_email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email secundário</Label>
                <Input type="email" value={editForm.secondary_email}
                  onChange={(e) => setEditForm({ ...editForm, secondary_email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Cargo</Label>
                <Input value={editForm.job_title}
                  onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Empresa</Label>
                <Input value={editForm.company} disabled readOnly />
                <p className="text-xs text-muted-foreground">Sincronizada com o nome da empresa.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Telemóvel</Label>
                <Input value={editForm.mobile_phone}
                  onChange={(e) => setEditForm({ ...editForm, mobile_phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone de trabalho</Label>
                <Input value={editForm.work_phone}
                  onChange={(e) => setEditForm({ ...editForm, work_phone: e.target.value })} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Endereço</Label>
                <Input value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Nova palavra-passe (opcional)</Label>
                <Input type="password" minLength={8} value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Deixe em branco para manter" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>Cancelar</Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!promoteTarget} onOpenChange={(o) => { if (!o) { setPromoteTarget(null); setPromotePassword(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar promoção a superadmin</DialogTitle>
            <DialogDescription>
              Vai conceder privilégios de superadmin a <strong>{promoteTarget?.full_name || promoteTarget?.primary_email}</strong>. Confirme a sua palavra-passe para continuar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={confirmPromote} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="promote_pw">Sua palavra-passe</Label>
              <Input
                id="promote_pw"
                type="password"
                required
                autoFocus
                value={promotePassword}
                onChange={(e) => setPromotePassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setPromoteTarget(null); setPromotePassword(""); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={promoting || !promotePassword}>
                {promoting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar e promover"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeSuperTarget} onOpenChange={(o) => !o && setRemoveSuperTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover função superadmin?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeSuperTarget?.full_name || removeSuperTarget?.primary_email} deixará de ter privilégios de superadmin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveSuperadmin}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

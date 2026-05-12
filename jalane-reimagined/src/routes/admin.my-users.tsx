import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, Eye, FileSpreadsheet, Loader2, Pencil, Power, PowerOff, Trash2, UserPlus } from "lucide-react";
import * as XLSX from "xlsx";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { adminUpdateUserFn, groupCreateUserFn, groupImportUsersFn, groupRemoveMemberFn, setUserActiveFn, listUserActiveStatusFn } from "@/server/admin-users.functions";

export const Route = createFileRoute("/admin/my-users")({
  head: () => ({ meta: [{ title: "Utilizadores da empresa" }] }),
  component: MyUsersPage,
});

type Group = { id: string; name: string };
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
};

function MyUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { isGroupAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<ProfileRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    password_confirm: "",
    job_title: "",
  });

  const [removeTarget, setRemoveTarget] = useState<ProfileRow | null>(null);
  const [removing, setRemoving] = useState(false);

  const [editTarget, setEditTarget] = useState<ProfileRow | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "", job_title: "", primary_email: "", secondary_email: "",
    mobile_phone: "", work_phone: "", company: "", address: "", password: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [togglingActive, setTogglingActive] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ["full_name", "email", "password", "job_title", "mobile_phone", "work_phone", "secondary_email"],
      ["João Silva", "joao@empresa.com", "senha1234", "Gestor", "+351 912 345 678", "+351 210 000 000", ""],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Utilizadores");
    XLSX.writeFile(wb, "modelo-utilizadores.xlsx");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !group) return;
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

      const rows = json
        .map((r) => {
          const get = (k: string) => String(r[k] ?? r[k.toLowerCase()] ?? r[k.toUpperCase()] ?? "").trim();
          return {
            full_name: get("full_name") || get("nome") || get("name"),
            email: get("email"),
            password: get("password") || get("palavra-passe") || get("senha"),
            job_title: get("job_title") || get("cargo"),
            mobile_phone: get("mobile_phone") || get("telemovel") || get("telemóvel"),
            work_phone: get("work_phone") || get("telefone"),
            secondary_email: get("secondary_email") || get("email_secundario"),
          };
        })
        .filter((r) => r.email && r.full_name && r.password);

      if (rows.length === 0) {
        toast.error("Ficheiro vazio ou colunas inválidas. Use o modelo.");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sessão expirada.");

      const result = await groupImportUsersFn({
        data: { group_id: group.id, rows },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (result.created > 0) toast.success(`${result.created} utilizador(es) importado(s)`);
      if (result.failed > 0) {
        const sample = result.errors.slice(0, 3).map((e) => `${e.email}: ${e.error}`).join("\n");
        toast.error(`${result.failed} falharam.\n${sample}`);
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao importar");
    } finally {
      setImporting(false);
    }
  }

  function openEdit(m: ProfileRow) {
    setEditForm({
      full_name: m.full_name ?? "",
      job_title: m.job_title ?? "",
      primary_email: m.primary_email ?? "",
      secondary_email: m.secondary_email ?? "",
      mobile_phone: m.mobile_phone ?? "",
      work_phone: m.work_phone ?? "",
      company: m.company ?? "",
      address: m.address ?? "",
      password: "",
    });
    setEditTarget(m);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !group) return;
    setSavingEdit(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sessão expirada.");
      await adminUpdateUserFn({
        data: { ...editForm, target_id: editTarget.id, group_id: group.id },
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

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!isGroupAdmin) {
      navigate({ to: "/" });
      return;
    }
    void load();
  }, [authLoading, roleLoading, user, isGroupAdmin, navigate]);

  async function load() {
    if (!user) return;
    const { data: gs } = await supabase
      .from("groups")
      .select("id, name")
      .eq("admin_id", user.id)
      .maybeSingle();
    const g = (gs ?? null) as Group | null;
    setGroup(g);

    if (g) {
      const { data: gm } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", g.id);
      const ids = (gm ?? []).map((r) => r.user_id as string);
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, primary_email, secondary_email, job_title, mobile_phone, work_phone, company, address")
          .in("id", ids);
        setMembers((profs ?? []) as ProfileRow[]);
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
      } else {
        setMembers([]);
      }
    }
    setLoaded(true);
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;
    if (form.password !== form.password_confirm) {
      toast.error("As palavras-passe não coincidem");
      return;
    }
    setCreating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
      await groupCreateUserFn({
        data: {
          group_id: group.id,
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          job_title: form.job_title,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Utilizador criado");
      setCreateOpen(false);
      setForm({ full_name: "", email: "", password: "", password_confirm: "", job_title: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar utilizador");
    } finally {
      setCreating(false);
    }
  }

  async function handleRemove() {
    if (!removeTarget || !group) return;
    setRemoving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sessão expirada.");
      await groupRemoveMemberFn({
        data: { group_id: group.id, user_id: removeTarget.id },
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Utilizador removido da empresa");
      setRemoveTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    } finally {
      setRemoving(false);
    }
  }

  if (authLoading || roleLoading || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Não administra nenhuma empresa.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Utilizadores</h1>
            <p className="text-muted-foreground">Gerir utilizadores de {group.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={downloadTemplate} type="button">
              <Download className="h-4 w-4 mr-2" /> Modelo
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              {importing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              Importar Excel
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" /> Novo utilizador
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar utilizador</DialogTitle>
              </DialogHeader>
              <form className="space-y-3" onSubmit={handleCreate}>
                <div className="space-y-1.5">
                  <Label htmlFor="cu_name">Nome completo *</Label>
                  <Input id="cu_name" required value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cu_email">Email *</Label>
                  <Input id="cu_email" type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cu_job">Cargo</Label>
                  <Input id="cu_job" value={form.job_title}
                    onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cu_pw">Palavra-passe *</Label>
                  <Input id="cu_pw" type="password" required minLength={8} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cu_pw2">Confirmar palavra-passe *</Label>
                  <Input id="cu_pw2" type="password" required minLength={8} value={form.password_confirm}
                    onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                    aria-invalid={form.password_confirm.length > 0 && form.password !== form.password_confirm}
                    className={form.password_confirm.length > 0 && form.password !== form.password_confirm ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {form.password_confirm.length > 0 && form.password !== form.password_confirm && (
                    <p className="text-xs text-destructive">As palavras-passe não coincidem</p>
                  )}
                  {form.password_confirm.length > 0 && form.password === form.password_confirm && form.password.length >= 8 && (
                    <p className="text-xs text-green-600">As palavras-passe coincidem</p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating || form.password !== form.password_confirm}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Sem utilizadores
                  </TableCell>
                </TableRow>
              )}
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.full_name || "(sem nome)"}</TableCell>
                  <TableCell className="text-muted-foreground">{m.primary_email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{m.job_title || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{m.mobile_phone || "—"}</TableCell>
                  <TableCell>
                    {activeMap[m.id] === false ? (
                      <Badge variant="outline" className="border-destructive text-destructive">Inactiva</Badge>
                    ) : (
                      <Badge variant="secondary">Activa</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        asChild
                        aria-label="Ver perfil"
                      >
                        <Link to="/u/$id" params={{ id: m.id }} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(m)}
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {m.id !== user?.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={togglingActive === m.id}
                          onClick={() => toggleActive(m, activeMap[m.id] !== false)}
                          aria-label={activeMap[m.id] === false ? "Activar conta" : "Desactivar conta"}
                          title={activeMap[m.id] === false ? "Activar conta" : "Desactivar conta"}
                        >
                          {togglingActive === m.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : activeMap[m.id] === false ? (
                            <Power className="h-4 w-4 text-green-600" />
                          ) : (
                            <PowerOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                      {m.id !== user?.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setRemoveTarget(m)}
                          aria-label="Remover"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover utilizador?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.full_name || removeTarget?.primary_email} será removido(a) da empresa.
              A conta não é eliminada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={removing}>
              {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </div>
  );
}

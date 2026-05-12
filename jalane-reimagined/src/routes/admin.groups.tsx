import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Users, Loader2, UserPlus, X, ImageIcon, Upload, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/groups")({
  head: () => ({ meta: [{ title: "Gestão de empresas" }] }),
  component: AdminGroupsPage,
});

type Profile = { id: string; full_name: string; primary_email: string };
type Group = {
  id: string;
  name: string;
  description: string;
  admin_id: string | null;
  cover_url: string | null;
  address: string;
  created_at: string;
};
type Member = { id: string; group_id: string; user_id: string };

function AdminGroupsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperadmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newAdminId, setNewAdminId] = useState<string>("");
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const newCoverInputRef = useRef<HTMLInputElement>(null);

  const [memberDialog, setMemberDialog] = useState<Group | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [uploadingCoverId, setUploadingCoverId] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<Group | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteGroupTarget, setDeleteGroupTarget] = useState<Group | null>(null);
  const [removeMemberTarget, setRemoveMemberTarget] = useState<{ memberId: string; name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (roleLoading || authLoading || !user) return;
    if (!isSuperadmin) {
      navigate({ to: "/profile" });
      return;
    }
    void load();
  }, [user, isSuperadmin, roleLoading, authLoading, navigate]);

  async function load() {
    const [{ data: p }, { data: g }, { data: m }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, primary_email").order("full_name"),
      supabase.from("groups").select("*").order("created_at", { ascending: false }),
      supabase.from("group_members").select("id, group_id, user_id"),
    ]);
    setProfiles((p ?? []) as Profile[]);
    setGroups((g ?? []) as Group[]);
    setMembers((m ?? []) as Member[]);
    setLoaded(true);
  }

  async function uploadCover(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `groups/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("covers").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (upErr) {
      toast.error(upErr.message);
      return null;
    }
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    return data.publicUrl;
  }

  async function createGroup() {
    if (!newName.trim()) return toast.error("Nome obrigatório");
    if (!user) return;
    setCreating(true);
    let cover_url: string | null = null;
    if (newCoverFile) {
      cover_url = await uploadCover(newCoverFile);
      if (!cover_url) {
        setCreating(false);
        return;
      }
    }
    const { error } = await supabase.from("groups").insert({
      name: newName.trim(),
      description: newDesc.trim(),
      address: newAddress.trim(),
      admin_id: newAdminId || null,
      created_by: user.id,
      cover_url,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Empresa criada");
    setNewName(""); setNewDesc(""); setNewAddress(""); setNewAdminId(""); setNewCoverFile(null);
    if (newCoverInputRef.current) newCoverInputRef.current.value = "";
    await load();
  }

  async function changeGroupCover(groupId: string, file: File) {
    setUploadingCoverId(groupId);
    const url = await uploadCover(file);
    if (!url) {
      setUploadingCoverId(null);
      return;
    }
    const { error } = await supabase.from("groups").update({ cover_url: url }).eq("id", groupId);
    setUploadingCoverId(null);
    if (error) return toast.error(error.message);
    toast.success("Capa atualizada (sincronizada com membros)");
    await load();
  }

  async function confirmDeleteGroup() {
    if (!deleteGroupTarget) return;
    const id = deleteGroupTarget.id;
    const { error } = await supabase.from("groups").delete().eq("id", id);
    setDeleteGroupTarget(null);
    if (error) return toast.error(error.message);
    toast.success("Empresa apagada");
    await load();
  }

  async function setAdmin(groupId: string, adminId: string) {
    const { error } = await supabase
      .from("groups")
      .update({ admin_id: adminId || null })
      .eq("id", groupId);
    if (error) return toast.error(error.message);
    toast.success("Admin atualizado");
    await load();
  }

  function openEdit(g: Group) {
    setEditDialog(g);
    setEditName(g.name);
    setEditDesc(g.description ?? "");
    setEditAddress(g.address ?? "");
  }

  async function saveEdit() {
    if (!editDialog) return;
    if (!editName.trim()) return toast.error("Nome obrigatório");
    setSavingEdit(true);
    const { error } = await supabase
      .from("groups")
      .update({ name: editName.trim(), description: editDesc.trim(), address: editAddress.trim() })
      .eq("id", editDialog.id);
    setSavingEdit(false);
    if (error) return toast.error(error.message);
    toast.success("Empresa atualizada");
    setEditDialog(null);
    await load();
  }

  async function addMember() {
    if (!memberDialog || !selectedUserId) return;
    const { error } = await supabase
      .from("group_members")
      .insert({ group_id: memberDialog.id, user_id: selectedUserId });
    if (error) return toast.error(error.message);
    toast.success("Membro adicionado");
    setSelectedUserId("");
    await load();
  }

  async function confirmRemoveMember() {
    if (!removeMemberTarget) return;
    const { error } = await supabase.from("group_members").delete().eq("id", removeMemberTarget.memberId);
    setRemoveMemberTarget(null);
    if (error) return toast.error(error.message);
    toast.success("Membro removido");
    await load();
  }

  if (authLoading || roleLoading || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const profileById = (id: string | null) => profiles.find((p) => p.id === id);
  const groupMembers = (gid: string) => members.filter((m) => m.group_id === gid);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">{groups.length} empresa(s) no sistema</p>
        </div>

        {/* Criar grupo */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" /> Criar nova empresa
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Nome da empresa" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Descrição (opcional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          </div>
          <Input placeholder="Endereço (opcional) — será aplicado aos membros" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} maxLength={200} />
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4" /> Foto de capa
            </label>
            <input
              ref={newCoverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setNewCoverFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-secondary/80"
            />
            {newCoverFile && (
              <p className="text-xs text-muted-foreground mt-1">{newCoverFile.name}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Select value={newAdminId} onValueChange={setNewAdminId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Definir admin da empresa (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name || p.primary_email || p.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={createGroup} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
            </Button>
          </div>
        </div>

        {/* Lista de grupos */}
        <div className="space-y-4">
          {groups.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Ainda não há empresas.</p>
          )}
          {groups.map((g) => {
            const admin = profileById(g.admin_id);
            const gm = groupMembers(g.id);
            return (
              <div key={g.id} className="rounded-lg border bg-card overflow-hidden">
                <div className="relative h-32 bg-muted">
                  {g.cover_url ? (
                    <img src={g.cover_url} alt={g.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      Sem foto de capa
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void changeGroupCover(g.id, f);
                        e.target.value = "";
                      }}
                    />
                    <span className="inline-flex items-center gap-1 bg-background/90 backdrop-blur px-3 py-1.5 rounded-md text-xs font-medium border hover:bg-background">
                      {uploadingCoverId === g.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      {g.cover_url ? "Alterar capa" : "Carregar capa"}
                    </span>
                  </label>
                </div>
                <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{g.name}</h3>
                    {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{gm.length} membro(s)</Badge>
                      {admin ? (
                        <Badge variant="default">Admin: {admin.full_name || admin.primary_email}</Badge>
                      ) : (
                        <Badge variant="outline">Sem admin</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(g)} title="Editar dados">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteGroupTarget(g)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={g.admin_id ?? ""} onValueChange={(v) => setAdmin(g.id, v)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Definir/alterar admin" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name || p.primary_email || p.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Dialog
                    open={memberDialog?.id === g.id}
                    onOpenChange={(open) => setMemberDialog(open ? g : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" /> Gerir membros
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{g.name} — membros</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecionar utilizador" />
                            </SelectTrigger>
                            <SelectContent>
                              {profiles
                                .filter((p) => !gm.some((m) => m.user_id === p.id))
                                .map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.full_name || p.primary_email || p.id.slice(0, 8)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button onClick={addMember} disabled={!selectedUserId}>
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-72 overflow-y-auto">
                          {gm.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Sem membros</p>
                          )}
                          {gm.map((m) => {
                            const mp = profileById(m.user_id);
                            return (
                              <div key={m.id} className="flex items-center justify-between p-2 rounded border">
                                <div className="text-sm">
                                  <div className="font-medium">{mp?.full_name || "(sem nome)"}</div>
                                  <div className="text-xs text-muted-foreground">{mp?.primary_email}</div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => setRemoveMemberTarget({ memberId: m.id, name: mp?.full_name || mp?.primary_email || "" })}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setMemberDialog(null)}>Fechar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={!!editDialog} onOpenChange={(o) => !o && setEditDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar empresa</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium">Endereço</label>
                <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} maxLength={200} />
                <p className="text-xs text-muted-foreground mt-1">Será aplicado automaticamente a todos os membros (podem alterar no perfil).</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(null)}>Cancelar</Button>
              <Button onClick={saveEdit} disabled={savingEdit}>
                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteGroupTarget} onOpenChange={(o) => !o && setDeleteGroupTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apagar empresa?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteGroupTarget?.name} será permanentemente eliminada. Esta ação não pode ser revertida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteGroup}>Apagar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!removeMemberTarget} onOpenChange={(o) => !o && setRemoveMemberTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover membro?</AlertDialogTitle>
              <AlertDialogDescription>
                {removeMemberTarget?.name} será removido(a) da empresa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRemoveMember}>Remover</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Pencil, Save, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/my-group")({
  head: () => ({ meta: [{ title: "Minha empresa" }] }),
  component: MyGroupPage,
});

type Group = { id: string; name: string; description: string; address: string; cover_url: string | null };
type ProfileRow = {
  id: string;
  full_name: string;
  primary_email: string;
  job_title: string;
  mobile_phone: string;
};

function MyGroupPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [membersByGroup, setMembersByGroup] = useState<Record<string, ProfileRow[]>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: gs } = await supabase
        .from("groups")
        .select("id, name, description, address, cover_url")
        .eq("admin_id", user.id);
      const list = (gs ?? []) as Group[];
      setGroups(list);

      if (list.length > 0) {
        const { data: gm } = await supabase
          .from("group_members")
          .select("group_id, user_id")
          .in("group_id", list.map((g) => g.id));
        const userIds = Array.from(new Set((gm ?? []).map((m) => m.user_id)));
        const { data: profs } = userIds.length
          ? await supabase
              .from("profiles")
              .select("id, full_name, primary_email, job_title, mobile_phone")
              .in("id", userIds)
          : { data: [] };
        const byId: Record<string, ProfileRow> = {};
        ((profs ?? []) as ProfileRow[]).forEach((p) => { byId[p.id] = p; });
        const map: Record<string, ProfileRow[]> = {};
        list.forEach((g) => { map[g.id] = []; });
        (gm ?? []).forEach((m) => {
          const prof = byId[m.user_id];
          if (prof) map[m.group_id].push(prof);
        });
        setMembersByGroup(map);
      }
      setLoaded(true);
    })();
  }, [user]);

  if (authLoading || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-end">
          <Badge variant="default" className="gap-1">
            <Users className="h-3 w-3" /> Admin de empresa
          </Badge>
        </div>

        <div>
          <h1 className="text-3xl font-bold">A minha empresa</h1>
          <p className="text-muted-foreground">
            {groups.length === 0 ? "Não administra nenhuma empresa." : "Gerir as informações da empresa que administra."}
          </p>
        </div>

        {groups.map((g) => {
          const ms = membersByGroup[g.id] ?? [];
          return (
            <div key={g.id} className="rounded-lg border bg-card overflow-hidden">
              <GroupHeader
                group={g}
                membersCount={ms.length}
                onUpdated={(updated) =>
                  setGroups((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                }
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Sem membros
                      </TableCell>
                    </TableRow>
                  )}
                  {ms.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.full_name || "(sem nome)"}</TableCell>
                      <TableCell className="text-muted-foreground">{m.primary_email || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{m.job_title || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{m.mobile_phone || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GroupHeader({
  group,
  membersCount,
  onUpdated,
}: {
  group: Group;
  membersCount: number;
  onUpdated: (g: Group) => void;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [address, setAddress] = useState(group.address ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("groups")
      .update({ name: name.trim(), description: description.trim(), address: address.trim() })
      .eq("id", group.id)
      .select("id, name, description, address, cover_url")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    onUpdated(data as Group);
    setEditing(false);
    toast.success("Empresa atualizada (endereço sincronizado com membros)");
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um ficheiro de imagem");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem demasiado grande (máx 5MB)");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/group-${group.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("covers")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("covers").getPublicUrl(path);
    const { data, error } = await supabase
      .from("groups")
      .update({ cover_url: pub.publicUrl })
      .eq("id", group.id)
      .select("id, name, description, address, cover_url")
      .single();
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    onUpdated(data as Group);
    toast.success("Capa atualizada");
  }

  return (
    <div className="border-b">
      <div className="relative h-40 bg-muted">
        {group.cover_url ? (
          <img src={group.cover_url} alt={`Capa de ${group.name}`} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            Sem capa
          </div>
        )}
        <label className="absolute bottom-2 right-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
            disabled={uploading}
          />
          <Button size="sm" variant="secondary" asChild disabled={uploading}>
            <span className="cursor-pointer">
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4 mr-1" />
              )}
              {group.cover_url ? "Alterar capa" : "Adicionar capa"}
            </span>
          </Button>
        </label>
      </div>

      {editing ? (
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`name_${group.id}`}>Nome</Label>
            <Input id={`name_${group.id}`} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`desc_${group.id}`}>Descrição</Label>
            <Textarea
              id={`desc_${group.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`addr_${group.id}`}>Endereço</Label>
            <Input
              id={`addr_${group.id}`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={200}
              placeholder="Ex: Rua Exemplo 123, 1000-000 Lisboa"
            />
            <p className="text-xs text-muted-foreground">
              Aplicado automaticamente a todos os membros. Cada membro pode alterar no seu perfil.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> Guardar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setName(group.name);
                setDescription(group.description);
                setAddress(group.address ?? "");
                setEditing(false);
              }}
            >
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{group.name}</h2>
            {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
            {group.address && <p className="text-sm text-muted-foreground mt-1">📍 {group.address}</p>}
            <p className="text-xs text-muted-foreground mt-1">{membersCount} membro(s)</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
        </div>
      )}
    </div>
  );
}

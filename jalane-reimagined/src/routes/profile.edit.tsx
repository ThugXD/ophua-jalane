import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, Save, ArrowLeft, Mail, Phone, MapPin, Building2, User, Shuffle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/PhoneInput";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({ meta: [{ title: "Editar perfil" }] }),
  component: ProfileEditPage,
});

const schema = z.object({
  full_name: z.string().trim().min(1).max(100),
  job_title: z.string().trim().max(120).default(""),
  company: z.string().trim().max(120).default(""),
  address: z.string().trim().max(200).default(""),
  primary_email: z.union([z.literal(""), z.string().email().max(255)]).default(""),
  secondary_email: z.union([z.literal(""), z.string().email().max(255)]).default(""),
  mobile_phone: z.string().trim().max(40).default(""),
  work_phone: z.string().trim().max(40).default(""),
});

type FormState = z.infer<typeof schema>;

const empty: FormState = {
  full_name: "",
  job_title: "",
  company: "",
  address: "",
  primary_email: "",
  secondary_email: "",
  mobile_phone: "",
  work_phone: "",
};

function ProfileEditPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const [groupCompany, setGroupCompany] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) toast.error(error.message);

      // Check if user is associated with a company (group)
      const { data: membership } = await supabase
        .from("group_members")
        .select("group_id, groups(name)")
        .eq("user_id", user.id)
        .maybeSingle();
      const companyFromGroup = (membership?.groups as { name?: string } | null)?.name ?? null;
      setGroupCompany(companyFromGroup);

      if (data) {
        setForm({
          full_name: data.full_name ?? "",
          job_title: data.job_title ?? "",
          company: companyFromGroup ?? data.company ?? "",
          address: data.address ?? "",
          primary_email: data.primary_email ?? "",
          secondary_email: data.secondary_email ?? "",
          mobile_phone: data.mobile_phone ?? "",
          work_phone: data.work_phone ?? "",
        });
        setAvatarUrl(data.avatar_url);
        setCoverUrl(data.cover_url);
      }
      setLoaded(true);
    })();
  }, [user]);

  const upload = async (bucket: "avatars" | "covers", file: File) => {
    if (!user) return null;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo maior que 5MB");
      return null;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens");
      return null;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const url = await upload("avatars", file);
    if (url) {
      setAvatarUrl(url);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      if (error) return toast.error(error.message);
      toast.success("Foto atualizada");
    }
  };

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const url = await upload("covers", file);
    if (url) {
      setCoverUrl(url);
      const { error } = await supabase
        .from("profiles")
        .update({ cover_url: url })
        .eq("id", user.id);
      if (error) return toast.error(error.message);
      toast.success("Capa atualizada");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...parsed.data, avatar_url: avatarUrl, cover_url: coverUrl })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil salvo");
    navigate({ to: "/profile" });
  };

  if (loading || !user || !loaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </main>
    );
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Voltar ao perfil
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-6">Editar perfil</h1>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="relative">
              <button
                type="button"
                onClick={() => coverInput.current?.click()}
                className="block w-full aspect-[2/1] rounded-xl overflow-hidden bg-muted border border-border hover:opacity-90 transition group"
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    <Upload className="h-5 w-5 mr-2" /> Adicionar capa
                  </div>
                )}
              </button>
              <input ref={coverInput} type="file" accept="image/*" hidden onChange={handleCover} />

              <button
                type="button"
                onClick={() => avatarInput.current?.click()}
                className="absolute left-1/2 -bottom-10 -translate-x-1/2 w-20 h-20 rounded-2xl overflow-hidden border-4 border-card bg-muted hover:opacity-90 transition"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Upload className="h-4 w-4" />
                  </div>
                )}
              </button>
              <input ref={avatarInput} type="file" accept="image/*" hidden onChange={handleAvatar} />
            </div>

            <form onSubmit={onSubmit} className="pt-14 space-y-4">
              <Field label="Nome completo" id="full_name" value={form.full_name} onChange={(v) => set("full_name", v)} maxLength={100} required />
              <Field label="Cargo" id="job_title" value={form.job_title} onChange={(v) => set("job_title", v)} maxLength={120} />
              <Field
                label="Empresa"
                id="company"
                value={form.company}
                onChange={(v) => set("company", v)}
                maxLength={120}
                disabled={!!groupCompany}
                hint={groupCompany ? "Definida automaticamente pela empresa associada" : undefined}
              />
              <Field label="Endereço" id="address" value={form.address} onChange={(v) => set("address", v)} maxLength={200} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email principal" id="primary_email" type="email" value={form.primary_email} onChange={(v) => set("primary_email", v)} maxLength={255} />
                <Field label="Email secundário" id="secondary_email" type="email" value={form.secondary_email} onChange={(v) => set("secondary_email", v)} maxLength={255} />
                <div className="space-y-2">
                  <Label htmlFor="mobile_phone">Celular</Label>
                  <PhoneInput id="mobile_phone" value={form.mobile_phone} onChange={(v) => set("mobile_phone", v)} maxLength={40} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_phone">Telefone de trabalho</Label>
                  <PhoneInput id="work_phone" value={form.work_phone} onChange={(v) => set("work_phone", v)} maxLength={40} />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </div>
        </div>

        <aside className="hidden lg:block w-[340px] shrink-0">
          <div className="sticky top-8">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3 text-center">Pré-visualização</p>
            <PhonePreview form={form} avatarUrl={avatarUrl} coverUrl={coverUrl} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function PhonePreview({
  form, avatarUrl, coverUrl,
}: {
  form: FormState; avatarUrl: string | null; coverUrl: string | null;
}) {
  const contacts = [
    form.primary_email && { label: "Primary email", value: form.primary_email, icon: Mail },
    form.secondary_email && { label: "Secondary email", value: form.secondary_email, icon: Mail },
    form.mobile_phone && { label: "Mobile phone", value: form.mobile_phone, icon: Phone },
    form.work_phone && { label: "Work phone", value: form.work_phone, icon: Phone },
  ].filter(Boolean) as { label: string; value: string; icon: typeof Mail }[];

  return (
    <div className="mx-auto w-[300px] h-[620px] rounded-[44px] border-[10px] border-foreground/90 bg-background shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-foreground/90 rounded-b-2xl z-20" />
      <div className="h-full overflow-y-auto">
        <div className="relative">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="w-full aspect-[2/1] object-cover" />
          ) : (
            <div className="w-full aspect-[2/1] bg-muted" />
          )}
          <div className="absolute left-1/2 -bottom-8 -translate-x-1/2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-16 h-16 rounded-2xl border-4 border-background object-cover bg-muted shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-2xl border-4 border-background bg-muted shadow-lg flex items-center justify-center text-muted-foreground">
                <User className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pt-12 pb-4 text-center">
          <h2 className="text-lg font-bold text-foreground break-words">{form.full_name || "Seu nome"}</h2>
          {form.job_title && <p className="mt-0.5 text-xs font-semibold text-muted-foreground break-words">{form.job_title}</p>}
          {form.company && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" /> {form.company}
            </p>
          )}
          {form.address && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground break-words">
              <MapPin className="h-3 w-3" /> {form.address}
            </p>
          )}
        </div>

        <div className="px-3 space-y-2 pb-6">
          <div className="flex gap-1.5">
            <div className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground font-semibold py-2.5 text-[11px]">
              <Shuffle className="h-3.5 w-3.5" /> Exchange contact
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground font-semibold py-2.5 text-[11px]">
              <Download className="h-3.5 w-3.5" /> Save contact
            </div>
          </div>
          {contacts.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="flex items-center gap-2 w-full rounded-full bg-primary text-primary-foreground py-2 px-3">
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
                <div className="text-left leading-tight min-w-0">
                  <div className="text-[9px] opacity-80">{c.label}</div>
                  <div className="text-[11px] font-medium truncate">{c.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({
  label, id, value, onChange, type = "text", maxLength, required, disabled, hint,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; required?: boolean; disabled?: boolean; hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} maxLength={maxLength} required={required} disabled={disabled}
        onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Shuffle, LogIn, Building2, User, Download } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import cover from "@/assets/cover.jpg";
import avatar from "@/assets/avatar.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/PhoneInput";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trackProfileView, trackProfileClick } from "@/lib/tracking";
import { tr } from "@/i18n/translations";
import type { Lang } from "@/hooks/useLang";

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
  card_lang: Lang;
};


type Props = {
  /** If provided, loads this specific profile; otherwise loads logged-in user's, or latest. */
  profileId?: string;
};

export function ProfileCard({ profileId }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [p, setP] = useState<Profile | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [avatarPhoto, setAvatarPhoto] = useState<{ b64: string; type: string } | null>(null);

  useEffect(() => {
    // Only wait for auth when there is no explicit profileId (home route).
    if (!profileId && authLoading) return;

    let cancelled = false;
    (async () => {
      const targetId = profileId ?? user?.id ?? null;
      if (!targetId) {
        setP(null);
        setOwnerId(null);
        setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, job_title, company, address, primary_email, secondary_email, mobile_phone, work_phone, avatar_url, cover_url, card_lang")
        .eq("id", targetId)
        .maybeSingle();
      if (cancelled) return;
      if (data && data.full_name) {
        setOwnerId(data.id);
        const cl = (data as { card_lang?: string }).card_lang === "en" ? "en" : "pt";
        setP({
          full_name: data.full_name,
          job_title: data.job_title,
          company: data.company,
          address: data.address,
          primary_email: data.primary_email,
          secondary_email: data.secondary_email,
          mobile_phone: data.mobile_phone,
          work_phone: data.work_phone,
          avatar_url: data.avatar_url,
          cover_url: data.cover_url,
          card_lang: cl,
        });
        trackProfileView(data.id);
      } else {
        setP(null);
        setOwnerId(null);
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, authLoading, profileId]);

  useEffect(() => {
    let cancelled = false;
    if (!p?.avatar_url) {
      setAvatarPhoto(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch(p.avatar_url!);
        const blob = await res.blob();
        const mime = blob.type || "image/jpeg";
        const type = mime.includes("png") ? "PNG" : mime.includes("gif") ? "GIF" : "JPEG";
        const buf = await blob.arrayBuffer();
        let binary = "";
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const b64 = btoa(binary);
        if (!cancelled) setAvatarPhoto({ b64, type });
      } catch {
        if (!cancelled) setAvatarPhoto(null);
      }
    })();
    return () => { cancelled = true; };
  }, [p?.avatar_url]);

  if (!loaded) {
    return <main className="min-h-screen bg-background" />;
  }

  if (!p) {
    const fallbackLang: Lang = "pt";
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <ThemeToggle />
        <h1 className="text-2xl font-bold text-foreground">{tr(fallbackLang, "card_unavailable_title")}</h1>
        <p className="text-muted-foreground max-w-md">
          {profileId ? tr(fallbackLang, "card_unavailable_desc") : tr(fallbackLang, "card_login_to_view")}
        </p>
        {!profileId && (
          <Link
            to="/auth"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium"
          >
            <LogIn className="h-4 w-4" /> Entrar
          </Link>
        )}
      </main>
    );
  }

  const cl: Lang = p.card_lang;
  const labels = {
    secondary_email: cl === "pt" ? "Email secundário" : "Secondary email",
    primary_email: cl === "pt" ? "Email principal" : "Primary email",
    mobile_phone: cl === "pt" ? "Celular" : "Mobile phone",
    work_phone: cl === "pt" ? "Telefone de trabalho" : "Work phone",
  };
  const contacts = [
    p.primary_email && { label: labels.primary_email, value: p.primary_email, href: `mailto:${p.primary_email}`, icon: Mail },
    p.secondary_email && { label: labels.secondary_email, value: p.secondary_email, href: `mailto:${p.secondary_email}`, icon: Mail },
    p.mobile_phone && { label: labels.mobile_phone, value: p.mobile_phone, href: `tel:${p.mobile_phone.replace(/\s+/g, "")}`, icon: Phone },
    p.work_phone && { label: labels.work_phone, value: p.work_phone, href: `tel:${p.work_phone.replace(/\s+/g, "")}`, icon: Phone },
  ].filter(Boolean) as { label: string; value: string; href: string; icon: typeof Mail }[];

  const photoLine = avatarPhoto
    ? `\nPHOTO;ENCODING=b;TYPE=${avatarPhoto.type}:${avatarPhoto.b64}`
    : "";
  const nameParts = p.full_name.trim().split(/\s+/);
  const givenName = nameParts.shift() ?? "";
  const familyName = nameParts.join(" ");
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${p.full_name}\nN:${familyName};${givenName};;;\nORG:${p.company}\nTITLE:${p.job_title}\nEMAIL;TYPE=WORK:${p.primary_email}\nEMAIL;TYPE=HOME:${p.secondary_email}\nTEL;TYPE=CELL:${p.mobile_phone}\nTEL;TYPE=WORK:${p.work_phone}\nADR;TYPE=WORK:;;${p.address};;;;${photoLine}\nEND:VCARD`;
  const vcardHref = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <ThemeToggle />

      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col">
        <div className="relative">
          <img
            src={p.cover_url || cover}
            alt="Capa"
            width={1536}
            height={768}
            className="w-full aspect-[2/1] object-cover"
          />
          <div className="absolute left-1/2 -bottom-12 -translate-x-1/2">
            {p.avatar_url ? (
              <img
                src={p.avatar_url}
                alt={p.full_name}
                width={512}
                height={512}
                loading="lazy"
                className="w-24 h-24 rounded-2xl border-4 border-background object-cover bg-muted shadow-lg"
              />
            ) : (
              <div
                aria-label={p.full_name}
                className="w-24 h-24 rounded-2xl border-4 border-background bg-muted shadow-lg flex items-center justify-center text-muted-foreground"
              >
                <User className="h-12 w-12" />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-16 pb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">{p.full_name}</h1>
          {p.job_title && <p className="mt-1 text-base font-semibold text-muted-foreground">{p.job_title}</p>}
          {p.company && (
            <div className="mt-1 flex justify-center">
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {p.company}
              </p>
            </div>
          )}
          {p.address && (
            <div className="mt-3 flex justify-center">
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {p.address}
              </p>
            </div>
          )}
        </div>

        <div className="px-4 space-y-3 pb-10">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (ownerId) trackProfileClick(ownerId, "exchange_contact");
                setExchangeOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold py-4 shadow-md hover:opacity-95 transition"
            >
              <Shuffle className="h-5 w-5" />
              {tr(cl, "card_exchange_contact")}
            </button>
            <a
              href={vcardHref}
              download={`${p.full_name.replace(/\s+/g, "-").toLowerCase()}.vcf`}
              onClick={() => { if (ownerId) trackProfileClick(ownerId, "save_contact"); }}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold py-4 shadow-md hover:opacity-95 transition"
            >
              <Download className="h-5 w-5" />
              {tr(cl, "card_save_contact")}
            </a>
          </div>

          {contacts.map((c) => {
            const Icon = c.icon;
            const type = c.href.startsWith("mailto:") ? "email" : c.href.startsWith("tel:") ? "phone" : "link";
            return (
              <a
                key={c.label}
                href={c.href}
                onClick={() => { if (ownerId) trackProfileClick(ownerId, `${type}:${c.label}`); }}
                className="flex items-center gap-4 w-full rounded-full bg-primary text-primary-foreground py-3.5 px-5 shadow-md hover:opacity-95 transition"
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" />
                <div className="text-left leading-tight">
                  <div className="text-xs opacity-80">{c.label}</div>
                  <div className="text-base font-medium">{c.value}</div>
                </div>
              </a>
            );
          })}
        </div>

        <footer className="mt-auto py-8 text-center space-y-3">
          <div className="text-2xl font-black tracking-tight text-foreground">OPHUA</div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Link to={user ? "/profile" : "/auth"} className="hover:text-foreground hover:underline">
              {tr(cl, "card_dashboard")}
            </Link>
            <span aria-hidden>•</span>
            <Link to="/terms" className="hover:text-foreground hover:underline">
              {tr(cl, "card_terms")}
            </Link>
            <span aria-hidden>•</span>
            <Link to="/privacy" className="hover:text-foreground hover:underline">
              {tr(cl, "card_privacy")}
            </Link>
          </nav>
        </footer>
      </div>

      <ExchangeContactDialog
        open={exchangeOpen}
        onOpenChange={setExchangeOpen}
        ownerId={ownerId}
        ownerName={p.full_name}
        vcardHref={vcardHref}
        vcardFilename={`${p.full_name.replace(/\s+/g, "-").toLowerCase()}.vcf`}
        cardLang={cl}
      />
    </main>
  );
}

const exchangeSchema = z.object({
  full_name: z.string().trim().min(1, "Nome obrigatório").max(100),
  email: z.union([z.literal(""), z.string().email().max(255)]),
  phone: z.string().trim().min(1, "Telefone obrigatório").max(40),
  company: z.string().trim().max(120),
  job_title: z.string().trim().max(120),
  message: z.string().trim().max(500),
});

function ExchangeContactDialog({
  open, onOpenChange, ownerId, ownerName, vcardHref, vcardFilename, cardLang,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ownerId: string | null;
  ownerName: string;
  vcardHref: string;
  vcardFilename: string;
  cardLang: Lang;
}) {
  const cl = cardLang;
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", company: "", job_title: "", message: "" });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerId) return toast.error(tr(cl, "card_unavailable_toast"));
    const parsed = exchangeSchema.safeParse(form);
    if (!parsed.success) return toast.error(tr(cl, "card_name_required"));
    setSaving(true);
    const { error } = await supabase.from("contact_exchanges").insert({
      owner_id: ownerId,
      ...parsed.data,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(tr(cl, "card_shared_toast"));
    const a = document.createElement("a");
    a.href = vcardHref;
    a.download = vcardFilename;
    a.click();
    setForm({ full_name: "", email: "", phone: "", company: "", job_title: "", message: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tr(cl, "card_dialog_title").replace("{name}", ownerName)}</DialogTitle>
          <DialogDescription>
            {tr(cl, "card_dialog_desc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ex_name">{tr(cl, "card_field_name")} *</Label>
            <Input id="ex_name" value={form.full_name} maxLength={100} required
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ex_email">{tr(cl, "card_field_email")}</Label>
              <Input id="ex_email" type="email" value={form.email} maxLength={255}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex_phone">{tr(cl, "card_field_phone")} *</Label>
              <PhoneInput id="ex_phone" value={form.phone} maxLength={40}
                onChange={(v) => setForm({ ...form, phone: v })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ex_company">{tr(cl, "card_field_company")}</Label>
              <Input id="ex_company" value={form.company} maxLength={120}
                onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex_job">{tr(cl, "card_field_job")}</Label>
              <Input id="ex_job" value={form.job_title} maxLength={120}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex_msg">{tr(cl, "card_field_message")}</Label>
            <Textarea id="ex_msg" value={form.message} maxLength={500} rows={3}
              onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {tr(cl, "card_cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? tr(cl, "card_sending") : tr(cl, "card_submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

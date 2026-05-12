import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Download, Loader2, Trash2, Pencil, ScanLine, Eye, Mail, Phone, Building2, Briefcase, StickyNote, Calendar as CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { pt as ptLocale, enUS } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BusinessCardScanner } from "@/components/BusinessCardScanner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/PhoneInput";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useT } from "@/hooks/useT";

export const Route = createFileRoute("/contacts")({
  head: () => ({ meta: [{ title: "Contactos" }] }),
  component: ContactsPage,
});

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  notes: string | null;
  created_at: string;
  source: "manual" | "received";
};

const emptyForm = { name: "", email: "", phone: "", company: "", job_title: "", notes: "" };

function ContactsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [viewing, setViewing] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const inName = (c.name || "").toLowerCase().includes(q);
      const inCompany = (c.company || "").toLowerCase().includes(q);
      if (!inName && !inCompany) return false;
    }
    if (dateRange?.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      if (new Date(c.created_at).getTime() < from.getTime()) return false;
    }
    if (dateRange?.to) {
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);
      if (new Date(c.created_at).getTime() > to.getTime()) return false;
    }
    return true;
  });

  const hasFilters = searchQuery !== "" || !!dateRange?.from || !!dateRange?.to;

  function handleScanned(data: { name: string; email: string; phone: string; company: string; job_title: string; notes: string }) {
    setEditingId(null);
    setForm({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      company: data.company || "",
      job_title: data.job_title || "",
      notes: data.notes || "",
    });
    setOpen(true);
  }

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  async function load() {
    const [{ data: own, error: e1 }, { data: received, error: e2 }] = await Promise.all([
      supabase
        .from("contacts")
        .select("id, name, email, phone, company, job_title, notes, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("contact_exchanges")
        .select("id, full_name, email, phone, company, job_title, message, created_at")
        .order("created_at", { ascending: false }),
    ]);
    if (e1) toast.error(e1.message);
    if (e2) toast.error(e2.message);

    const ownList: Contact[] = ((own ?? []) as Array<Omit<Contact, "source">>).map((c) => ({
      ...c,
      source: "manual",
    }));
    const receivedList: Contact[] = ((received ?? []) as Array<{
      id: string; full_name: string; email: string; phone: string;
      company: string; job_title: string; message: string; created_at: string;
    }>).map((r) => ({
      id: r.id,
      name: r.full_name,
      email: r.email || null,
      phone: r.phone || null,
      company: r.company || null,
      job_title: r.job_title || null,
      notes: r.message || null,
      created_at: r.created_at,
      source: "received",
    }));

    const merged = [...ownList, ...receivedList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    setContacts(merged);
    setLoaded(true);
  }

  async function saveContact(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) return toast.error(t("name_required"));
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      job_title: form.job_title.trim() || null,
      notes: form.notes.trim() || null,
    };
    const { error } = editingId
      ? await supabase.from("contacts").update(payload).eq("id", editingId)
      : await supabase.from("contacts").insert({ user_id: user.id, ...payload });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? t("contact_updated") : t("contact_created"));
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
    void load();
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(c: Contact) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      company: c.company ?? "",
      job_title: c.job_title ?? "",
      notes: c.notes ?? "",
    });
    setOpen(true);
  }

  async function confirmRemoveContact() {
    const c = deleteTarget;
    if (!c) return;
    const table = c.source === "received" ? "contact_exchanges" : "contacts";
    const { error } = await supabase.from(table).delete().eq("id", c.id);
    setDeleteTarget(null);
    if (error) return toast.error(error.message);
    toast.success(t("contact_deleted"));
    void load();
  }

  async function exportCSV() {
    if (contacts.length === 0) return toast.error(t("no_contacts_export"));
    const XLSX = await import("xlsx");
    const locale = lang === "pt" ? "pt-PT" : "en-US";
    const headers = lang === "pt"
      ? { Nome: "Nome", Email: "Email", Telefone: "Telefone", Empresa: "Empresa", Cargo: "Cargo", Notas: "Notas", Created: "Criado em" }
      : { Nome: "Name", Email: "Email", Telefone: "Phone", Empresa: "Company", Cargo: "Job title", Notas: "Notes", Created: "Created at" };
    const rows = contacts.map((c) => ({
      [headers.Nome]: c.name ?? "",
      [headers.Email]: c.email ?? "",
      [headers.Telefone]: c.phone ?? "",
      [headers.Empresa]: c.company ?? "",
      [headers.Cargo]: c.job_title ?? "",
      [headers.Notas]: c.notes ?? "",
      [headers.Created]: new Date(c.created_at).toLocaleString(locale),
    }));
    const ws = XLSX.utils.json_to_sheet(rows, {
      header: [headers.Nome, headers.Email, headers.Telefone, headers.Empresa, headers.Cargo, headers.Notas, headers.Created],
    });
    ws["!cols"] = [
      { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 22 },
      { wch: 20 }, { wch: 40 }, { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, lang === "pt" ? "Contactos" : "Contacts");
    XLSX.writeFile(wb, `${lang === "pt" ? "contactos" : "contacts"}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(t("file_exported"));
  }

  if (authLoading || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">{t("contacts_title")}</h1>
              <p className="text-muted-foreground">
                {filteredContacts.length} / {contacts.length} {contacts.length === 1 ? t("contacts_count_one") : t("contacts_count_many")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" /> {t("export_excel")}
              </Button>
              <Button variant="outline" onClick={() => setScannerOpen(true)}>
                <ScanLine className="h-4 w-4 mr-2" /> {t("scan_card")}
              </Button>
              <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm(emptyForm); } }}>
                <DialogTrigger asChild>
                  <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" /> {t("create_contact")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? t("edit_contact") : t("new_contact")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={saveContact} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("name")} *</Label>
                      <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("email")}</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("phone")}</Label>
                        <PhoneInput id="phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="company">{t("company")}</Label>
                        <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job_title">{t("job_title")}</Label>
                        <Input id="job_title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">{t("notes")}</Label>
                      <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("cancel")}</Button>
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {t("save")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-3 flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1 min-w-0">
              <Label htmlFor="contact-search" className="text-xs text-muted-foreground">{t("search_name_company")}</Label>
              <div className="relative mt-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="contact-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_name_company")}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("date_from")} – {t("date_to")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-1 justify-start text-left font-normal w-[260px]",
                      !dateRange?.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM yyyy", { locale: lang === "pt" ? ptLocale : enUS })} –{" "}
                          {format(dateRange.to, "dd MMM yyyy", { locale: lang === "pt" ? ptLocale : enUS })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: lang === "pt" ? ptLocale : enUS })
                      )
                    ) : (
                      <span>{t("date_from")} – {t("date_to")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    initialFocus
                    locale={lang === "pt" ? ptLocale : enUS}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearchQuery(""); setDateRange(undefined); }}
                aria-label={t("clear_filters")}
              >
                <X className="h-4 w-4 mr-1" /> {t("clear_filters")}
              </Button>
            )}
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("phone")}</TableHead>
                  <TableHead>{t("company")}</TableHead>
                  <TableHead>{t("job_title")}</TableHead>
                  <TableHead>{t("source")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {t("no_contacts_yet")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((c) => (
                    <TableRow key={`${c.source}-${c.id}`}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.phone || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.company || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.job_title || "—"}</TableCell>
                      <TableCell>
                        <span className={c.source === "received"
                          ? "text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                          : "text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"}>
                          {c.source === "received" ? t("received") : t("manual")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setViewing(c)} aria-label={t("view_details")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {c.source === "manual" && (
                            <Button size="sm" variant="ghost" onClick={() => openEdit(c)} aria-label={t("edit")}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(c)} aria-label={t("delete")}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <BusinessCardScanner open={scannerOpen} onOpenChange={setScannerOpen} onExtracted={handleScanned} />

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("contact_details")}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{viewing.name}</h3>
                <span className={viewing.source === "received"
                  ? "inline-block mt-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  : "inline-block mt-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"}>
                  {viewing.source === "received" ? t("received") : t("manual")}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <DetailRow icon={<Mail className="h-4 w-4" />} label={t("email")} value={viewing.email} href={viewing.email ? `mailto:${viewing.email}` : undefined} />
                <DetailRow icon={<Phone className="h-4 w-4" />} label={t("phone")} value={viewing.phone} href={viewing.phone ? `tel:${viewing.phone}` : undefined} />
                <DetailRow icon={<Building2 className="h-4 w-4" />} label={t("company")} value={viewing.company} />
                <DetailRow icon={<Briefcase className="h-4 w-4" />} label={t("job_title")} value={viewing.job_title} />
                <DetailRow icon={<CalendarIcon className="h-4 w-4" />} label={t("created_at")} value={new Date(viewing.created_at).toLocaleString(lang === "pt" ? "pt-PT" : "en-US")} />
                {viewing.notes && (
                  <div className="flex gap-2 pt-2 border-t">
                    <StickyNote className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">{t("notes")}</div>
                      <p className="whitespace-pre-wrap">{viewing.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>{t("close")}</Button>
            {viewing?.source === "manual" && (
              <Button onClick={() => { const c = viewing; setViewing(null); openEdit(c); }}>
                <Pencil className="h-4 w-4 mr-2" /> {t("edit")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveContact}>{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DetailRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string | null; href?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        {value ? (
          href ? (
            <a href={href} className="text-primary hover:underline break-all">{value}</a>
          ) : (
            <div className="break-all">{value}</div>
          )
        ) : (
          <div className="text-muted-foreground">—</div>
        )}
      </div>
    </div>
  );
}

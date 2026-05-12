import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Globe, Palette, User as UserIcon, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteOwnAccount } from "@/server/account.functions";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useLang, type Lang } from "@/hooks/useLang";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { useT } from "@/hooks/useT";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Configurações" }] }),
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <SettingsPage />
      </div>
    </div>
  );
}

function SettingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useT();

  const [lang, setLang] = useLang();
  const [theme, setTheme] = useTheme();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [cardLang, setCardLang] = useState<Lang>("pt");
  const [savingCardLang, setSavingCardLang] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    supabase
      .from("profiles")
      .select("full_name, card_lang")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setCardLang((data as { card_lang?: string }).card_lang === "en" ? "en" : "pt");
        }
      });
  }, [user]);

  const changeCardLang = async (l: Lang) => {
    if (!user) return;
    setCardLang(l);
    setSavingCardLang(true);
    const { error } = await supabase.from("profiles").update({ card_lang: l } as never).eq("id", user.id);
    setSavingCardLang(false);
    if (error) toast.error(error.message);
    else toast.success(t("card_language_updated"));
  };

  const changeLang = (l: Lang) => {
    setLang(l);
    toast.success(l === "pt" ? "Idioma alterado para Português" : "Language changed to English");
  };

  const changeTheme = (th: Theme) => {
    setTheme(th);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) toast.error(error.message);
    else toast.success(t("profile_updated"));
  };

  const saveEmail = async () => {
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email });
    setSavingEmail(false);
    if (error) toast.error(error.message);
    else toast.success(t("email_verify_sent"));
  };

  const savePassword = async () => {
    if (!currentPassword) return toast.error("Confirme a palavra-passe atual");
    if (newPassword.length < 6) return toast.error(t("min_6_chars"));
    if (newPassword !== confirmPassword) return toast.error(t("passwords_dont_match"));
    setSavingPassword(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPassword,
    });
    if (signInError) {
      setSavingPassword(false);
      return toast.error("Palavra-passe atual incorreta");
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) toast.error(error.message);
    else {
      toast.success(t("password_updated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteOwnAccount();
      await supabase.auth.signOut();
      toast.success(t("account_deleted"));
      navigate({ to: "/auth" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("delete_error"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">{t("settings_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings_subtitle")}</p>
      </header>

      {/* Language */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">{t("language")}</h2>
        </div>
        <div className="inline-flex items-center rounded-full border border-border bg-background overflow-hidden text-xs font-semibold">
          <button
            onClick={() => changeLang("pt")}
            className={`px-4 py-2 ${lang === "pt" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Português
          </button>
          <button
            onClick={() => changeLang("en")}
            className={`px-4 py-2 ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            English
          </button>
        </div>
      </section>

      {/* Card Language */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">{t("card_language")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t("card_language_desc")}</p>
        <div className="inline-flex items-center rounded-full border border-border bg-background overflow-hidden text-xs font-semibold">
          <button
            disabled={savingCardLang}
            onClick={() => changeCardLang("pt")}
            className={`px-4 py-2 ${cardLang === "pt" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Português
          </button>
          <button
            disabled={savingCardLang}
            onClick={() => changeCardLang("en")}
            className={`px-4 py-2 ${cardLang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            English
          </button>
        </div>
      </section>

      {/* Theme */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">{t("theme")}</h2>
        </div>
        <div className="inline-flex items-center rounded-full border border-border bg-background overflow-hidden text-xs font-semibold">
          <button
            onClick={() => changeTheme("light")}
            className={`px-4 py-2 ${theme === "light" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t("light")}
          </button>
          <button
            onClick={() => changeTheme("dark")}
            className={`px-4 py-2 ${theme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t("dark")}
          </button>
        </div>
      </section>

      {/* Account Data */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">{t("account_data")}</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">{t("full_name")}</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <Button onClick={saveProfile} disabled={savingProfile}>
          {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t("save_name")}
        </Button>
      </section>

      {/* Login Data */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">{t("login_data")}</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <div className="flex gap-2">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={saveEmail} disabled={savingEmail || email === user.email}>
              {savingEmail && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("update")}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <Label>{t("change_password")}</Label>
          <Input
            type="password"
            placeholder="Palavra-passe atual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            type="password"
            placeholder={t("new_password")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder={t("confirm_new_password")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button onClick={savePassword} disabled={savingPassword}>
            {savingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("change_password")}
          </Button>
        </div>
      </section>

      {/* Delete Account */}
      <section className="bg-card border border-destructive/40 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-destructive" />
          <h2 className="font-semibold text-destructive">{t("delete_account")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t("delete_warning")}</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("delete_my_account")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("are_you_sure")}</AlertDialogTitle>
              <AlertDialogDescription>{t("delete_confirm_desc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("yes_delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}

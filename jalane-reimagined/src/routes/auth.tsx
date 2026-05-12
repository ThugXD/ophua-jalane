import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { publicSignupFn } from "@/server/public-signup.functions";
import { forgotPasswordFn } from "@/server/forgot-password.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import illustration from "@/assets/login-illustration.png";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar" }] }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);
const nameSchema = z.string().trim().min(1, "Informe seu nome").max(100);
const contactNameSchema = z.string().trim().min(1, "Informe o seu nome").max(100, "Máximo 100 caracteres");
const contactMessageSchema = z.string().trim().min(1, "Escreva uma mensagem").max(2000, "Máximo 2000 caracteres");
const contactEmailSchema = z.string().trim().email("Email inválido").max(255, "Máximo 255 caracteres");
const contactPhoneSchema = z.string().trim().min(6, "Contacto inválido").max(50, "Máximo 50 caracteres");

import { useLang } from "@/hooks/useLang";

const translations = {
  pt: {
    contactUs: "Contact Us",
    welcomeTitle: "Bem-vindo ao Ophua Business Card",
    welcomeSubtitle: "Portal de Administração",
    welcomeBack: "Bem-vindo de volta",
    loginAccount: "Entre na sua conta",
    tabLogin: "Entrar",
    tabSignup: "Criar conta",
    email: "Email",
    password: "Password",
    loginBtn: "Login",
    loggingIn: "A entrar...",
    forgot: "Esqueceu a password?",
    or: "OU",
    sso: "Login com SSO",
    firstName: "Nome",
    lastName: "Apelido",
    createBtn: "Criar conta",
    creating: "A criar...",
    contactTitle: "Contact Us",
    contactDesc: "Envie-nos uma mensagem e a nossa equipa entrará em contacto.",
    name: "Nome",
    phone: "Contacto",
    message: "Mensagem",
    cancel: "Cancelar",
    send: "Enviar",
    sending: "A enviar...",
  },
  en: {
    contactUs: "Contact Us",
    welcomeTitle: "Welcome to Ophua Business Card",
    welcomeSubtitle: "Management Admin Portal",
    welcomeBack: "Welcome Back",
    loginAccount: "Login Your Account",
    tabLogin: "Login",
    tabSignup: "Sign up",
    email: "Email",
    password: "Password",
    loginBtn: "Login",
    loggingIn: "Logging in...",
    forgot: "Forgot Password?",
    or: "OR",
    sso: "Login with SSO",
    firstName: "First name",
    lastName: "Last name",
    createBtn: "Create account",
    creating: "Creating...",
    contactTitle: "Contact Us",
    contactDesc: "Send us a message and our team will get back to you.",
    name: "Name",
    phone: "Phone",
    message: "Message",
    cancel: "Cancel",
    send: "Send",
    sending: "Sending...",
  },
} as const;

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [lang, setLang] = useLang();
  const t = translations[lang];

  const onContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = contactNameSchema.safeParse(contactName);
    const email = contactEmailSchema.safeParse(contactEmail);
    const phone = contactPhoneSchema.safeParse(contactPhone);
    const message = contactMessageSchema.safeParse(contactMessage);
    if (!name.success) return toast.error(name.error.issues[0].message);
    if (!email.success) return toast.error(email.error.issues[0].message);
    if (!phone.success) return toast.error(phone.error.issues[0].message);
    if (!message.success) return toast.error(message.error.issues[0].message);
    setContactBusy(true);
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name: name.data, email: email.data, phone: phone.data, message: message.data });
    setContactBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Mensagem enviada! Entraremos em contacto em breve.");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactMessage("");
    setContactOpen(false);
  };

  useEffect(() => {
    if (!loading && user) navigate({ to: "/profile" });
  }, [user, loading, navigate]);

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!email.success) return toast.error(email.error.issues[0].message);
    if (!password.success) return toast.error(password.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.data,
      password: password.data,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/profile" });
  };

  const onSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstName = nameSchema.safeParse(fd.get("first_name"));
    const lastName = nameSchema.safeParse(fd.get("last_name"));
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!firstName.success) return toast.error(firstName.error.issues[0].message);
    if (!lastName.success) return toast.error(lastName.error.issues[0].message);
    if (!email.success) return toast.error(email.error.issues[0].message);
    if (!password.success) return toast.error(password.error.issues[0].message);
    setBusy(true);
    try {
      await publicSignupFn({
        data: {
          email: email.data,
          password: password.data,
          full_name: `${firstName.data} ${lastName.data}`,
        },
      });
      setBusy(false);
      toast.success(
        lang === "pt"
          ? "Conta criada! Aguarde activação por um superadmin para poder entrar."
          : "Account created! Wait for a superadmin to activate it before signing in.",
      );
    } catch (err) {
      setBusy(false);
      const msg = err instanceof Error ? err.message : "Erro ao criar conta";
      return toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              OPHUA<span className="block text-[10px] font-semibold tracking-[0.3em] text-muted-foreground -mt-1">BUSINESS CARD</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border bg-background overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang("pt")}
                className={`px-3 py-1.5 transition-colors ${lang === "pt" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                aria-pressed={lang === "pt"}
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t.contactUs}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-2xl bg-card shadow-xl overflow-hidden grid md:grid-cols-2">
          {/* Left side */}
          <div className="hidden md:flex flex-col items-center justify-center bg-muted/60 p-10">
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-muted-foreground">{t.welcomeTitle}</p>
              <p className="text-lg font-semibold text-muted-foreground">{t.welcomeSubtitle}</p>
            </div>
            <img
              src={illustration}
              alt="Login illustration"
              width={1024}
              height={1024}
              loading="lazy"
              className="w-full max-w-sm h-auto"
            />
          </div>

          {/* Right side */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="self-start mb-6 inline-flex items-center rounded-full bg-primary text-primary-foreground px-6 py-2 text-sm font-medium">
              {t.welcomeBack}
            </div>

            <Tabs defaultValue="login" className="flex-1">
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-foreground">{t.loginAccount}</h1>
              </div>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t.tabLogin}</TabsTrigger>
                <TabsTrigger value="signup">{t.tabSignup}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={onLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t.email}</Label>
                    <Input id="login-email" name="email" type="email" required maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t.password}</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPw ? "text" : "password"}
                        required
                        minLength={6}
                        maxLength={72}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={busy} className="w-full">
                    {busy ? t.loggingIn : t.loginBtn}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm font-medium text-foreground hover:underline"
                      onClick={async () => {
                        const emailInput = (document.getElementById("login-email") as HTMLInputElement | null)?.value ?? "";
                        const parsed = emailSchema.safeParse(emailInput);
                        if (!parsed.success) return toast.error(parsed.error.issues[0].message);
                        try {
                          await forgotPasswordFn({ data: { email: parsed.data } });
                          toast.success(lang === "pt" ? "Se a conta existir, receberá um email." : "If the account exists, you'll receive an email.");
                        } catch {
                          toast.success(lang === "pt" ? "Se a conta existir, receberá um email." : "If the account exists, you'll receive an email.");
                        }
                      }}
                    >
                      {t.forgot}
                    </button>
                  </div>

                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={onSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-first-name">{t.firstName}</Label>
                      <Input id="signup-first-name" name="first_name" required maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-last-name">{t.lastName}</Label>
                      <Input id="signup-last-name" name="last_name" required maxLength={100} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t.email}</Label>
                    <Input id="signup-email" name="email" type="email" required maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t.password}</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showSignupPw ? "text" : "password"}
                        required
                        minLength={6}
                        maxLength={72}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showSignupPw ? "Hide password" : "Show password"}
                      >
                        {showSignupPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={busy} className="w-full">
                    {busy ? t.creating : t.createBtn}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-semibold tracking-wide">
          <Link to="/" className="hover:opacity-80">OPHUA BUSINESS CARD</Link>
          <Link to="/" className="hover:opacity-80">OPHUA BUSINESS CARD ENTERPRISE</Link>
          <Link to="/" className="hover:opacity-80">ABOUT US</Link>
          <Link to="/" className="hover:opacity-80">HELP</Link>
          <Link to="/" className="hover:opacity-80">CONTACT US</Link>
        </div>
      </footer>

      {/* Contact Us Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.contactTitle}</DialogTitle>
            <DialogDescription>
              {t.contactDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onContactSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">{t.name}</Label>
              <Input
                id="contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                maxLength={100}
                required
                disabled={contactBusy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">{t.email}</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                maxLength={255}
                required
                disabled={contactBusy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">{t.phone}</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                maxLength={50}
                required
                disabled={contactBusy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">{t.message}</Label>
              <Textarea
                id="contact-message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                maxLength={2000}
                rows={5}
                required
                disabled={contactBusy}
              />
              <p className="text-xs text-muted-foreground text-right">
                {contactMessage.length}/2000
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setContactOpen(false)}
                disabled={contactBusy}
              >
                {t.cancel}
              </Button>
              <Button type="submit" disabled={contactBusy}>
                {contactBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t.sending}
                  </>
                ) : (
                  t.send
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

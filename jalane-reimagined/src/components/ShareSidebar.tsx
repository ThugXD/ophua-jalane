import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

import { MessageSquare, Mail, Eye, Link as LinkIcon, Copy, Check, Share2, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/PhoneInput";
import { useT } from "@/hooks/useT";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

type Props = {
  cardUrl: string;
  ownerName: string;
};

type DialogKind = null | "qr" | "sms" | "email" | "link";

export function ShareSidebar({ cardUrl, ownerName }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState<DialogKind>(null);
  const [copied, setCopied] = useState(false);

  // SMS form
  const [smsName, setSmsName] = useState("");
  const [smsPhone, setSmsPhone] = useState("");

  // Email form
  const [emailName, setEmailName] = useState("");
  const [emailTo, setEmailTo] = useState("");

  const qrSidebarRef = useRef<HTMLDivElement>(null);
  const qrDialogRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);
  const qrDialogInstanceRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const opts = {
      width: 160,
      height: 160,
      data: cardUrl,
      type: "svg" as const,
      dotsOptions: { type: "dots" as const, color: "#0F172A" },
      cornersSquareOptions: { type: "extra-rounded" as const, color: "#0F172A" },
      cornersDotOptions: { type: "dot" as const, color: "#0F172A" },
      backgroundOptions: { color: "#ffffff" },
    };
    if (!qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling(opts);
      if (qrSidebarRef.current) {
        qrSidebarRef.current.innerHTML = "";
        qrInstanceRef.current.append(qrSidebarRef.current);
      }
    } else {
      qrInstanceRef.current.update(opts);
    }
  }, [cardUrl]);

  useEffect(() => {
    if (open !== "qr") return;
    const opts = {
      width: 240,
      height: 240,
      data: cardUrl,
      type: "svg" as const,
      dotsOptions: { type: "dots" as const, color: "#0F172A" },
      cornersSquareOptions: { type: "extra-rounded" as const, color: "#0F172A" },
      cornersDotOptions: { type: "dot" as const, color: "#0F172A" },
      backgroundOptions: { color: "#ffffff" },
    };
    if (!qrDialogInstanceRef.current) {
      qrDialogInstanceRef.current = new QRCodeStyling(opts);
    } else {
      qrDialogInstanceRef.current.update(opts);
    }
    if (qrDialogRef.current) {
      qrDialogRef.current.innerHTML = "";
      qrDialogInstanceRef.current.append(qrDialogRef.current);
    }
  }, [open, cardUrl]);


  const fmt = (tpl: string, vars: Record<string, string>) =>
    tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      toast.success(t("share_link_copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("share_copy_failed"));
    }
  };

  const sendSms = () => {
    if (!smsPhone.trim()) return toast.error(t("share_enter_phone"));
    const body = fmt(t("share_sms_body"), { name: smsName || "", owner: ownerName, url: cardUrl }).trim();
    const href = `sms:${smsPhone.replace(/\s+/g, "")}?body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setOpen(null);
  };

  const sendEmail = () => {
    if (!emailTo.trim()) return toast.error(t("share_enter_email"));
    const subject = fmt(t("share_email_subject"), { owner: ownerName });
    const body = fmt(t("share_email_body"), { name: emailName || "", owner: ownerName, url: cardUrl });
    const href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setOpen(null);
  };

  const downloadQr = async () => {
    try {
      const hiRes = new QRCodeStyling({
        width: 1024,
        height: 1024,
        data: cardUrl,
        type: "canvas",
        margin: 16,
        qrOptions: { errorCorrectionLevel: "H" },
        dotsOptions: { type: "dots", color: "#0F172A" },
        cornersSquareOptions: { type: "extra-rounded", color: "#0F172A" },
        cornersDotOptions: { type: "dot", color: "#0F172A" },
        backgroundOptions: { color: "#ffffff" },
      });
      await hiRes.download({
        name: `qrcode-${ownerName || "profile"}`,
        extension: "png",
      });
    } catch {
      toast.error(t("share_copy_failed"));
    }
  };

  const actions = [
    { key: "sms" as const, icon: MessageSquare, label: t("share_sms"), desc: t("share_sms_desc") },
    { key: "email" as const, icon: Mail, label: t("share_email"), desc: t("share_email_desc") },
    { key: "view" as const, icon: Eye, label: t("share_view"), desc: t("share_view_desc") },
    { key: "link" as const, icon: LinkIcon, label: t("share_link"), desc: t("share_link_desc") },
    { key: "download" as const, icon: Download, label: t("share_qr"), desc: t("share_qr_desc") },
  ];

  return (
    <>
      <aside className="rounded-2xl border border-border bg-card shadow-sm p-6 sticky top-6">
        <div className="flex items-center gap-2 mb-1">
          <Share2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">{t("share_title")}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          {t("share_subtitle")}
        </p>

        <div className="flex justify-center mb-5">
          <button
            type="button"
            onClick={() => setOpen("qr")}
            className="p-3 bg-white rounded-xl border-2 border-primary hover:opacity-90 transition flex flex-col items-center gap-2"
            aria-label={t("share_qr")}
          >
            <div ref={qrSidebarRef} aria-label="QR Code" />
            {ownerName && (
              <div className="text-sm font-semibold text-slate-900 text-center max-w-[180px] truncate">
                {ownerName}
              </div>
            )}
          </button>
        </div>

        <div className="space-y-2">
          {actions.map((a) => {
            const Icon = a.icon;
            const content = (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50 hover:bg-accent transition-colors w-full text-left">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{a.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.desc}</div>
                </div>
              </div>
            );
            if (a.key === "view") {
              return (
                <a key={a.key} href={cardUrl} target="_blank" rel="noopener noreferrer" className="block">
                  {content}
                </a>
              );
            }
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => {
                  if (a.key === "link") copyLink();
                  else if (a.key === "download") downloadQr();
                  else setOpen(a.key);
                }}
                className="block w-full"
              >
                {content}
              </button>
            );
          })}
        </div>
      </aside>

      {/* QR Dialog */}
      <Dialog open={open === "qr"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("share_qr_dialog_title")}</DialogTitle>
            <DialogDescription>{t("share_qr_dialog_desc")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="p-4 bg-white rounded-xl flex flex-col items-center gap-2">
              <div ref={qrDialogRef} aria-label="QR Code" />
              {ownerName && (
                <div className="text-base font-semibold text-slate-900 text-center max-w-[260px] truncate">
                  {ownerName}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground break-all text-center">{cardUrl}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {t("share_link")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={open === "sms"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("share_sms_dialog_title")}</DialogTitle>
            <DialogDescription>{t("share_sms_dialog_desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sms-name">{t("name")}</Label>
              <Input id="sms-name" value={smsName} onChange={(e) => setSmsName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sms-phone">{t("share_contact")}</Label>
              <PhoneInput id="sms-phone" value={smsPhone} onChange={setSmsPhone} placeholder="84 000 0000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>{t("cancel")}</Button>
            <Button onClick={sendSms}>{t("share_send_sms")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={open === "email"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("share_email_dialog_title")}</DialogTitle>
            <DialogDescription>{t("share_email_dialog_desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="email-name">{t("name")}</Label>
              <Input id="email-name" value={emailName} onChange={(e) => setEmailName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-to">{t("email")}</Label>
              <Input id="email-to" type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="nome@exemplo.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>{t("cancel")}</Button>
            <Button onClick={sendEmail}>{t("share_send_email")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

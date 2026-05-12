import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Shield, Users, FolderKanban, LogOut, Contact as ContactIcon,
  BarChart3, Settings as SettingsIcon, History, Building2, User as UserIcon, ArrowLeftRight,
  LayoutTemplate, UsersRound, PanelLeftClose, PanelLeftOpen, CreditCard, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/hooks/useT";
import type { TranslationKey } from "@/i18n/translations";
import { NotificationBell } from "@/components/NotificationBell";

type NavItem = { to: string; labelKey?: TranslationKey; label?: string; icon: typeof Users; show: boolean };

type Panel = "user" | "org";

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperadmin, isGroupAdmin, adminGroupIds } = useUserRole();
  const { user } = useAuth();
  const { t } = useT();

  const canSwitch = isGroupAdmin && !isSuperadmin;
  const [panel, setPanel] = useState<Panel>("user");
  const [personName, setPersonName] = useState<string>("");
  const [personAvatar, setPersonAvatar] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");
  const [orgLogo, setOrgLogo] = useState<string>("");

  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("admin_panel") as Panel | null;
    if (saved === "user" || saved === "org") setPanel(saved);
    setCollapsed(window.localStorage.getItem("admin_sidebar_collapsed") === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("admin_sidebar_collapsed", next ? "1" : "0");
      }
      return next;
    });
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle();
      setPersonName(p?.full_name?.trim() || user.email || "");
      setPersonAvatar(p?.avatar_url || "");
    })();
  }, [user]);

  useEffect(() => {
    if (!adminGroupIds.length) return;
    (async () => {
      const { data: g } = await supabase
        .from("groups").select("name, cover_url").eq("id", adminGroupIds[0]).maybeSingle();
      setOrgName(g?.name || "");
      setOrgLogo(g?.cover_url || "");
    })();
  }, [adminGroupIds]);

  const switchPanel = (value: Panel) => {
    setPanel(value);
    if (typeof window !== "undefined") window.localStorage.setItem("admin_panel", value);
    navigate({ to: value === "org" ? "/admin/teams" : "/profile" });
  };

  const userItems: NavItem[] = [
    { to: "/profile", labelKey: "nav_profile" as const, icon: Shield, show: true },
    { to: "/contacts", labelKey: "nav_contacts" as const, icon: ContactIcon, show: true },
    { to: "/analytics", labelKey: "nav_analytics" as const, icon: BarChart3, show: true },
    { to: "/billing", label: "Subscrição", icon: Crown, show: true },
    { to: "/settings", labelKey: "nav_settings" as const, icon: SettingsIcon, show: true },
  ];

  const orgItems: NavItem[] = [
    { to: "/admin/teams", label: "Teams", icon: UsersRound, show: true },
    { to: "/admin/my-users", labelKey: "nav_users" as const, icon: Users, show: true },
    { to: "/admin/org-contacts", label: "Contactos", icon: ContactIcon, show: true },
    { to: "/admin/templates", label: "Templates", icon: LayoutTemplate, show: true },
    { to: "/admin/org-analytics", label: "Analytics global", icon: BarChart3, show: true },
    { to: "/admin/audit", labelKey: "nav_audit" as const, icon: History, show: true },
    { to: "/admin/my-group", labelKey: "nav_settings" as const, icon: SettingsIcon, show: true },
  ];

  const superItems: NavItem[] = ([
    { to: "/admin/users", labelKey: "nav_users" as const, icon: Users, show: isSuperadmin },
    { to: "/admin/groups", labelKey: "nav_companies" as const, icon: FolderKanban, show: isSuperadmin },
    { to: "/admin/analytics", labelKey: "nav_global_analytics" as const, icon: BarChart3, show: isSuperadmin },
    { to: "/admin/subscriptions", label: "Subscrições", icon: CreditCard, show: isSuperadmin },
  ] satisfies NavItem[]).filter((i) => i.show);

  const items = panel === "org" && canSwitch
    ? [...orgItems, ...superItems]
    : userItems;

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
    );

  const switchBtnClass = (active: boolean) =>
    cn(
      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
      active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
    );

  return (
    <aside className={cn("shrink-0 border-r border-border bg-card h-screen sticky top-0 flex flex-col transition-all", collapsed ? "w-16" : "w-60")}>
      <div className={cn("p-5 border-b border-border flex items-center gap-2", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground leading-none">
              OPHUA
              <span className="block text-[10px] font-semibold tracking-[0.3em] text-muted-foreground mt-0.5">
                BUSINESS CARD
              </span>
            </span>
          </Link>
        )}
        <div className="flex items-center gap-1">
          {!collapsed && <NotificationBell />}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-foreground"
            title={collapsed ? "Expandir" : "Recolher"}
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {canSwitch && (
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => switchPanel(panel === "user" ? "org" : "user")}
            className={cn(
              "w-full flex items-center rounded-lg text-sm font-medium transition-colors text-left border border-border bg-transparent text-foreground hover:bg-muted",
              collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
            )}
            title={panel === "user" ? personName : orgName}
          >
            {panel === "user" ? (
              personAvatar ? (
                <img src={personAvatar} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
              ) : (
                <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <UserIcon className="h-3 w-3" />
                </span>
              )
            ) : orgLogo ? (
              <img src={orgLogo} alt="" className="h-5 w-5 rounded object-cover shrink-0" />
            ) : (
              <span className="h-5 w-5 rounded bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-3 w-3" />
              </span>
            )}
            {!collapsed && (
              <>
                <span className="truncate flex-1">
                  {(panel === "user" ? personName : orgName) || "..."}
                </span>
                <ArrowLeftRight className="h-4 w-4 shrink-0 opacity-60" />
              </>
            )}
          </button>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1 mt-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          const label = item.labelKey ? t(item.labelKey) : item.label;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                linkClass(active),
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4" /> {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
          onClick={logout}
          title={collapsed ? t("logout") : undefined}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} /> {!collapsed && t("logout")}
        </Button>
      </div>
    </aside>
  );
}

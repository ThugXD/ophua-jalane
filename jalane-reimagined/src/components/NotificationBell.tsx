import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "agora";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const { isSuperadmin, isGroupAdmin, loading } = useUserRole();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const enabled = !!user && (isSuperadmin || isGroupAdmin);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase.from("notifications" as never) as any)
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setItems((data ?? []) as Notification[]);
  }, [user]);

  useEffect(() => {
    if (!enabled) return;
    load();
    const channel = supabase
      .channel(`notif-${user!.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${user!.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, user, load]);

  if (loading || !enabled) return null;

  const unread = items.filter((n) => !n.read_at).length;

  const markRead = async (id: string) => {
    await (supabase.from("notifications" as never) as any)
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold">Notificações</span>
          <span className="text-xs text-muted-foreground">{unread} por ler</span>
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Sem notificações</div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => !n.read_at && markRead(n.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors flex gap-2",
                      !n.read_at && "bg-muted/30",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 rounded-full shrink-0",
                        n.read_at ? "bg-transparent" : "bg-primary",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
                      </div>
                      {n.body && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

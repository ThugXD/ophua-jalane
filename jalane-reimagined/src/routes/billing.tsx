import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Crown, Users } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Subscrição & Planos" }] }),
  component: BillingPage,
});

const PLANS = [
  {
    id: "free", name: "Free", price: "0€", icon: Check,
    features: ["Cartão digital básico", "QR code para partilhar", "Acesso temporário (trial)"],
  },
  {
    id: "pro", name: "Pro", price: "—", icon: Crown,
    features: ["Cartão completo personalizado", "Analytics individuais", "Contactos ilimitados", "Sem expiração"],
  },
  {
    id: "business", name: "Business / Team", price: "—", icon: Users,
    features: ["Tudo do Pro", "Gestão de equipa e grupos", "Analytics da organização", "Templates partilhados"],
  },
] as const;

function BillingPage() {
  const sub = useSubscription();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscrição</h1>
        <p className="text-muted-foreground">Veja o seu plano atual e as opções disponíveis.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Plano atual</CardTitle>
            <Badge variant={sub.isActive ? "default" : "destructive"} className="uppercase">
              {sub.plan}
            </Badge>
          </div>
          <CardDescription>
            {sub.plan === "free" && sub.expiresAt && sub.isActive &&
              `Trial Free — termina em ${sub.daysLeft} dia(s) (${new Date(sub.expiresAt).toLocaleDateString()})`}
            {sub.isExpired && "O seu período expirou. Contacte o administrador para ativar Pro ou Business."}
            {sub.plan !== "free" && sub.isActive && "Plano ativo."}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const Icon = p.icon;
          const current = sub.plan === p.id;
          return (
            <Card key={p.id} className={current ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle>{p.name}</CardTitle>
                </div>
                <CardDescription className="text-2xl font-bold text-foreground">{p.price}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button className="w-full" variant={current ? "secondary" : "default"} disabled>
                  {current ? "Plano atual" : "Falar com administrador"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

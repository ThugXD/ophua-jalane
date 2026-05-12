import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin/org-analytics")({
  head: () => ({ meta: [{ title: "Analytics da organização" }] }),
  component: OrgAnalyticsPage,
});

function OrgAnalyticsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Analytics da organização</h1>
      </div>
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <h2 className="text-lg font-semibold mb-2">Em breve</h2>
        <p className="text-muted-foreground">
          Métricas agregadas de visualizações, cliques e contactos dos membros da sua empresa.
        </p>
      </div>
    </div>
  );
}

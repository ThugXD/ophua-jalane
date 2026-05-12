import { createFileRoute } from "@tanstack/react-router";
import { LayoutTemplate } from "lucide-react";

export const Route = createFileRoute("/admin/templates")({
  head: () => ({ meta: [{ title: "Templates" }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <LayoutTemplate className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Templates</h1>
      </div>
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <h2 className="text-lg font-semibold mb-2">Em breve</h2>
        <p className="text-muted-foreground">
          Defina como os cartões dos colaboradores da sua empresa vão ser apresentados.
        </p>
      </div>
    </div>
  );
}

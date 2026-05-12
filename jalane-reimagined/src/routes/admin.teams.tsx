import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/admin/teams")({
  head: () => ({ meta: [{ title: "Teams" }] }),
  component: TeamsPage,
});

function TeamsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Teams</h1>
      </div>
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <h2 className="text-lg font-semibold mb-2">Em breve</h2>
        <p className="text-muted-foreground">
          Aqui vai poder criar e gerir equipas dentro da sua organização.
        </p>
      </div>
    </div>
  );
}

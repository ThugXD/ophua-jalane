import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "lucide-react";

export const Route = createFileRoute("/admin/org-contacts")({
  head: () => ({ meta: [{ title: "Contactos da organização" }] }),
  component: OrgContactsPage,
});

function OrgContactsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Contact className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Contactos da organização</h1>
      </div>
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <h2 className="text-lg font-semibold mb-2">Em breve</h2>
        <p className="text-muted-foreground">
          Veja todos os contactos recebidos pelos colaboradores da sua empresa.
        </p>
      </div>
    </div>
  );
}

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

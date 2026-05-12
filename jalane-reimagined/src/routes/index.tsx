import { createFileRoute } from "@tanstack/react-router";
import { ProfileCard } from "@/components/ProfileCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cartão de contato digital" },
      { name: "description", content: "Cartão de contato digital." },
    ],
  }),
  component: Index,
});

function Index() {
  return <ProfileCard />;
}

import { createFileRoute } from "@tanstack/react-router";
import { ProfileCard } from "@/components/ProfileCard";

export const Route = createFileRoute("/u/$id")({
  head: () => ({
    meta: [
      { title: "Cartão de contato digital" },
      { name: "description", content: "Cartão de contato digital." },
    ],
  }),
  component: UserCard,
});

function UserCard() {
  const { id } = Route.useParams();
  return <ProfileCard profileId={id} />;
}

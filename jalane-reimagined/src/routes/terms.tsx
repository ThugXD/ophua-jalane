import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Termos de uso" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6 sm:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-bold mb-6">Termos de uso</h1>
        <div className="prose prose-sm max-w-none text-foreground space-y-4">
          <p>
            Bem-vindo à OPHUA. Ao utilizar a nossa plataforma de cartões de contacto digitais,
            o utilizador concorda com os presentes Termos de Uso.
          </p>
          <h2 className="text-xl font-semibold mt-6">1. Utilização do serviço</h2>
          <p>
            O serviço deve ser utilizado de forma lícita, respeitando a legislação aplicável e
            os direitos de terceiros. É proibido o uso para fins fraudulentos, spam ou difamação.
          </p>
          <h2 className="text-xl font-semibold mt-6">2. Conta e segurança</h2>
          <p>
            O utilizador é responsável por manter a confidencialidade das suas credenciais e por
            todas as actividades realizadas na sua conta.
          </p>
          <h2 className="text-xl font-semibold mt-6">3. Conteúdo</h2>
          <p>
            O conteúdo carregado (nome, foto, contactos, capa) permanece propriedade do utilizador,
            que concede à OPHUA uma licença para o exibir conforme necessário ao funcionamento do serviço.
          </p>
          <h2 className="text-xl font-semibold mt-6">4. Alterações</h2>
          <p>
            A OPHUA pode actualizar estes termos a qualquer momento. As alterações entram em vigor
            após publicação nesta página.
          </p>
        </div>
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Política de privacidade" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6 sm:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-bold mb-6">Política de privacidade</h1>
        <div className="prose prose-sm max-w-none text-foreground space-y-4">
          <p>
            A sua privacidade é importante para a OPHUA. Esta política descreve quais dados
            recolhemos e como são utilizados.
          </p>
          <h2 className="text-xl font-semibold mt-6">1. Dados recolhidos</h2>
          <p>
            Recolhemos os dados que o utilizador fornece ao criar a conta e o cartão (nome, email,
            telefones, empresa, cargo, endereço, foto e capa), bem como os contactos partilhados
            através da função de troca de cartões.
          </p>
          <h2 className="text-xl font-semibold mt-6">2. Utilização dos dados</h2>
          <p>
            Os dados são utilizados para apresentar o cartão digital, permitir a troca de contactos
            e melhorar o serviço. Não vendemos dados pessoais a terceiros.
          </p>
          <h2 className="text-xl font-semibold mt-6">3. Segurança</h2>
          <p>
            Aplicamos medidas técnicas e organizativas adequadas para proteger os dados contra
            acesso não autorizado, perda ou divulgação.
          </p>
          <h2 className="text-xl font-semibold mt-6">4. Direitos do utilizador</h2>
          <p>
            O utilizador pode aceder, corrigir ou eliminar os seus dados a qualquer momento
            através do seu perfil ou contactando-nos.
          </p>
        </div>
      </div>
    </main>
  );
}

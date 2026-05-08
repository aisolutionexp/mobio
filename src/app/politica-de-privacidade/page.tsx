import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Saiba como o MOBIO coleta, utiliza e protege seus dados pessoais em conformidade com a LGPD.",
};

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12">
          <Link
            href="/"
            className="text-accent text-sm font-medium underline underline-offset-4"
          >
            Voltar ao início
          </Link>
          <h1 className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Última atualização: maio de 2026
          </p>
        </header>

        <div className="prose prose-sm max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-xl font-semibold">
              1. Quem somos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              O MOBIO é uma plataforma de marketplace B2B de moda que conecta
              ateliês e fábricas a lojistas multimarca. Somos o controlador dos
              seus dados pessoais nos termos da Lei Geral de Proteção de Dados
              (LGPD — Lei 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">
              2. Dados que coletamos
            </h2>
            <ul className="text-muted-foreground list-disc space-y-2 pl-5">
              <li>
                <strong>Dados de cadastro:</strong> nome, email, CNPJ, telefone,
                região, segmentos de interesse.
              </li>
              <li>
                <strong>Dados de uso:</strong> páginas visitadas, interações com
                a plataforma, horários de acesso.
              </li>
              <li>
                <strong>Dados de navegação:</strong> endereço IP, tipo de
                navegador, cookies funcionais.
              </li>
              <li>
                <strong>Dados comerciais:</strong> pedidos, orçamentos,
                linesheets, preferências de compra.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">
              3. Finalidades do tratamento
            </h2>
            <ul className="text-muted-foreground list-disc space-y-2 pl-5">
              <li>Criação e gerenciamento da sua conta na plataforma.</li>
              <li>
                Conexão entre ateliês/fábricas e lojistas para transações
                comerciais.
              </li>
              <li>
                Envio de comunicações transacionais (confirmações de pedido,
                notificações).
              </li>
              <li>Melhoria da experiência e personalização da plataforma.</li>
              <li>Cumprimento de obrigações legais e regulatórias.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">
              4. Base legal
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Tratamos seus dados com base em: execução de contrato (Art. 7, V
              da LGPD), consentimento (Art. 7, I), legítimo interesse (Art. 7,
              IX), e cumprimento de obrigação legal (Art. 7, II).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">
              5. Compartilhamento de dados
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados podem ser compartilhados com: parceiros comerciais da
              plataforma (fábricas e lojistas, conforme necessário para as
              transações), prestadores de serviços essenciais (hospedagem,
              processamento de pagamentos, envio de emails) e autoridades
              competentes quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">
              6. Seus direitos (Art. 18 da LGPD)
            </h2>
            <ul className="text-muted-foreground list-disc space-y-2 pl-5">
              <li>Confirmar a existência de tratamento de dados.</li>
              <li>Acessar, corrigir ou atualizar seus dados.</li>
              <li>
                Solicitar a anonimização, bloqueio ou eliminação de dados.
              </li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>Solicitar a portabilidade dos dados.</li>
              <li>
                Obter informações sobre com quem seus dados foram
                compartilhados.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">
              7. Retenção de dados
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados são mantidos enquanto sua conta estiver ativa ou
              enquanto necessário para cumprir obrigações legais. Após a
              exclusão da conta, dados podem ser retidos por até 5 anos para
              fins fiscais e legais.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">8. Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas e organizacionais para proteger seus
              dados, incluindo criptografia em trânsito (TLS), controle de
              acesso baseado em funções (RBAC), e monitoramento de segurança.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">9. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies estritamente necessários para o funcionamento
              da plataforma (autenticação, preferências de sessão). Cookies de
              analytics são utilizados apenas com seu consentimento.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">10. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre o
              tratamento de dados, entre em contato pelo email:{" "}
              <a
                href="mailto:privacidade@mobio.com.br"
                className="text-accent underline underline-offset-4"
              >
                privacidade@mobio.com.br
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold">
              11. Alterações nesta política
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta política pode ser atualizada periodicamente. Notificaremos
              sobre mudanças significativas por email ou por aviso na
              plataforma.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

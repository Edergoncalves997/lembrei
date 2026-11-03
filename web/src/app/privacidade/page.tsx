import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Política de privacidade" };

// RASCUNHO: revisar com um profissional antes do lançamento público.
export default function Privacidade() {
  return (
    <LegalPage titulo="Política de privacidade">
      <p>
        A {site.name} é uma assistente de memória: você manda mensagens no WhatsApp ou usa o app, e ela salva,
        organiza e te lembra das coisas. Para isso, precisamos tratar alguns dados pessoais. Esta política explica
        quais, por quê e como você controla tudo isso, nos termos da Lei Geral de Proteção de Dados (Lei nº
        13.709/2018, “LGPD”).
      </p>

      <h2>1. Quem é o responsável</h2>
      <p>
        O controlador dos dados é {site.legalName}, CNPJ {site.cnpj}. Para qualquer assunto sobre privacidade,
        fale com a gente em <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>

      <h2>2. Quais dados tratamos</h2>
      <ul>
        <li><b>Lista de espera:</b> nome, número de WhatsApp e a data em que você deu consentimento.</li>
        <li><b>Uso pelo WhatsApp:</b> seu número, o nome do seu perfil, o conteúdo das mensagens que você envia para a {site.name} e as respostas que ela envia.</li>
        <li><b>Seus itens:</b> lembretes, tarefas, notas e links que você cria, com datas, horários e status.</li>
        <li><b>Conta e preferências:</b> fuso horário e data de aceite destes termos.</li>
        <li><b>Dados técnicos:</b> registros de acesso, erros e eventos de uso do app e do site, usados para manter o serviço funcionando e melhorá-lo.</li>
      </ul>
      <p>
        Não peça para a {site.name} guardar senhas, dados de cartão, informações de saúde ou outros dados sensíveis.
        Ela não foi feita para isso.
      </p>

      <h2>3. Para que usamos</h2>
      <ul>
        <li>Prestar o serviço: entender suas mensagens, salvar seus itens e enviar os lembretes na hora certa.</li>
        <li>Avisar quando abrir vaga no beta, se você entrou na lista de espera.</li>
        <li>Proteger o serviço contra abuso, fraude e falhas.</li>
        <li>Entender, de forma agregada, como o produto é usado, para melhorá-lo.</li>
        <li>Cumprir obrigações legais.</li>
      </ul>

      <h2>4. Bases legais</h2>
      <p>
        Usamos o <b>consentimento</b> para a lista de espera e as mensagens sobre o beta; a <b>execução do
        contrato</b> para prestar o serviço que você pediu; o <b>legítimo interesse</b> para segurança e métricas de
        uso; e o <b>cumprimento de obrigação legal</b> para guardar registros de acesso exigidos pelo Marco Civil
        da Internet (Lei nº 12.965/2014).
      </p>

      <h2>5. Inteligência artificial</h2>
      <p>
        Para entender o que você quis dizer (por exemplo, que “sexta às 9h” é uma data), o texto da mensagem é
        enviado a um provedor de inteligência artificial. Enviamos apenas o necessário para interpretar aquela
        mensagem, e o provedor não usa esses dados para treinar modelos. A IA pode errar: por isso a {site.name}{" "}
        sempre confirma o que entendeu, e você pode corrigir ou apagar qualquer item.
      </p>

      <h2>6. Com quem compartilhamos</h2>
      <p>Não vendemos seus dados. Compartilhamos apenas com fornecedores que operam o serviço em nosso nome:</p>
      <ul>
        <li><b>Meta (WhatsApp Business Platform):</b> troca de mensagens.</li>
        <li><b>Supabase:</b> banco de dados e hospedagem do sistema.</li>
        <li><b>Anthropic:</b> interpretação das mensagens por IA.</li>
        <li><b>Vercel:</b> hospedagem deste site.</li>
        <li><b>PostHog e Sentry:</b> métricas de uso e monitoramento de erros.</li>
        <li><b>Resend:</b> envio de e-mails, quando houver.</li>
      </ul>
      <p>Também podemos compartilhar dados quando a lei ou uma ordem judicial exigir.</p>

      <h2>7. Transferência internacional</h2>
      <p>
        Alguns desses fornecedores armazenam ou processam dados fora do Brasil, como nos Estados Unidos. Nesses
        casos, a transferência segue as salvaguardas previstas no art. 33 da LGPD.
      </p>

      <h2>8. Por quanto tempo guardamos</h2>
      <ul>
        <li>Seus itens e mensagens: enquanto sua conta existir.</li>
        <li>Depois que você pede a exclusão: apagamos em até 30 dias, exceto o que a lei nos obriga a manter (por exemplo, registros de acesso por 6 meses).</li>
        <li>Lista de espera: até o fim do beta ou até você pedir para sair.</li>
      </ul>

      <h2>9. Seus direitos</h2>
      <p>
        Você pode, a qualquer momento: confirmar se tratamos seus dados, acessá-los, corrigi-los, pedir sua
        exclusão, anonimização ou portabilidade, saber com quem foram compartilhados e revogar seu consentimento
        (art. 18 da LGPD).
      </p>
      <p>
        O jeito mais rápido de apagar tudo é mandar <b>“apagar minha conta”</b> para a {site.name} no WhatsApp.
        Para os demais pedidos, escreva para <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        Respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>10. Segurança</h2>
      <p>
        Os dados trafegam criptografados, o acesso interno é restrito e cada pessoa só enxerga os próprios itens.
        Nenhum sistema é 100% invulnerável; se acontecer um incidente que possa te afetar, avisaremos você e a ANPD
        conforme a lei.
      </p>

      <h2>11. Idade mínima</h2>
      <p>Durante o beta, a {site.name} é destinada a pessoas com 18 anos ou mais.</p>

      <h2>12. Cookies</h2>
      <p>Este site não usa cookies de publicidade.</p>

      <h2>13. Mudanças nesta política</h2>
      <p>
        Se mudarmos algo importante, avisaremos pelo WhatsApp ou pelo app antes de a mudança valer. Veja também
        os <Link href="/termos">Termos de uso</Link>.
      </p>
    </LegalPage>
  );
}

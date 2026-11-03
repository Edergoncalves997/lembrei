import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Termos de uso" };

// RASCUNHO: revisar com um profissional antes do lançamento público.
export default function Termos() {
  return (
    <LegalPage titulo="Termos de uso">
      <p>
        Estes termos valem para o uso da {site.name} pelo WhatsApp, pelo app e por este site. Ao responder
        “aceito” para a {site.name} ou usar o app, você concorda com eles e com a{" "}
        <Link href="/privacidade">Política de privacidade</Link>.
      </p>

      <h2>1. O serviço</h2>
      <p>
        A {site.name} recebe suas mensagens, entende o que você quer guardar (lembretes, tarefas, notas e links),
        organiza tudo e te avisa nos horários combinados. O serviço está em <b>beta</b>: pode mudar, ter falhas
        ou ficar fora do ar, e recursos podem ser adicionados ou removidos.
      </p>

      <h2>2. Sua conta</h2>
      <p>
        Sua conta é o seu número de WhatsApp. Quem tiver acesso ao seu WhatsApp consegue usar a sua{" "}
        {site.name}, então cuide do seu número e do seu celular.
      </p>

      <h2>3. Lembretes podem falhar</h2>
      <p>
        A {site.name} é uma ferramenta de apoio. Lembretes dependem do WhatsApp, da internet, do seu celular e de
        sistemas de terceiros, e podem atrasar ou não chegar. <b>Não use a {site.name} como única forma de lembrar
        de algo crítico</b>, como horários de medicamentos, prazos legais ou compromissos dos quais dependa sua
        saúde ou seu patrimônio.
      </p>

      <h2>4. A IA pode errar</h2>
      <p>
        A interpretação das mensagens é feita por inteligência artificial e pode entender errado. Por isso a{" "}
        {site.name} sempre confirma o que salvou. Confira as confirmações e corrija quando precisar.
      </p>

      <h2>5. Uso aceitável</h2>
      <ul>
        <li>Não use a {site.name} para enviar spam, conteúdo ilegal ou para prejudicar outras pessoas.</li>
        <li>Não tente burlar limites, acessar dados de outras pessoas ou atacar o serviço.</li>
        <li>Durante o beta, há um limite de 50 mensagens por pessoa por dia.</li>
        <li>Não envie senhas, dados de cartão ou outros dados sensíveis.</li>
      </ul>

      <h2>6. Seu conteúdo</h2>
      <p>
        O que você salva continua sendo seu. Você nos autoriza a armazenar e processar esse conteúdo apenas para
        prestar o serviço, como descrito na Política de privacidade.
      </p>

      <h2>7. Preço</h2>
      <p>
        A {site.name} é gratuita durante o beta. Se no futuro houver planos pagos, avisaremos com antecedência e
        nada será cobrado sem a sua contratação expressa.
      </p>

      <h2>8. Encerramento</h2>
      <p>
        Você pode parar de usar e apagar sua conta a qualquer momento, mandando “apagar minha conta” no WhatsApp.
        Podemos suspender contas que violem estes termos.
      </p>

      <h2>9. Responsabilidade</h2>
      <p>
        Fazemos o possível para o serviço funcionar bem, mas, na extensão permitida pela legislação (incluindo o
        Código de Defesa do Consumidor), não respondemos por perdas causadas por lembretes não entregues,
        indisponibilidade ou erros de interpretação.
      </p>

      <h2>10. Lei e foro</h2>
      <p>
        Estes termos seguem as leis do Brasil. Eventuais conflitos serão resolvidos no foro do seu domicílio.
      </p>

      <h2>11. Contato</h2>
      <p>
        {site.legalName}, CNPJ {site.cnpj}. E-mail:{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}

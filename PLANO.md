# Lembrinha — Plano de decisões v1

> **Lembrinha, sua segunda memória.**
> Este documento substitui o "Projeto Lembrei v1.0" nos pontos em que ele foi alterado. Decisões tomadas em 31/10/2026 e revistas em 03/11/2026.

> **Mudança de 03/11/2026: a v1 é só o app, e o WhatsApp foi adiado.** Integrar a Cloud API (webhook, janela de 24h, templates, verificação da Meta) custa caro demais para 1–2 h por semana. A v1 serve para validar o parser de datas e a retenção. O WhatsApp continua sendo o produto-alvo e entra depois do beta. Toda a interpretação fica no backend, pronta para o bot reaproveitar.

## 1. Identidade

- **Nome:** Lembrinha. "Lembrei" já é usado por ao menos 5 produtos no Brasil (lembrei.ai e meulembrei.com.br fazem lembretes via WhatsApp) e todos os domínios estão ocupados.
- **Slogan:** "Sua segunda memória."
- **Domínio:** `lembrinha.com.br` estava livre em 31/10/2026, mas **ainda não foi registrado** (decisão consciente). Risco: alguém registrar antes.
- **Pendente:** busca manual em busca.inpi.gov.br (classes 9 e 42) e nas lojas Play Store e App Store.

## 2. Diferencial

- **Pendente da Fase 0.** Os concorrentes diretos são Zapia, Fredo AI, lembrei.ai e meulembrei. Sem o WhatsApp, a v1 também concorre com Google Keep, TickTick e Todoist.
- **Saída esperada:** uma frase de diferencial que o Zapia não consiga dizer.

## 3. Escopo

### v1: beta fechado (só o app)

**App Android (Expo)**
- **Login:** e-mail e senha (Supabase Auth). No **cadastro**, o usuário define a senha, marca "li e aceito os termos e a privacidade" e recebe **um link de confirmação**, uma vez só. Depois disso, entra sempre com e-mail e senha. Mudou em 03/11/2026: o código por e-mail exigia SMTP próprio para editar o template. "Esqueci a senha" ainda está pendente.
- **Captura com IA:** o usuário escreve em linguagem natural e uma Edge Function devolve tipo, título e data. A chave da Anthropic fica só no servidor.
- **Lista:** abas Hoje / Amanhã / Próximos / Tudo, filtro por tipo e busca simples por texto. "Hoje" inclui os atrasados. Itens sem data aparecem só em "Tudo", que é a aba padrão.
- **Seletor de data:** por enquanto, campos DD/MM/AAAA e HH:MM com atalhos (Hoje, Amanhã, 9h, 18h…), porque funcionam no celular e na web. O seletor nativo do Android fica para depois.
- Marcar como feito, editar e apagar.
- **Lembretes:** notificação **local**, agendada no próprio aparelho com `expo-notifications` e a permissão `SCHEDULE_EXACT_ALARM`, que o usuário concede (o Android 14+ começa negando). O `USE_EXACT_ALARM` ficou de fora porque a Play Store o restringe a apps de despertador e de calendário. Ao abrir, o app reagenda tudo a partir do banco, o que cobre reinstalação e edições.

**Landing (Vercel):** fica como está (início, privacidade, termos e lista de espera).

### Fora da v1

| Quando | O quê |
|---|---|
| v1.1 | Áudio (transcrição) e recorrência ("todo dia 10", "toda segunda") |
| Após o beta, se passar no §11 | **Bot de WhatsApp (Cloud API oficial)**, envio de lembretes pelo WhatsApp (`pg_cron` + template), push remoto e consultas por texto ("o que tenho amanhã?"). A burocracia da Meta (Meta Business, número, template, domínio) também só começa aqui |
| v2 | Compartilhar de outros apps, categorias/pastas/favoritos, iOS |
| Após provar retenção | Pagamentos: Stripe + AbacatePay (Pix). Hipótese de preço: R$ 9,90/mês, R$ 79,90/ano |
| v3+ | **Cofre de senhas**: só local no celular, cifrado com chave no Keychain/Keystore, biometria, sem sync, exportação de backup cifrado. Nunca passa pelo WhatsApp nem pela IA |

## 4. Regras de captura (app)

"O código decide, a IA só sugere." Ficam as mesmas regras pensadas para o bot, só que, em vez de perguntar no chat, o app usa a tela.

1. **Data ou hora faltando, no passado ou ambígua:** o app abre o seletor de data já com o palpite da IA e só salva depois que o usuário confirma. Nunca inventa data.
2. **Data clara:** salva direto e mostra o aviso "Lembrete · Pagar luz · 10/11 08:00 [Editar] [Desfazer]".
3. **Dia sem horário:** usa 9h e o aviso mostra o horário.
4. **Intenção indefinida:** salva como nota, e o aviso oferece "virar lembrete".
5. **Recorrência na v1:** cria o lembrete único e avisa que a recorrência chega na v1.1.
6. **Senhas:** o app avisa que não guarda senhas.
7. **Conta:** o e-mail é a conta. O telefone fica opcional e é vinculado quando o bot chegar. Fuso padrão: America/Sao_Paulo.
8. **Beta fechado:** quem barra é a lista de testadores do teste interno da Play Store (contas Google, até 100). Não existe controle de convite no backend.
9. **Limite:** 50 capturas com IA por usuário por dia.

## 5. Stack

| Camada | Escolha |
|---|---|
| App | React Native + Expo (EAS), **só Android** no beta (teste interno da Play Store) |
| Backend | **Supabase Edge Functions** (Deno/TypeScript): na v1, só a função de captura/parser |
| Banco / Auth | Supabase (Postgres + RLS, Auth com e-mail e senha + confirmação por link) |
| Lembretes | Notificação local (`expo-notifications`). `pg_cron` só quando o WhatsApp chegar |
| IA | Claude Haiku 5.5, saída em JSON validado (confirmar preço ao implementar) |
| Landing | Next.js estático na Vercel |
| E-mail | Resend (SMTP do Supabase Auth) |
| Monitoramento | Sentry (erros) + PostHog (produto), desde o dia 1 |

## 6. Fluxo de captura

```
App (texto) → Edge Function "capturar" (JWT do Supabase)
  → limite diário → IA recebe texto + data/hora atual + fuso e devolve JSON
  → valida o JSON e devolve a sugestão (não salva sozinha)
App → data ok? salva o item (insert com RLS) e agenda a notificação local
    → faltando, passado ou ambíguo? abre o seletor e salva depois de confirmar
```

## 7. Modelo de dados (v1)

- `profiles`: id (= auth.users.id), fuso, termos_aceitos_em, telefone (opcional), criado_em
- `items`: id, user_id, tipo (nota|link|tarefa|lembrete), titulo, texto_original, remind_at, status, criado_em
- `capturas`: id, user_id, criado_em (usada para contar o limite diário)

O RLS restringe cada usuário aos próprios dados. Novas tabelas só quando um recurso exigir. A tabela `messages` (dedupe do WhatsApp) volta junto com o bot.

## 8. Qualidade da IA

- O texto original sempre fica salvo no item.
- O arquivo `backend/supabase/tests/parser-casos.json` reúne 55 frases em português com a resposta esperada (ex.: "dia 5 do 12 às 5 da tarde", "sexta", "daqui 3 dias"). Rode `deno task parser` em `backend/` a cada mudança no prompt. A meta é 85%.
- **Convenções do parser:** "de manhã" sem hora vira 9h, "à tarde" vira 14h e "à noite" vira 20h. Um horário sem dia vale para hoje; se já passou, o app pede confirmação. "Dia N" que já passou cai no mês seguinte. Uma tarefa com data vira lembrete. Se a IA falhar, a captura é salva como nota, para não perder nada.
- **Função:** `backend/supabase/functions/capturar`, com o Claude Haiku 5.5 (effort `low`) e saída estruturada. A IA devolve data e hora locais; o código (`decidir.ts`, com testes em `deno task test`) converte para UTC e decide se precisa confirmar.

## 9. Repositório

Um repositório privado no GitHub, sem ferramentas de monorepo:

Cada pasta é um projeto independente, com o próprio `package.json`:

```
backend/    Supabase: supabase/migrations, supabase/functions, testes do parser
web/        Next.js na Vercel: landing, privacidade, termos, lista de espera
app/        Expo (React Native)
lembrei antigo/  protótipo das telas (referência visual, não faz parte do repo)
```

## 10. Cronograma

- **Ritmo:** 1–2 h por semana, programando com o Claude.

| Semanas | O quê |
|---|---|
| 1–2 | **Fase 0:** usar o Zapia como usuário real e fazer cerca de 10 entrevistas (nova pergunta: "você usaria isso como app, ou só pelo WhatsApp?") |
| 3–6 | Desenvolvimento do app. **Não cortar a qualidade da interpretação de datas** |
| 7–10 | Beta fechado com 20–30 pessoas |

## 11. Critérios ao fim do beta (30 dias)

- **Retenção:** uso ativo do app na semana 4.
- **Precisão:** pelo menos 85% dos lembretes ficam com a data certa sem correção.
- **Pesquisa:** "Como você se sentiria se o Lembrinha deixasse de existir?". Se 40% ou mais responderem "muito decepcionado", começa o WhatsApp e, depois, a monetização. Abaixo disso, volta às entrevistas antes de escrever mais código.
- **Custos:** alerta de cobrança configurado na Anthropic.

## 12. Série "Criando aplicativos para me aposentar"

- Devlog quinzenal, gravando a tela enquanto programa com o Claude, com edição leve.
- **Semanas 1–2:** episódios sobre a ideia, a pesquisa, os concorrentes, a troca de Lembrei para Lembrinha e o adiamento do WhatsApp.
- **Semanas 3–6:** cerca de 4 episódios de construção.
- **Episódios de usuários, custos e receita:** só com dados reais.

## 13. Riscos em aberto

- Domínio e marca não registrados.
- **A landing ainda promete WhatsApp** (decisão de 03/11: mantê-la como está). A política de privacidade cita a Meta e o WhatsApp, mas o app não usa nenhum dos dois. Revisar antes de abrir o beta.
- **E-mail de confirmação (03/11/2026):** o SMTP padrão do Supabase manda poucos e-mails por hora e não deixa editar os templates. Durante os testes, o "Confirm email" fica **desligado**. **Antes do beta:** configurar o Resend como SMTP, religar o "Confirm email", traduzir o template para português e definir o Site URL.
- **A lista de espera pede WhatsApp, mas a Play Store pede o Gmail.** O teste interno exige a conta Google de cada testador, então vai ser preciso pedir o e-mail a cada convidado.
- **Sem WhatsApp, a v1 é "mais um app de lembretes"**, e o diferencial (§2) segue indefinido.
- Quando o WhatsApp voltar, o prazo de aprovação da Meta não está sob nosso controle, e o domínio provavelmente vira obrigatório.

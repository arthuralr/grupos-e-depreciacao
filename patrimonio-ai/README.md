# Patrimônio AI

Assistente de consulta patrimonial para o setor público. A API recupera referências
aplicáveis à data da consulta no Supabase e envia os resumos ao provedor de IA para
interpretar a descrição. A interface apresenta enquadramento provável, grupo e
espécie sugeridos, orientação sobre depreciação e links oficiais.

## Testar localmente

Com Node.js 24, abra o terminal nesta pasta e execute:

```sh
npm ci
npm run dev
```

Acesse [localhost:3000](http://localhost:3000). Sem variáveis configuradas, o
aplicativo abre em demonstração, com exemplos ilustrativos. Para verificar a
compilação de produção, execute `npm run build`.

## Ativar a consulta real

1. No Supabase, abra **SQL Editor → New query**. Cole e execute todo o
   arquivo [supabase/schema.sql](supabase/schema.sql). Ele cria a base de
   referências, instala a busca e inclui um conjunto inicial de sínteses do
   MCASP e das NBC TSP sobre imobilizado. Pode ser executado novamente.
2. No seu projeto existente na Vercel, acesse **Settings → Environment
   Variables**, selecione **Production** e configure as variáveis abaixo.
   Para um teste no computador, copie `.env.example` para `.env.local` e
   preencha o arquivo localmente.
3. Envie a atualização para o mesmo repositório GitHub já conectado à
   Vercel. Se o deploy foi criado antes de configurar as variáveis, faça
   um **Redeploy**. Para uso interno, restrinja o acesso ao deploy para
   controlar o consumo da API. A aplicação não implementa login próprio.
4. Abra o site e consulte **“celular para uso da Câmara”** ou outro bem. Confira
   se o selo de demonstração sumiu e se os links oficiais aparecem na resposta.

| Variável | Valor |
| --- | --- |
| `APP_MODE` | `live` para consulta real ou `demo` para demonstração |
| `SUPABASE_URL` | URL do projeto, ex.: `https://seu-projeto.supabase.co` |
| `SUPABASE_SECRET_KEY` | Chave **Secret** nas configurações de API do Supabase. Também aceita a chave legada `service_role`. |
| `GROQ_API_KEY` | Chave criada no [console da Groq](https://console.groq.com/keys). Quando preenchida, usa o modelo `openai/gpt-oss-20b` para a análise. |
| `GEMINI_API_KEY` | Usada quando `GROQ_API_KEY` está vazia. Chave criada no [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | Opcional. O padrão é `gemini-3.1-flash-lite`. Use um modelo com saída estruturada disponível na sua conta. |

Mantenha os valores reais fora do Git. No modo real, a descrição e as sínteses
seguem para o provedor configurado. Digite descrições de bens sem dados pessoais ou sigilosos.

## Atualizar a publicação existente

Copie o conteúdo deste pacote para a pasta local do repositório que já está
conectado à Vercel. A pasta correta contém o `package.json`. Inclua os arquivos
ocultos `.gitignore` e `.env.example`. No terminal, execute:

```sh
git status
git add .
git diff --cached --name-only
git commit -m "Adicionar consulta de normas patrimoniais"
git push
```

Confira se a lista de arquivos não inclui `.env.local` ou chaves antes de fazer
o commit.

## Escopo e atualização da base

Esta versão cobre principalmente reconhecimento de imobilizado, distinção
orçamentária entre consumo e permanente, reposição de componentes e
depreciação. Normas locais podem ser adicionadas após identificar a entidade
e o seu escopo. O calendário federal inicial considera a aplicação geral da
NBC TSP 37 a partir de 2027. Prazos específicos exigem ajuste das referências.

Os registros têm URL oficial, seção, resumo e período de validade. A base
inicial é revisada por atualização do SQL, sem importação automática de
novas edições. Quando a base não sustenta uma classificação, a interface pode
pedir detalhes ou sinalizar revisão. Quando há uma classe comparável na tabela da CAGE/RS, a tela mostra vida útil e residual de referência. A depreciação anual linear corresponde a 100% dividido pela vida útil e incide sobre o valor depreciável. O valor de aquisição opcional é usado no navegador para calcular o residual, a base depreciável e a despesa anual em reais. O grupo informado é enviado como contexto. Use a política do órgão para homologar os parâmetros. Com a Groq configurada, a análise tem um limite de 10 segundos. No fluxo Gemini, a API repete uma vez em caso de 503 ou tempo limite. Se a análise permanecer indisponível, a tela exibe as fontes
recuperadas com seus resumos e sinaliza a ausência de classificação. A consulta
não registra histórico no banco.

Fontes: [MCASP](https://www.gov.br/tesouronacional/pt-br/contabilidade-e-custos/manuais/manual-de-contabilidade-aplicada-ao-setor-publico-mcasp-1),
[NBC TSP](https://cfc.org.br/tecnica/normas-brasileiras-de-contabilidade/nbc-tsp-do-setor-publico/)
e [preços da API Gemini](https://ai.google.dev/gemini-api/docs/pricing).

# Patrimônio AI

Assistente de classificação de bens patrimoniais. O Gemini indica uma espécie compatível com a descrição. O grupo, a vida útil e o percentual residual exibidos vêm do catálogo do Supabase. Consultas classificadas são gravadas no histórico. A sugestão deve ser conferida antes do cadastro.

## Testar no computador

Instale o Node.js 24. Abra o terminal na pasta que contém o `package.json` e rode:

```sh
npm ci
npm run dev
```

Abra [localhost:3000](http://localhost:3000) e clique em um dos exemplos. Por padrão, o aplicativo abre em demonstração com dados fictícios, sem depender de serviços externos. Para verificar a versão de produção, execute `npm run build`.

## Preparar o catálogo real

1. Em um projeto Supabase novo, abra **SQL Editor** e execute [supabase/schema.sql](supabase/schema.sql). Se você já tem as tabelas, confira a estrutura e as permissões antes de aplicar o script. Ele restringe o acesso direto pelo navegador. Use um projeto dedicado se as mesmas tabelas atendem a outros aplicativos.
2. No **Table Editor**, insira seus grupos em `grupos_patrimonio`. Insira suas espécies em `especies_patrimonio` e preencha `grupo_id` com o ID do grupo correspondente. Use os parâmetros da tabela patrimonial da entidade. Deixe em branco os parâmetros ainda indefinidos.
3. Copie `.env.example` para `.env.local` para testar o catálogo real no computador. Configure as variáveis abaixo. Mantenha os valores reais fora do Git.

| Variável | Valor |
| --- | --- |
| `APP_MODE` | `live` para consultar o catálogo real ou `demo` para a demonstração |
| `SUPABASE_URL` | URL do projeto Supabase, como `https://seu-projeto.supabase.co` |
| `SUPABASE_SECRET_KEY` | Chave **Secret** em **Supabase → Settings → API Keys**. A chave legada `service_role` também funciona. A chave anon ou publishable não serve para este fluxo. |
| `GEMINI_API_KEY` | Chave criada no [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | Opcional. Por padrão, `gemini-flash-latest`. Pode ser substituído por um modelo compatível com saída estruturada disponível na sua conta. |

Ao usar uma base existente, a aplicação espera `especies_patrimonio.id`, o relacionamento de chave estrangeira com `grupos_patrimonio` e as colunas de leitura e histórico definidas no SQL. O script não altera a estrutura de tabelas existentes. O Supabase e o Gemini são chamados no servidor. No modo real, a descrição informada e os nomes de grupos e espécies seguem para o Gemini.

## Enviar ao GitHub

Crie um repositório vazio, sem adicionar README ou .gitignore pelo GitHub, e rode os comandos na pasta do projeto. Substitua `SEU_USUARIO` pelo nome da sua conta ou organização.

```sh
git init
git add .
git status --short
git commit -m "Preparar Patrimônio AI"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/patrimonio-ai.git
git push -u origin main
```

## Importar na Vercel

1. Na Vercel, abra **Add New → Project**, conecte o GitHub e clique em **Import** no repositório.
2. Use o preset **Next.js**, a raiz que contém o `package.json` e Node.js 24. A Vercel detecta o comando de build.
3. Para publicar a demonstração, clique em **Deploy**. Para conectar o catálogo real, preencha **Environment Variables** com as variáveis da tabela e configure `APP_MODE=live`. Se alterar variáveis após publicar, gere um novo deploy.
4. Para uso interno com dados reais, restrinja o acesso ao deploy antes de liberar o link. A aplicação não implementa login próprio, e a API de classificação consome a cota do Gemini. Depois, teste uma espécie do seu catálogo e confirme o registro em `consultas_patrimonio`.

Referências oficiais: [Next.js](https://nextjs.org/support-policy), [variáveis na Vercel](https://vercel.com/docs/environment-variables/managing-environment-variables) e [chaves do Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

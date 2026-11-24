-- Base federal inicial para consultas patrimoniais. Executar no SQL Editor.
-- As sínteses podem ser atualizadas junto com as referências e datas de vigência.
begin;

create table if not exists public.trechos_normativos_patrimonio (
  id text primary key,
  document text not null,
  section text not null,
  url text not null check (url ~ '^https://'),
  summary text not null,
  termos_busca text not null,
  referencia_basica boolean not null default false,
  inicio_vigencia date not null,
  fim_vigencia date,
  check (fim_vigencia is null or fim_vigencia >= inicio_vigencia)
);

alter table public.trechos_normativos_patrimonio enable row level security;
revoke all on public.trechos_normativos_patrimonio from public, anon, authenticated;
grant select on public.trechos_normativos_patrimonio to service_role;

create or replace function public.buscar_trechos_normativos(descricao text)
returns table (id text, document text, section text, url text, summary text)
language sql
stable
security invoker
set search_path = ''
as $$
  with consulta as (
    select
      pg_catalog.array_to_string(
        pg_catalog.tsvector_to_array(pg_catalog.to_tsvector('pg_catalog.portuguese', descricao)),
        ' OR '
      ) as termos,
      (now() at time zone 'America/Sao_Paulo')::date as data_referencia
  ),
  resultados as (
    select
      t.*,
      pg_catalog.ts_rank(
        pg_catalog.to_tsvector('pg_catalog.portuguese', t.termos_busca || ' ' || t.summary),
        pg_catalog.websearch_to_tsquery('pg_catalog.simple', c.termos)
      ) as relevancia
    from public.trechos_normativos_patrimonio t
    cross join consulta c
    where t.inicio_vigencia <= c.data_referencia
      and (t.fim_vigencia is null or t.fim_vigencia >= c.data_referencia)
  )
  select r.id, r.document, r.section, r.url, r.summary
  from resultados r
  where r.referencia_basica or r.relevancia > 0
  order by r.relevancia desc, r.id
  limit 8
$$;

revoke all on function public.buscar_trechos_normativos(text) from public, anon, authenticated;
grant execute on function public.buscar_trechos_normativos(text) to service_role;

-- Sínteses editoriais. Os links permitem consultar o texto oficial integral.
with fontes as (
  select
    'https://cdn.tesouro.gov.br/sistemas-internos/apex/producao/sistemas/thot/arquivos/publicacoes/51045_2434252/MCASP%20-%2011%C2%AA%20Edi%C3%A7%C3%A3o.pdf' as mcasp,
    'https://www2.cfc.org.br/sisweb/sre/detalhes_sre.aspx?Codigo=2017%2FNBCTSP07&arquivo=NBCTSP07.docx' as nbc07,
    'https://www2.cfc.org.br/sisweb/sre/detalhes_sre.aspx?Codigo=2025%2FNBCTSP37&arquivo=NBC_TSP_37.docx' as nbc37
)
insert into public.trechos_normativos_patrimonio
  (id, document, section, url, summary, termos_busca, referencia_basica, inicio_vigencia, fim_vigencia)
select v.id, v.document, v.section,
  case v.fonte when 'nbc07' then f.nbc07 when 'nbc37' then f.nbc37 else f.mcasp end,
  v.summary, v.termos, v.basica, v.inicio::date, v.fim::date
from fontes f
cross join (values
  ('mcasp-consumo', 'MCASP · 11ª edição', 'Parte I, seção 4.6.1.1', 'mcasp',
   'A classificação orçamentária distingue material de consumo de material permanente. Examine durabilidade, fragilidade, perecibilidade, incorporabilidade e transformabilidade. A classificação da despesa e o controle patrimonial do item são análises distintas.',
   'consumo permanente reposição peça acessório papel toner cartucho bateria aquisição bem', true, '2025-01-01', null),
  ('mcasp-reconhecimento', 'MCASP · 11ª edição', 'Parte II, seções 11.1 e 11.2.1', 'mcasp',
   'O imobilizado compreende itens tangíveis destinados ao uso da entidade, com expectativa de utilização por mais de um período. O reconhecimento considera benefícios econômicos futuros ou potencial de serviços e a possibilidade de mensurar o custo ou valor com confiabilidade.',
   'celular smartphone notebook cadeira impressora equipamento veículo terreno mobiliário patrimônio ativo bem', true, '2025-01-01', null),
  ('mcasp-subsequente', 'MCASP · 11ª edição', 'Parte II, seção 11.2.5', 'mcasp',
   'Gastos usuais de manutenção são reconhecidos no resultado conforme incorridos. A substituição de componente pode integrar o valor contábil do bem se atender aos critérios de reconhecimento, com a baixa da parte substituída quando cabível.',
   'peça reposição substituição ampliação melhoria manutenção reparo componente memória bateria', false, '2025-01-01', null),
  ('mcasp-depreciacao', 'MCASP · 11ª edição', 'Parte II, seção 11.5', 'mcasp',
   'Para imobilizados com vida útil limitada, a depreciação se inicia quando o bem está disponível para uso. O ente estima vida útil e valor residual conforme a utilização, observando desgaste, obsolescência, benefícios esperados e eventuais limites legais ou contratuais. Terrenos em geral têm vida útil ilimitada e são tratados separadamente dos edifícios, que em geral são depreciáveis.',
   'depreciação residual vida útil veículo equipamento terreno edifício prédio uso bem', true, '2025-01-01', null),
  ('nbctsp07-imobilizado', 'NBC TSP 07', 'Ativo Imobilizado · definição e reconhecimento', 'nbc07',
   'A norma trata de itens tangíveis mantidos para fins operacionais ou administrativos, entre outros usos abrangidos, e com expectativa de uso por mais de um período. O reconhecimento considera o potencial de serviços ou benefícios futuros e uma mensuração confiável.',
   'imobilizado bem equipamento reconhecimento tangível potencial serviços', true, '2019-01-01', '2026-12-31'),
  ('nbctsp37-depreciacao', 'NBC TSP 37', 'Ativo Imobilizado · itens 47 e 48', 'nbc37',
   'O valor depreciável do ativo é alocado sistematicamente ao longo da vida útil estimada. A entidade revisa a vida útil e o valor residual ao menos no encerramento de cada exercício e trata alterações como mudanças de estimativa contábil.',
   'depreciação vida útil estimativa residual imobilizado bem', true, '2027-01-01', null)
) as v(id, document, section, fonte, summary, termos, basica, inicio, fim)
on conflict (id) do update set
  document = excluded.document,
  section = excluded.section,
  url = excluded.url,
  summary = excluded.summary,
  termos_busca = excluded.termos_busca,
  referencia_basica = excluded.referencia_basica,
  inicio_vigencia = excluded.inicio_vigencia,
  fim_vigencia = excluded.fim_vigencia;

commit;

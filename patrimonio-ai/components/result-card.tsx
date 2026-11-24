import { CircleCheck, CircleHelp, FileText } from 'lucide-react';
import type { Classification } from '@/lib/classification';

import { benchmarkSource, calculateDepreciation } from '@/lib/depreciation';

const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const depreciationLabels = {
  entity: 'A definir pela entidade',
  not_applicable: 'Não aplicável ao enquadramento sugerido',
  uncertain: 'Requer avaliação',
};

export default function ResultCard({ data, query, group, acquisition }: {
  data: Classification; query: string; group: string; acquisition?: number;
}) {
  const answered = data.status === 'answered';
  const sourcesOnly = data.status === 'sources_only';
  const parameters = depreciationLabels[data.depreciation ?? 'uncertain'];

  const benchmark = data.benchmark;
  const estimates = benchmark && calculateDepreciation(benchmark, acquisition);

  return (
    <section className="result">
      <h2>
        {answered ? <CircleCheck size={22} aria-hidden="true" /> : <CircleHelp size={22} aria-hidden="true" />}
        {answered ? 'Orientação patrimonial' : sourcesOnly ? 'Referências disponíveis' : 'Consulta precisa de revisão'}
      </h2>
      <p className="query">{query}</p>
      {answered && (
        <dl className="result-grid">
          <div className="framing"><dt>Enquadramento provável</dt><dd>{data.framing}</dd></div>
          <div><dt>{group ? 'Grupo informado' : 'Grupo sugerido'}</dt><dd>{group || data.group || 'A confirmar'}</dd></div>
          <div><dt>Espécie sugerida</dt><dd>{data.species || 'A confirmar'}</dd></div>
          <div><dt>Vida útil de referência</dt><dd>{benchmark ? `${benchmark.years} anos` : parameters}</dd></div>
          <div><dt>Valor residual de referência</dt><dd>
            {estimates?.residual !== undefined ? reais.format(estimates.residual) : benchmark ? `${benchmark.residualPercent}% do valor de aquisição` : parameters}
            {estimates?.residual !== undefined && benchmark && <small>{benchmark.residualPercent}% do valor de aquisição</small>}
          </dd></div>
          <div><dt>Depreciação anual linear</dt><dd>
            {estimates ? `${number.format(estimates.annualRate)}%` : parameters}
            {estimates && <small>Sobre o valor depreciável</small>}
          </dd></div>
          {estimates?.depreciable !== undefined && <div><dt>Valor depreciável</dt><dd>{reais.format(estimates.depreciable)}</dd></div>}
          {estimates?.annualAmount !== undefined && <div><dt>Depreciação estimada por ano</dt><dd>{reais.format(estimates.annualAmount)}</dd></div>}
        </dl>
      )}
      {answered && benchmark && (
        <p className="estimate-note">
          <strong>Estimativa de referência.</strong> Classe comparável: {benchmark.label}. Use os parâmetros aprovados pelo seu órgão para o cadastro.
          {' '}<a href={benchmarkSource} target="_blank" rel="noreferrer">Tabela da CAGE/RS, seção 1.1.1.1</a>.
        </p>
      )}
      {answered && <h3>Motivo da orientação</h3>}
      <p>{data.reason}</p>
      {data.question && <p className="review-question"><strong>Para refazer a consulta:</strong> {data.question}</p>}
      {data.references.length > 0 && (
        <div className="references">
          <h3><FileText size={16} aria-hidden="true" /> {sourcesOnly ? 'Fontes para consulta' : 'Fundamentação'}</h3>
          <ul>
            {data.references.map((reference) => (
              <li key={reference.id}><a href={reference.url} target="_blank" rel="noreferrer">
                {reference.document} · {reference.section}
              </a>{reference.summary && <p>{reference.summary}</p>}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

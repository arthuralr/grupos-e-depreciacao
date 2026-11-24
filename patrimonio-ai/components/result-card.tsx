import { CircleCheck, CircleHelp, FileText } from 'lucide-react';
import type { Classification } from '@/lib/classification';

const depreciationLabels = {
  entity: 'A definir pela entidade',
  not_applicable: 'Não aplicável ao enquadramento sugerido',
  uncertain: 'Requer avaliação',
};

export default function ResultCard({ data, query }: { data: Classification; query: string }) {
  const answered = data.status === 'answered';
  const parameters = depreciationLabels[data.depreciation ?? 'uncertain'];

  return (
    <section className="result">
      <h2>
        {answered ? <CircleCheck size={22} aria-hidden="true" /> : <CircleHelp size={22} aria-hidden="true" />}
        {answered ? 'Orientação patrimonial' : 'Consulta precisa de revisão'}
      </h2>
      <p className="query">{query}</p>
      {answered && (
        <dl className="result-grid">
          <div className="framing"><dt>Enquadramento provável</dt><dd>{data.framing}</dd></div>
          <div><dt>Grupo sugerido</dt><dd>{data.group || 'A confirmar'}</dd></div>
          <div><dt>Espécie sugerida</dt><dd>{data.species || 'A confirmar'}</dd></div>
          <div><dt>Vida útil</dt><dd>{parameters}</dd></div>
          <div><dt>Valor residual</dt><dd>{parameters}</dd></div>
        </dl>
      )}
      {answered && <h3>Motivo da orientação</h3>}
      <p>{data.reason}</p>
      {data.question && <p className="review-question"><strong>Para refazer a consulta:</strong> {data.question}</p>}
      {data.references.length > 0 && (
        <div className="references">
          <h3><FileText size={16} aria-hidden="true" /> Fundamentação</h3>
          <ul>
            {data.references.map((reference) => (
              <li key={reference.id}><a href={reference.url} target="_blank" rel="noreferrer">
                {reference.document} · {reference.section}
              </a></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

import { CircleCheck, CircleHelp } from 'lucide-react';
import type { Classification } from '@/lib/classification';

const numberFormat = new Intl.NumberFormat('pt-BR');

export default function ResultCard({ data, query }: { data: Classification; query: string }) {
  if (data.status === 'review') {
    return (
      <section className="result review">
        <h2><CircleHelp size={22} aria-hidden="true" /> Consulta sem classificação</h2>
        <p className="query">{query}</p>
        <p>{data.reason}</p>
      </section>
    );
  }

  return (
    <section className="result">
      <h2><CircleCheck size={22} aria-hidden="true" /> Sugestão de classificação</h2>
      <p className="query">{query}</p>
      <dl className="result-grid">
        <div><dt>Grupo</dt><dd>{data.group}</dd></div>
        <div><dt>Espécie</dt><dd>{data.species}</dd></div>
        <div><dt>Vida útil</dt><dd>{data.life === null ? 'A definir no catálogo' : `${numberFormat.format(data.life)} ${data.life === 1 ? 'ano' : 'anos'}`}</dd></div>
        <div><dt>Valor residual</dt><dd>{data.residual === null ? 'A definir no catálogo' : `${numberFormat.format(data.residual)}%`}</dd></div>
      </dl>
      <h3>Motivo da sugestão</h3>
      <p>{data.reason}</p>
      {data.auditWarning && <p className="error">O histórico desta consulta não pôde ser gravado.</p>}
    </section>
  );
}

import { Boxes, CircleHelp, ClipboardList, Database } from 'lucide-react';
import SearchBar from '@/components/search-bar';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const demo = process.env.APP_MODE !== 'live';

  return (
    <>
      <section className="hero" aria-labelledby="title">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Gestão patrimonial</p>
          <h1 id="title">Classificação de<br className="desktop-break" /> bens patrimoniais</h1>
          <p className="hero-description">Descreva o bem para consultar o grupo, a espécie e os parâmetros de depreciação do catálogo.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-card art-back"><Database size={27} strokeWidth={1.5} /></div>
          <div className="art-card art-front"><Boxes size={36} strokeWidth={1.5} /></div>
          <div className="art-card art-small"><ClipboardList size={23} strokeWidth={1.5} /></div>
        </div>
      </section>

      <SearchBar demo={demo} />

      <details id="como-funciona" className="help">
        <summary><CircleHelp size={19} aria-hidden="true" /> Como funciona a classificação?</summary>
        <p>A descrição orienta a escolha de uma espécie. A vida útil e o percentual residual vêm do catálogo. Confira a sugestão e os parâmetros antes de cadastrar o bem.</p>
      </details>
    </>
  );
}

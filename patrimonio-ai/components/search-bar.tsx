'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, FlaskConical, Search } from 'lucide-react';
import { examples, maxTermLength, type Classification } from '@/lib/classification';
import { parseAcquisition } from '@/lib/depreciation';
import ResultCard from './result-card';

export default function SearchBar({ demo }: { demo: boolean }) {
  const [input, setInput] = useState('');
  const [group, setGroup] = useState('');
  const [price, setPrice] = useState('');
  const [submitted, setSubmitted] = useState<{ group: string; acquisition?: number }>({ group: '' });
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Classification | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function search(term: string, groupLabel: string, priceText: string) {
    const trimmed = term.trim();
    if (!trimmed || loading) return;

    const acquisition = parseAcquisition(priceText);
    if (priceText.trim() && acquisition === undefined) {
      setResult(null);
      setError('Informe um valor maior que zero, por exemplo 1.200,50.');
      return;
    }

    setSubmitted({ group: groupLabel.trim(), acquisition });
    setQuery(trimmed);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termo: trimmed, grupo: groupLabel.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(typeof data.error === 'string' ? data.error : 'A consulta falhou. Tente novamente.');
        return;
      }
      setResult(data);
    } catch {
      setError('Não foi possível concluir a consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search(input, group, price);
  }

  return (
    <>
      <section className="search-panel" aria-labelledby="search-title">
        <div className="panel-heading">
          <h2 id="search-title">Consultar um bem</h2>
          {demo && <span className="demo"><FlaskConical size={15} aria-hidden="true" /> Demonstração · exemplos ilustrativos</span>}
        </div>
        <form onSubmit={submit}>
          <label htmlFor="description">Descrição do bem</label>
          <div className="form-row">
            <div className="field">
              <Search size={20} aria-hidden="true" />
              <input
                id="description"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ex.: cadeira giratória de escritório"
                maxLength={maxTermLength}
                required
                disabled={loading}
              />
            </div>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'Consultando…' : 'Consultar'} <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="optional-fields">
            <div>
              <label htmlFor="group">Grupo no sistema <small>(opcional)</small></label>
              <input id="group" value={group} onChange={(event) => setGroup(event.target.value)}
                placeholder="Ex.: Mobiliário em geral" maxLength={120} disabled={loading} />
            </div>
            <div>
              <label htmlFor="acquisition">Valor de aquisição em R$ <small>(opcional)</small></label>
              <input id="acquisition" value={price} onChange={(event) => setPrice(event.target.value)}
                placeholder="Ex.: 800,00" inputMode="decimal" maxLength={22} disabled={loading} />
            </div>
          </div>
        </form>
        <div className="examples">
          <span>Experimente</span>
          {examples.map(({ term }) => (
            <button type="button" key={term} disabled={loading} onClick={() => {
              setInput(term);
              setGroup('');
              setPrice('');
              void search(term, '', '');
            }}>{term}</button>
          ))}
        </div>
      </section>

      <div aria-live="polite" aria-atomic="true">
        {loading && <p className="status">Consultando a fundamentação…</p>}
        {error && <p className="status error" role="alert">{error}</p>}
        {result && <ResultCard data={result} query={query} group={submitted.group} acquisition={submitted.acquisition} />}
      </div>
    </>
  );
}

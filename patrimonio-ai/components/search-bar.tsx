'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, FlaskConical, Search } from 'lucide-react';
import { examples, maxTermLength, type Classification } from '@/lib/classification';
import ResultCard from './result-card';

export default function SearchBar({ demo }: { demo: boolean }) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Classification | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function search(term: string) {
    const trimmed = term.trim();
    if (!trimmed || loading) return;

    setQuery(trimmed);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termo: trimmed }),
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
    void search(input);
  }

  return (
    <>
      <section className="search-panel" aria-labelledby="search-title">
        <div className="panel-heading">
          <h2 id="search-title">Consultar um bem</h2>
          {demo && <span className="demo"><FlaskConical size={15} aria-hidden="true" /> Demonstração · dados fictícios</span>}
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
        </form>
        <div className="examples">
          <span>Experimente</span>
          {examples.map(({ term }) => (
            <button type="button" key={term} disabled={loading} onClick={() => {
              setInput(term);
              void search(term);
            }}>{term}</button>
          ))}
        </div>
      </section>

      <div aria-live="polite" aria-atomic="true">
        {loading && <p className="status">Buscando uma espécie compatível…</p>}
        {error && <p className="status error" role="alert">{error}</p>}
        {result && <ResultCard data={result} query={query} />}
      </div>
    </>
  );
}

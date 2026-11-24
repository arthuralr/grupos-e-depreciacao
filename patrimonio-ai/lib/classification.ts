import type { Benchmark } from './depreciation';

export const examples = [
  { term: 'Celular para uso da Câmara', group: 'Equipamentos de comunicação', species: 'Telefone celular', benchmark: 'communication' },
  { term: 'Cadeira giratória de escritório', group: 'Móveis e utensílios', species: 'Cadeira de escritório', benchmark: 'furniture' },
  { term: 'Notebook para uso administrativo', group: 'Equipamentos de informática', species: 'Computador portátil', benchmark: 'computers' },
] as const;

export const maxTermLength = 240;

export type Reference = { id: string; document: string; section: string; url: string };
export type NormativeExcerpt = Reference & { summary: string };

export type Classification = {
  status: 'answered' | 'review' | 'sources_only';
  reason: string;
  references: Array<Reference & { summary?: string }>;
  group?: string;
  benchmark?: Benchmark;
  species?: string;
  framing?: string;
  depreciation?: 'entity' | 'not_applicable' | 'uncertain';
  question?: string;
};

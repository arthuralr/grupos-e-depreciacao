export const examples = [
  { term: 'Celular para uso da Câmara', group: 'Equipamentos de comunicação', species: 'Telefone celular' },
  { term: 'Cadeira giratória de escritório', group: 'Móveis e utensílios', species: 'Cadeira de escritório' },
  { term: 'Notebook para uso administrativo', group: 'Equipamentos de informática', species: 'Computador portátil' },
];

export const maxTermLength = 240;

export type Reference = { id: string; document: string; section: string; url: string };
export type NormativeExcerpt = Reference & { summary: string };

export type Classification = {
  status: 'answered' | 'review' | 'sources_only';
  reason: string;
  references: Array<Reference & { summary?: string }>;
  group?: string;
  species?: string;
  framing?: string;
  depreciation?: 'entity' | 'not_applicable' | 'uncertain';
  question?: string;
};

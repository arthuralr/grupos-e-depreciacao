export const examples = [
  { term: 'Notebook Dell', group: 'Equipamentos de informática', species: 'Computadores portáteis', life: 5, residual: 10 },
  { term: 'Cadeira giratória', group: 'Mobiliário', species: 'Cadeiras de escritório', life: 10, residual: 10 },
  { term: 'Impressora laser', group: 'Equipamentos de informática', species: 'Impressoras', life: 5, residual: 10 },
];

export const maxTermLength = 160;

export type Classification =
  | { status: 'review'; reason: string }
  | {
      status: 'matched';
      group: string;
      species: string;
      life: number | null;
      residual: number | null;
      reason: string;
      auditWarning?: boolean;
    };

export function normalizeTerm(term: string) {
  return term.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

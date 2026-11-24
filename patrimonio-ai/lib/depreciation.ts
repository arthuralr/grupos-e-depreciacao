export const benchmarkClasses = {
  machinery: { label: 'Máquinas, aparelhos, equipamentos e ferramentas', years: 10, residualPercent: 10 },
  computers: { label: 'Bens de informática', years: 5, residualPercent: 10 },
  household: { label: 'Aparelhos e utensílios domésticos', years: 10, residualPercent: 10 },
  office: { label: 'Máquinas e utensílios de escritório', years: 10, residualPercent: 10 },
  furniture: { label: 'Mobiliário em geral', years: 10, residualPercent: 10 },
  utensils: { label: 'Utensílios em geral', years: 10, residualPercent: 10 },
  communication: { label: 'Materiais culturais, educacionais e de comunicação', years: 10, residualPercent: 10 },
  vehicles: { label: 'Veículos', years: 15, residualPercent: 10 },
} as const;

export const benchmarkSource = 'https://cage.fazenda.rs.gov.br/upload/arquivos/202503/26143323-20221004170653guia-de-lancamentos-imobilizado-30-09-2022.pdf#page=5';

export type Benchmark = (typeof benchmarkClasses)[keyof typeof benchmarkClasses];

export function findBenchmark(key: unknown) {
  return typeof key === 'string' && Object.hasOwn(benchmarkClasses, key)
    ? benchmarkClasses[key as keyof typeof benchmarkClasses]
    : undefined;
}

export function calculateDepreciation(benchmark: Benchmark, acquisition?: number) {
  const annualRate = 100 / benchmark.years;
  if (acquisition === undefined) return { annualRate };

  const residual = acquisition * benchmark.residualPercent / 100;
  const depreciable = acquisition - residual;
  return { annualRate, residual, depreciable, annualAmount: depreciable / benchmark.years };
}

export function parseAcquisition(value: string) {
  const amount = value.trim();
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(amount)) return;
  const parsed = Number(amount.replaceAll('.', '').replace(',', '.'));
  if (parsed > 0 && Number.isSafeInteger(Math.round(parsed * 100))) return parsed;
}

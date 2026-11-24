import { NextResponse } from 'next/server';
import { examples, maxTermLength, type Classification, type NormativeExcerpt } from '@/lib/classification';
import { consultNorms } from '@/lib/gemini';
import { getSupabase } from '@/lib/supabase';

export const maxDuration = 45;

function isExcerpt(value: unknown): value is NormativeExcerpt {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === 'string' && typeof entry.document === 'string' &&
    typeof entry.section === 'string' && typeof entry.summary === 'string' &&
    typeof entry.url === 'string' && entry.url.startsWith('https://');
}

export async function POST(request: Request) {
  const body: { termo?: unknown } | null = await request.json().catch(() => null);
  const term = typeof body?.termo === 'string' ? body.termo.trim() : '';

  if (!term || term.length > maxTermLength) {
    return NextResponse.json({ error: `Informe uma descrição com até ${maxTermLength} caracteres.` }, { status: 400 });
  }

  if (process.env.APP_MODE !== 'live') {
    const example = examples.find((item) => item.term.toLowerCase() === term.toLowerCase());
    return NextResponse.json<Classification>(example ? {
      status: 'answered',
      framing: 'Possível bem móvel do ativo imobilizado',
      group: example.group,
      species: example.species,
      depreciation: 'entity',
      reason: 'Exemplo ilustrativo para uso institucional. A consulta às fontes oficiais está disponível no modo real.',
      references: [],
    } : {
      status: 'review',
      reason: 'Escolha um dos exemplos para ver como a resposta é apresentada no modo de demonstração.',
      references: [],
    });
  }

  try {
    const supabase = getSupabase();
    const { data: excerpts, error } = await supabase
      .rpc('buscar_trechos_normativos', { descricao: term });

    if (error) throw new Error(`Falha na busca normativa (${error.code})`);

    if (!Array.isArray(excerpts) || !excerpts.every(isExcerpt)) {
      throw new Error('Resposta da busca normativa fora do formato esperado');
    }

    if (excerpts.length === 0) {
      return NextResponse.json({ error: 'A base normativa está sem referências disponíveis para a data atual.' }, { status: 503 });
    }

    try {
      return NextResponse.json(await consultNorms(term, excerpts));
    } catch (error) {
      console.error('Falha na análise Gemini', error instanceof Error ? error.message : 'Erro desconhecido');
      return NextResponse.json<Classification>({
        status: 'sources_only',
        reason: 'A classificação automática está indisponível. Você pode consultar as referências recuperadas abaixo enquanto isso.',
        references: excerpts,
      });
    }
  } catch (error) {
    console.error('Falha na consulta normativa', error instanceof Error ? error.message : 'Erro desconhecido');
    return NextResponse.json({ error: 'A consulta está indisponível no momento. Tente novamente em instantes.' }, { status: 502 });
  }
}

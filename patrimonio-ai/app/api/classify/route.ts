import { NextResponse } from 'next/server';
import { examples, maxTermLength, normalizeTerm, type Classification } from '@/lib/classification';
import { chooseSpecies } from '@/lib/gemini';
import { getSupabase } from '@/lib/supabase';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body: { termo?: unknown } | null = await request.json().catch(() => null);
  const term = typeof body?.termo === 'string' ? body.termo.trim() : '';

  if (!term || term.length > maxTermLength) {
    return NextResponse.json({ error: `Informe uma descrição com até ${maxTermLength} caracteres.` }, { status: 400 });
  }

  if (process.env.APP_MODE !== 'live') {
    const example = examples.find((item) => normalizeTerm(item.term) === normalizeTerm(term));
    const result: Classification = example
      ? {
          status: 'matched',
          group: example.group,
          species: example.species,
          life: example.life,
          residual: example.residual,
          reason: 'Este exemplo usa uma espécie e parâmetros fictícios para demonstrar a tela de resultado.',
        }
      : { status: 'review', reason: 'Use uma das sugestões da tela para consultar o catálogo demonstrativo.' };
    return NextResponse.json(result);
  }

  try {
    const supabase = getSupabase();
    const pageSize = 250;
    const catalog = [];
    for (let offset = 0; ;) {
      const { data, error } = await supabase.from('especies_patrimonio')
        .select('nome, vida_util_anos, valor_residual_percentual, grupos_patrimonio!inner(nome)')
        .order('id')
        .range(offset, offset + pageSize - 1)
        .overrideTypes<Array<{
          nome: string;
          vida_util_anos: number | null;
          valor_residual_percentual: number | null;
          grupos_patrimonio: { nome: string };
        }>, { merge: false }>();

      if (error) throw new Error(`Erro no catálogo (${error.code})`);
      catalog.push(...data);
      if (data.length === 0) break;
      // Alguns projetos configuram um limite por resposta inferior ao tamanho da página.
      offset += data.length;
    }

    if (catalog.length === 0) {
      return NextResponse.json({ error: 'O catálogo está vazio. Cadastre os grupos e as espécies para começar.' }, { status: 503 });
    }

    const candidates = catalog.map((item) => ({
      group: item.grupos_patrimonio.nome,
      species: item.nome,
    }));
    const choice = await chooseSpecies(term, candidates);
    if (choice.index === -1) {
      return NextResponse.json<Classification>({ status: 'review', reason: choice.reason });
    }

    const selected = catalog[choice.index];
    const result: Classification = {
      status: 'matched',
      ...candidates[choice.index],
      life: selected.vida_util_anos,
      residual: selected.valor_residual_percentual,
      reason: choice.reason,
    };

    const { error: auditError } = await supabase.from('consultas_patrimonio').insert({
      termo_pesquisado: term,
      grupo_sugerido: result.group,
      especie_sugerida: result.species,
      vida_util_sugerida: result.life,
      valor_residual_sugerido: result.residual,
    });

    if (auditError) {
      console.error('Falha no histórico de classificação', auditError.code);
      result.auditWarning = true;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Falha na classificação', error instanceof Error ? error.message : 'Erro desconhecido');
    return NextResponse.json({ error: 'A consulta está indisponível no momento. Tente novamente em instantes.' }, { status: 502 });
  }
}

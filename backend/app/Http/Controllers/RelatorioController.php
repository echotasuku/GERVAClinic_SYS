<?php

namespace App\Http\Controllers;

use App\Models\Aplicacao;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class RelatorioController extends Controller
{
    public function index()
    {
        $dados = Aplicacao::with([
            'paciente',
            'profissional',
            'estoque' => function ($query) {
                $query->with('vacina');
            }
        ])->get();

        return response()->json($dados);
    }

    public function exportar(Request $request)
    {
        // =========================================================
        // INICIAR CONSULTA
        // =========================================================

        $query = Aplicacao::with([
            'paciente',
            'profissional',
            'estoque' => function ($query) {
                $query->with('vacina');
            }
        ]);

        // =========================================================
        // FILTRO POR PACIENTE
        //
        // O React envia:
        //
        // pacientes[]=1
        // pacientes[]=2
        //
        // whereIn significa:
        // paciente 1 OU paciente 2
        // =========================================================

        if ($request->filled('pacientes')) {

            $pacientes = $request->input('pacientes');

            if (is_array($pacientes) && count($pacientes) > 0) {

                $query->whereIn(
                    'paciente_id',
                    $pacientes
                );
            }
        }

        // =========================================================
        // FILTRO POR VACINA / ESTOQUE
        //
        // No React, o valor enviado é o ID do estoque.
        //
        // Exemplo:
        //
        // vacinas[]=5
        //
        // Então filtramos pelo estoque_id.
        // =========================================================

        if ($request->filled('vacinas')) {

            $vacinas = $request->input('vacinas');

            if (is_array($vacinas) && count($vacinas) > 0) {

                $query->whereIn(
                    'estoque_id',
                    $vacinas
                );
            }
        }

        // =========================================================
        // BUSCA TEXTUAL
        //
        // A busca procura por:
        //
        // - paciente
        // - vacina
        // - lote
        // - profissional
        // - observações
        // - data
        // - hora
        //
        // Os campos da busca funcionam como OU.
        //
        // Porém, a busca continua respeitando os filtros
        // de paciente e vacina aplicados acima.
        // =========================================================

        if ($request->filled('busca')) {

            $busca = trim(
                $request->input('busca')
            );

            if ($busca !== '') {

                $query->where(function ($q) use ($busca) {

                    // -------------------------------------------------
                    // PACIENTE
                    // -------------------------------------------------

                    $q->whereHas('paciente', function ($q) use ($busca) {

                        $q->where(
                            'nome',
                            'like',
                            "%{$busca}%"
                        );

                    })

                    // -------------------------------------------------
                    // VACINA
                    // -------------------------------------------------

                    ->orWhereHas('estoque.vacina', function ($q) use ($busca) {

                        $q->where(
                            'nome',
                            'like',
                            "%{$busca}%"
                        );

                    })

                    // -------------------------------------------------
                    // LOTE
                    // -------------------------------------------------

                    ->orWhereHas('estoque', function ($q) use ($busca) {

                        $q->where(
                            'lote',
                            'like',
                            "%{$busca}%"
                        );

                    })

                    // -------------------------------------------------
                    // PROFISSIONAL
                    // -------------------------------------------------

                    ->orWhereHas('profissional', function ($q) use ($busca) {

                        $q->where(
                            'nome',
                            'like',
                            "%{$busca}%"
                        );

                    })

                    // -------------------------------------------------
                    // OBSERVAÇÕES
                    // -------------------------------------------------

                    ->orWhere(
                        'observacoes',
                        'like',
                        "%{$busca}%"
                    )

                    // -------------------------------------------------
                    // DATA
                    // -------------------------------------------------

                    ->orWhere(
                        'data_aplicacao',
                        'like',
                        "%{$busca}%"
                    )

                    // -------------------------------------------------
                    // HORA
                    // -------------------------------------------------

                    ->orWhere(
                        'hora_aplicacao',
                        'like',
                        "%{$busca}%"
                    );
                });
            }
        }

        // =========================================================
        // BUSCAR RESULTADOS
        //
        // Ordena primeiro pela data mais recente e depois pela hora.
        // =========================================================

        $dados = $query
            ->orderBy(
                'data_aplicacao',
                'desc'
            )
            ->orderBy(
                'hora_aplicacao',
                'desc'
            )
            ->get();

        // =========================================================
        // GERAR PDF
        // =========================================================

        $pdf = Pdf::loadView('relatorios.pdf', [
            'dados' => $dados
        ]);

        // =========================================================
        // DOWNLOAD
        // =========================================================

        return $pdf->download(
            'relatorio-aplicacoes.pdf'
        );
    }
}
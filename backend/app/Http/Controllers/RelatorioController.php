<?php

namespace App\Http\Controllers;

use App\Models\Aplicacao;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
        $query = Aplicacao::with([
            'paciente',
            'profissional',
            'estoque' => function ($query) {
                $query->with('vacina');
            }
        ]);

        if ($request->filled('pacientes')) {
            $pacientes = $request->input('pacientes');
            if (is_array($pacientes) && count($pacientes) > 0) {
                $query->whereIn('paciente_id', $pacientes);
            }
        }

        if ($request->filled('vacinas')) {
            $vacinas = $request->input('vacinas');
            if (is_array($vacinas) && count($vacinas) > 0) {
                $query->whereIn('estoque_id', $vacinas);
            }
        }

        if ($request->filled('busca')) {
            $busca = trim($request->input('busca'));
            if ($busca !== '') {
                $query->where(function ($q) use ($busca) {
                    $q->whereHas('paciente', function ($q) use ($busca) {
                            $q->where('nome', 'like', "%{$busca}%");
                        })
                        ->orWhereHas('estoque.vacina', function ($q) use ($busca) {
                            $q->where('nome', 'like', "%{$busca}%");
                        })
                        ->orWhereHas('estoque', function ($q) use ($busca) {
                            $q->where('lote', 'like', "%{$busca}%");
                        })
                        ->orWhereHas('profissional', function ($q) use ($busca) {
                            $q->where('nome', 'like', "%{$busca}%");
                        })
                        ->orWhere('observacoes', 'like', "%{$busca}%")
                        ->orWhere('data_aplicacao', 'like', "%{$busca}%")
                        ->orWhere('hora_aplicacao', 'like', "%{$busca}%");
                });
            }
        }

        $dados = $query
            ->orderBy('data_aplicacao', 'desc')
            ->orderBy('hora_aplicacao', 'desc')
            ->get();

        // Formata a data e a hora para exibicao no PDF
        foreach ($dados as $item) {
            $item->data_formatada = $item->data_aplicacao 
                ? Carbon::parse($item->data_aplicacao)->format('d/m/Y') 
                : '-';
                
            $item->hora_formatada = $item->hora_aplicacao 
                ? Carbon::parse($item->hora_aplicacao)->format('H:i') 
                : '-';
        }

        $pdf = Pdf::loadView('relatorios.pdf', [
            'dados' => $dados
        ]);

        return $pdf->download('relatorio-aplicacoes.pdf');
    }
}
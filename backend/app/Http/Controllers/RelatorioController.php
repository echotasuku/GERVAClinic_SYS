<?php

namespace App\Http\Controllers;

use App\Models\Aplicacao;
use Barryvdh\DomPDF\Facade\Pdf;

class RelatorioController extends Controller
{
    public function index()
    {
        $dados = Aplicacao::with([
            'paciente',
            'estoque.vacina',
            'profissional'
        ])->get();

        return response()->json($dados);
    }

    public function exportar()
    {
        $dados = Aplicacao::with([
            'paciente',
            'estoque.vacina',
            'profissional'
        ])->get();

        $pdf = Pdf::loadView('relatorios.pdf', [
            'dados' => $dados
        ]);

        return $pdf->download('relatorio-aplicacoes.pdf');
    }
}
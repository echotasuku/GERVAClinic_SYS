<?php

namespace App\Http\Controllers;

use App\Models\Aplicacao;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class CarteiraVacinalController extends Controller
{
    // ✅ MÉTODO SHOW — FALTAVA! É chamado pelo frontend
    public function show($pacienteId)
    {
        $paciente = Paciente::findOrFail($pacienteId);

        $aplicacoes = Aplicacao::with([
            'estoque.vacina',
            'profissional'
        ])
        ->where('paciente_id', $pacienteId) // ✅ Confirme se a coluna se chama realmente "paciente_id"
        ->orderBy('data_aplicacao', 'ASC')
        ->orderBy('hora_aplicacao', 'ASC')
        ->get();

        // ✅ Retorna EXATAMENTE o formato que o React espera
        return response()->json([
            'paciente'   => $paciente,
            'aplicacoes' => $aplicacoes
        ]);
    }


    // ✅ MÉTODO EXPORTAR — para download em PDF
    public function exportar($pacienteId)
    {
        $paciente = Paciente::findOrFail($pacienteId);

        $aplicacoes = Aplicacao::with([
            'estoque.vacina',
            'profissional'
        ])
        ->where('paciente_id', $pacienteId)
        ->orderBy('data_aplicacao', 'ASC')
        ->orderBy('hora_aplicacao', 'ASC')
        ->get();

        $pdf = Pdf::loadView('carteira-vacinal.pdf', [
            'paciente'   => $paciente,
            'aplicacoes' => $aplicacoes
        ]);

        return $pdf->download(
            'carteira-vacinal-' . preg_replace('/\s+/', '-', $paciente->nome) . '.pdf'
        );
    }
}
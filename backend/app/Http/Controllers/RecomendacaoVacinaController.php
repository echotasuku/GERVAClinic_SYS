<?php

namespace App\Http\Controllers;

use App\Models\RecomendacaoVacina;
use App\Models\Paciente;
use App\Models\Vacina;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecomendacaoVacinaController extends Controller
{
    public function index()
    {
        return RecomendacaoVacina::with(['paciente', 'vacina'])->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'paciente_id' => 'required|exists:pacientes,id',
            'vacina_id' => 'required|exists:vacinas,id',
            'data_recomendada' => 'required|date',
            'status' => 'required|in:pendente,aplicada',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $recomendacao = RecomendacaoVacina::create($request->all());
        return response()->json($recomendacao, 201);
    }

    public function show($id)
    {
        return RecomendacaoVacina::with(['paciente', 'vacina'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $recomendacao = RecomendacaoVacina::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'paciente_id' => 'required|exists:pacientes,id',
            'vacina_id' => 'required|exists:vacinas,id',
            'data_recomendada' => 'required|date',
            'status' => 'required|in:pendente,aplicada',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $recomendacao->update($request->all());
        return response()->json($recomendacao);
    }

    public function destroy($id)
    {
        $recomendacao = RecomendacaoVacina::findOrFail($id);
        $recomendacao->delete();
        return response()->noContent();
    }

    /**
     * Gera recomendações automáticas para um paciente
     */
    public function gerarAutomaticas($pacienteId)
    {
        $paciente = Paciente::with('aplicacoes')->findOrFail($pacienteId);
        $vacinas = Vacina::all();

        $recomendacoesCriadas = [];

        foreach ($vacinas as $vacina) {
            // Se o paciente não tem aplicação dessa vacina
            $jaAplicada = $paciente->aplicacoes->where('vacina_id', $vacina->id)->count() > 0;

            if (!$jaAplicada) {
                $recomendacao = RecomendacaoVacina::firstOrCreate([
                    'paciente_id' => $paciente->id,
                    'vacina_id' => $vacina->id,
                ], [
                    'data_recomendada' => now(),
                    'status' => 'pendente',
                ]);

                $recomendacoesCriadas[] = $recomendacao;
            }
        }

        return response()->json($recomendacoesCriadas);
    }
}

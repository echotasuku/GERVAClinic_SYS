<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CalendarioVacinal;
use App\Models\EsquemaVacinal;
use App\Models\Aplicacao;
use App\Models\RecomendacaoVacina;

class CalendarioVacinalController extends Controller
{
    /**
     * Listar todos os calendários vacinais
     */
    public function index()
    {
        return CalendarioVacinal::with('vacina')->get();
    }

    /**
     * Criar um novo calendário vacinal
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'faixa_etaria' => 'required|string',
            'vacina_id' => 'required|exists:vacinas,id',
            'dose' => 'required|string',
            'intervalo_dias' => 'nullable|integer',
            'observacoes' => 'nullable|string',
        ]);

        return CalendarioVacinal::create($data);
    }

    /**
     * Mostrar um calendário vacinal específico
     */
    public function show(string $id)
    {
        return CalendarioVacinal::with('vacina')->findOrFail($id);
    }

    /**
     * Atualizar um calendário vacinal
     */
    public function update(Request $request, string $id)
    {
        $calendario = CalendarioVacinal::findOrFail($id);

        $data = $request->validate([
            'faixa_etaria' => 'required|string',
            'vacina_id' => 'required|exists:vacinas,id',
            'dose' => 'required|string',
            'intervalo_dias' => 'nullable|integer',
            'observacoes' => 'nullable|string',
        ]);

        $calendario->update($data);

        return $calendario;
    }

    /**
     * Remover um calendário vacinal
     */
    public function destroy(string $id)
    {
        CalendarioVacinal::destroy($id);
        return response()->json(['message' => 'Calendário removido com sucesso']);
    }

    /**
     * Gerar recomendações para um paciente com base no calendário e esquema vacinal
     */
    public function gerarRecomendacoes(int $pacienteId)
    {
        // Buscar todas as vacinas do calendário
        $calendarios = CalendarioVacinal::with('vacina')->get();

        $recomendacoes = [];

        foreach ($calendarios as $cal) {
            // Verificar se paciente já tomou essa vacina
            $aplicacao = Aplicacao::where('paciente_id', $pacienteId)
                                  ->where('vacina_id', $cal->vacina_id)
                                  ->first();

            if (!$aplicacao) {
                // Se não tomou, gerar recomendação inicial
                $recomendacoes[] = RecomendacaoVacina::create([
                    'paciente_id' => $pacienteId,
                    'vacina_id'   => $cal->vacina_id,
                    'data_recomendada' => now(), // poderia calcular pela idade
                    'status' => 'pendente',
                    'observacoes' => $cal->observacoes
                ]);
            } else {
                // Se já tomou, calcular reforço pelo esquema vacinal
                $esquema = EsquemaVacinal::where('vacina_id', $cal->vacina_id)
                                         ->where('numero_dose', '>', $aplicacao->dose)
                                         ->first();

                if ($esquema) {
                    $dataReforco = $aplicacao->data_aplicacao->addDays($esquema->intervalo_minimo);
                    $recomendacoes[] = RecomendacaoVacina::create([
                        'paciente_id' => $pacienteId,
                        'vacina_id'   => $cal->vacina_id,
                        'data_recomendada' => $dataReforco,
                        'status' => 'pendente',
                        'observacoes' => 'Próxima dose calculada automaticamente'
                    ]);
                }
            }
        }

        return $recomendacoes;
    }
}

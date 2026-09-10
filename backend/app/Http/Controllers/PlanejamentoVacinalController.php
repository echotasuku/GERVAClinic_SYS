<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\EsquemaVacinal;
use App\Models\Aplicacao;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PlanejamentoVacinalController extends Controller
{
    public function gerarRecomendacoes($pacienteId)
    {
        // 1. Busca o paciente para pegar a data de nascimento
        $paciente = Paciente::findOrFail($pacienteId);
        $dataNascimento = Carbon::parse($paciente->data_nascimento);

        // 2. Busca todos os esquemas vacinais ordenados por idade
        $esquemas = EsquemaVacinal::with('vacina')
            ->orderBy('vacina_id')
            ->orderBy('idade_recomendada_meses')
            ->get();

        // 3. Busca todas as aplicações já feitas por este paciente
        $aplicacoes = Aplicacao::with('estoque.vacina')
            ->where('paciente_id', $pacienteId)
            ->get();

        $planejamento = [];

        foreach ($esquemas as $esquema) {
            // Calcula a data base: Data de Nascimento + Idade Recomendada (em meses)
            $dataPrevista = $dataNascimento->copy()->addMonths($esquema->idade_recomendada_meses);

            // Verifica se o paciente JÁ tomou alguma dose desta vacina
            $aplicacoesDestaVacina = $aplicacoes->filter(function($app) use ($esquema) {
                return $app->estoque->vacina_id == $esquema->vacina_id;
            });

            // Se já tomou E o esquema tem um intervalo mínimo definido, 
            // a próxima data é baseada na ÚLTIMA aplicação + intervalo em dias
            if ($aplicacoesDestaVacina->isNotEmpty() && $esquema->intervalo_minimo) {
                $ultimaAplicacao = $aplicacoesDestaVacina->sortByDesc('data_aplicacao')->first();
                $dataPrevista = Carbon::parse($ultimaAplicacao->data_aplicacao)->addDays($esquema->intervalo_minimo);
            }

            // Define o status
            $hoje = Carbon::today();
            $status = 'Pendente';
            if ($dataPrevista->isPast()) {
                $status = 'Atrasada';
            }

            $planejamento[] = [
                'vacina_nome' => $esquema->vacina->nome,
                'dose' => $esquema->numero_dose . 'ª Dose',
                'data_prevista_raw' => $dataPrevista->format('Y-m-d'),
                'data_prevista' => $dataPrevista->format('d/m/Y'), // Data formatada para o front
                'idade_recomendada' => $this->formatarIdade($esquema->idade_recomendada_meses),
                'status' => $status
            ];
        }

        return response()->json($planejamento);
    }

    // Função auxiliar para transformar meses em texto bonito (ex: "1 ano e 2 meses")
    private function formatarIdade($meses)
    {
        if ($meses == 0) return 'Ao nascer';
        if ($meses < 12) return $meses . ' meses';
        
        $anos = floor($meses / 12);
        $resto = $meses % 12;
        
        if ($resto == 0) return $anos . ' ano' . ($anos > 1 ? 's' : '');
        return $anos . ' ano' . ($anos > 1 ? 's' : '') . ' e ' . $resto . ' meses';
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Estoque;
use App\Models\Vacina;
use App\Models\Paciente;
use App\Models\Aplicacao;
use App\Models\AgendamentoVacina;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        try {

            // =========================================================
            // INDICADORES GERAIS
            // =========================================================

            $totalVacinas = Vacina::count();

            $totalPacientes = Paciente::count();

            $totalAplicacoes = Aplicacao::count();

            // Quantidade total de doses existentes no estoque
            $totalEstoque = Estoque::sum('quantidade_estoque');


            // =========================================================
            // AGENDAMENTOS
            // =========================================================

            $agendamentosPendentes = AgendamentoVacina::where(
                'status',
                'pendente'
            )->count();

            $agendamentosAplicados = AgendamentoVacina::where(
                'status',
                'aplicada'
            )->count();

            $agendamentosAtrasados = AgendamentoVacina::where(
                'status',
                'atrasada'
            )->count();


            // Agendamentos para hoje
            $agendamentosHoje = AgendamentoVacina::whereDate(
                'data_prevista',
                now()->toDateString()
            )->count();


            // Próximos 7 dias
            $agendamentosProximos = AgendamentoVacina::whereBetween(
                'data_prevista',
                [
                    now()->startOfDay(),
                    now()->addDays(7)->endOfDay()
                ]
            )->count();


            // =========================================================
            // ESTOQUE BAIXO
            // =========================================================

            $estoqueBaixo = Estoque::where(
                'quantidade_estoque',
                '<',
                10
            )->count();


            $alertasEstoque = Estoque::with('vacina')
                ->where('quantidade_estoque', '<', 10)
                ->orderBy('quantidade_estoque', 'asc')
                ->get();


            // =========================================================
            // VALIDADE PRÓXIMA
            // =========================================================

            $validadeProxima = Estoque::with('vacina')
                ->whereNotNull('data_validade')
                ->whereDate(
                    'data_validade',
                    '>=',
                    now()->toDateString()
                )
                ->whereDate(
                    'data_validade',
                    '<=',
                    now()->addDays(30)->toDateString()
                )
                ->orderBy('data_validade', 'asc')
                ->get();


            // =========================================================
            // VACINAS JÁ VENCIDAS
            // =========================================================

            $estoqueVencido = Estoque::with('vacina')
                ->whereNotNull('data_validade')
                ->whereDate(
                    'data_validade',
                    '<',
                    now()->toDateString()
                )
                ->count();


            // =========================================================
            // GRÁFICO DE STATUS DOS AGENDAMENTOS
            // =========================================================

            $graficoStatus = [
                'pendente' => $agendamentosPendentes,
                'aplicada' => $agendamentosAplicados,
                'atrasada' => $agendamentosAtrasados,
            ];


            // =========================================================
            // GRÁFICO DE APLICAÇÕES DOS ÚLTIMOS 6 MESES
            // =========================================================

            $meses = [];
            $valores = [];

            for ($i = 5; $i >= 0; $i--) {

                $data = now()->subMonths($i);

                $meses[] = $data->format('m/Y');

                $valores[] = Aplicacao::whereYear(
                    'data_aplicacao',
                    $data->year
                )
                ->whereMonth(
                    'data_aplicacao',
                    $data->month
                )
                ->count();
            }


            // =========================================================
            // PRÓXIMOS AGENDAMENTOS
            // =========================================================

            $ultimosAgendamentos = AgendamentoVacina::with([
                'aplicacao.paciente',
                'aplicacao.estoque.vacina'
            ])
            ->whereDate(
                'data_prevista',
                '>=',
                now()->toDateString()
            )
            ->orderBy('data_prevista', 'asc')
            ->limit(10)
            ->get();


            // =========================================================
            // APLICAÇÕES RECENTES
            // =========================================================

            $aplicacoesRecentes = Aplicacao::with([
                'paciente',
                'profissional',
                'estoque.vacina'
            ])
            ->orderByDesc('data_aplicacao')
            ->orderByDesc('hora_aplicacao')
            ->limit(10)
            ->get();


            // =========================================================
            // RESPOSTA
            // =========================================================

            return response()->json([

                // -----------------------------------------------------
                // RESUMO
                // -----------------------------------------------------

                'resumo' => [

                    'total_pacientes' => $totalPacientes,

                    'total_vacinas' => $totalVacinas,

                    'total_aplicacoes' => $totalAplicacoes,

                    'total_estoque' => $totalEstoque,

                    'agendamentos_pendentes' => $agendamentosPendentes,

                    'agendamentos_aplicados' => $agendamentosAplicados,

                    'agendamentos_atrasados' => $agendamentosAtrasados,

                    'agendamentos_hoje' => $agendamentosHoje,

                    'agendamentos_proximos' => $agendamentosProximos,

                    'estoque_baixo' => $estoqueBaixo,

                    'validade_proxima' => $validadeProxima->count(),

                    'estoque_vencido' => $estoqueVencido,
                ],


                // -----------------------------------------------------
                // GRÁFICO STATUS
                // -----------------------------------------------------

                'grafico_status' => $graficoStatus,


                // -----------------------------------------------------
                // GRÁFICO APLICAÇÕES
                // -----------------------------------------------------

                'grafico_aplicacoes_mes' => [

                    'meses' => $meses,

                    'valores' => $valores,
                ],


                // -----------------------------------------------------
                // PRÓXIMOS AGENDAMENTOS
                // -----------------------------------------------------

                'ultimos_agendamentos' => $ultimosAgendamentos,


                // -----------------------------------------------------
                // APLICAÇÕES RECENTES
                // -----------------------------------------------------

                'aplicacoes_recentes' => $aplicacoesRecentes,


                // -----------------------------------------------------
                // ALERTAS DE ESTOQUE
                // -----------------------------------------------------

                'alertas_estoque' => $alertasEstoque,


                // -----------------------------------------------------
                // VALIDADE PRÓXIMA
                // -----------------------------------------------------

                'validade_proxima' => $validadeProxima,
            ]);

        } catch (\Exception $e) {

            return response()->json([

                'erro' => 'Falha ao carregar painel',

                'mensagem' => $e->getMessage(),

            ], 500);
        }
    }
}
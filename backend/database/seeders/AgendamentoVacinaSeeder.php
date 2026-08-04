<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AgendamentoVacinaSeeder extends Seeder
{
    public function run(): void
    {
        // Pegando uma aplicação existente
        $aplicacaoId = DB::table('aplicacoes')->where('id', 1)->value('id');

        DB::table('agendamentos_vacinas')->updateOrInsert(
            ['aplicacao_id' => $aplicacaoId],
            [
                'data_prevista' => Carbon::parse('2026-08-10'),
                'status' => 'pendente',
                'observacoes' => 'Agendamento gerado automaticamente'
            ]
        );
    }
}

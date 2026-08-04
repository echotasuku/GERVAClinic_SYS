<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RecomendacoesVacinaSeeder extends Seeder
{
    public function run(): void
    {
        $pacienteId = DB::table('pacientes')->where('cpf', '12345678901')->value('id');
        $vacinaCovidId = DB::table('vacinas')->where('nome', 'Vacina Covid-19')->value('id');
        $vacinaInfluenzaId = DB::table('vacinas')->where('nome', 'Vacina Influenza')->value('id');

        DB::table('recomendacoes_vacinas')->updateOrInsert(
            ['paciente_id' => $pacienteId, 'vacina_id' => $vacinaCovidId],
            [
                'data_recomendada' => Carbon::parse('2026-08-15'),
                'status' => 'pendente'
            ]
        );

        DB::table('recomendacoes_vacinas')->updateOrInsert(
            ['paciente_id' => $pacienteId, 'vacina_id' => $vacinaInfluenzaId],
            [
                'data_recomendada' => Carbon::parse('2026-09-01'),
                'status' => 'pendente'
            ]
        );
    }
}

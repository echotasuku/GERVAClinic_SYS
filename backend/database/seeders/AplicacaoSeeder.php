<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AplicacaoSeeder extends Seeder
{
    public function run(): void
    {
        $pacienteId = DB::table('pacientes')->where('cpf', '12345678901')->value('id');
        $profissionalId = DB::table('profissionais')->where('id_func', 'FUNC001')->value('id');
        $estoqueId = DB::table('estoque')->where('lote', 'L001')->value('id');

        DB::table('aplicacoes')->updateOrInsert(
            ['paciente_id' => $pacienteId, 'estoque_id' => $estoqueId],
            [
                'id_profissional' => $profissionalId,
                'data_aplicacao' => Carbon::parse('2026-08-01'),
                'hora_aplicacao' => '09:00:00',
                
            ]
        );
    }
}

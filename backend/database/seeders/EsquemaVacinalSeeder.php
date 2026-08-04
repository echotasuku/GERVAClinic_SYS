<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EsquemaVacinalSeeder extends Seeder
{
    public function run(): void
    {
        $vacinaCovidId = DB::table('vacinas')->where('nome', 'Vacina Covid-19')->value('id');
        $vacinaInfluenzaId = DB::table('vacinas')->where('nome', 'Vacina Influenza')->value('id');

        // Esquema para Covid-19
        DB::table('esquema_vacinal')->updateOrInsert(
            ['vacina_id' => $vacinaCovidId, 'numero_dose' => 1],
            [
                'idade_recomendada_meses' => 216, // 18 anos
                'intervalo_minimo' => null
            ]
        );

        DB::table('esquema_vacinal')->updateOrInsert(
            ['vacina_id' => $vacinaCovidId, 'numero_dose' => 2],
            [
                'idade_recomendada_meses' => 216,
                'intervalo_minimo' => 30 // intervalo mínimo de 30 dias
            ]
        );

        // Esquema para Influenza
        DB::table('esquema_vacinal')->updateOrInsert(
            ['vacina_id' => $vacinaInfluenzaId, 'numero_dose' => 1],
            [
                'idade_recomendada_meses' => 6, // a partir de 6 meses
                'intervalo_minimo' => 365 // anual
            ]
        );
    }
}

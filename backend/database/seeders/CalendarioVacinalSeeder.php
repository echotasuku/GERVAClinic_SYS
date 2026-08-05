<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CalendarioVacinal;

class CalendarioVacinalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CalendarioVacinal::create([
            'faixa_etaria' => '0-6 meses',
            'vacina_id' => 1, // ID da vacina BCG, por exemplo
            'dose' => '1ª dose',
            'intervalo_dias' => 0,
            'observacoes' => 'Aplicar ao nascer',
        ]);

        CalendarioVacinal::create([
            'faixa_etaria' => '2 meses',
            'vacina_id' => 2, // ID da vacina DTP
            'dose' => '1ª dose',
            'intervalo_dias' => 60,
            'observacoes' => 'Primeira dose da DTP',
        ]);

        CalendarioVacinal::create([
            'faixa_etaria' => '4 meses',
            'vacina_id' => 2, // DTP novamente
            'dose' => '2ª dose',
            'intervalo_dias' => 60,
            'observacoes' => 'Segunda dose da DTP',
        ]);
    }
}

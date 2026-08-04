<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EstoqueSeeder extends Seeder
{
    public function run(): void
    {
        $covidVacinaId = DB::table('vacinas')->where('nome', 'Vacina Covid-19')->value('id');
        $influenzaVacinaId = DB::table('vacinas')->where('nome', 'Vacina Influenza')->value('id');

        DB::table('estoque')->updateOrInsert(
            ['lote' => 'L001'],
            [
                'preco' => 120.50,
                'quantidade_estoque' => 100,
                'data_validade' => Carbon::parse('2027-12-31'),
                'temperatura_recebimento' => '2',
                'vacina_id' => $covidVacinaId,
            ]
        );

        DB::table('estoque')->updateOrInsert(
            ['lote' => 'L002'],
            [
                'preco' => 80.00,
                'quantidade_estoque' => 50,
                'data_validade' => Carbon::parse('2026-06-30'),
                'temperatura_recebimento' => '4',
                'vacina_id' => $influenzaVacinaId,
            ]
        );
    }
}

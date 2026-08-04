<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; 

class TipoVacinaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
 public function run(): void
{
    DB::table('tipos_vacinas')->insert([
        ['nome' => 'Covid-19', 'descricao' => 'Vacina contra o coronavírus'],
        ['nome' => 'Influenza', 'descricao' => 'Vacina contra a gripe'],
        ['nome' => 'Hepatite B', 'descricao' => 'Vacina contra hepatite B'],
    ]);
}

}

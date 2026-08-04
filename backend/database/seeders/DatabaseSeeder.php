<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
   public function run(): void
{
    $this->call([
      
        FornecedoresSeeder::class,
        TipoVacinaSeeder::class,
        VacinaSeeder::class,
        ProfissionaisSeeder::class,
        PacientesSeeder::class,
        EstoqueSeeder::class,
        AplicacaoSeeder::class,
        RecomendacoesVacinaSeeder::class,
        AgendamentoVacinaSeeder::class,
        EsquemaVacinalSeeder::class,

    ]);
}

}

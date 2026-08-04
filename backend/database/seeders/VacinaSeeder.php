<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VacinaSeeder extends Seeder
{
    public function run(): void
    {
        // Buscar IDs reais dos fornecedores
        $bioVacinasId = DB::table('fornecedores')->where('nome', 'BioVacinas Ltda')->value('id');
        $saudePharmaId = DB::table('fornecedores')->where('nome', 'Saúde Pharma')->value('id');

        // Buscar IDs reais dos tipos de vacinas
        $covidId = DB::table('tipos_vacinas')->where('nome', 'Covid-19')->value('id');
        $influenzaId = DB::table('tipos_vacinas')->where('nome', 'Influenza')->value('id');

        DB::table('vacinas')->insert([
            [
                'fornecedor_id' => $bioVacinasId,
                'tipos_vacinas_id' => $covidId,
                'nome' => 'Vacina Covid-19',
                'indicacao' => 'Prevenção contra COVID-19',
                'laboratorio' => 'Lab Saúde',
                'fabricante' => 'BioVacinas',
                'via_administracao' => 'Intramuscular',
            ],
            [
                'fornecedor_id' => $saudePharmaId,
                'tipos_vacinas_id' => $influenzaId,
                'nome' => 'Vacina Influenza',
                'indicacao' => 'Prevenção contra gripe',
                'laboratorio' => 'Lab Pharma',
                'fabricante' => 'Saúde Pharma',
                'via_administracao' => 'Intramuscular',
            ],
        ]);
    }
}

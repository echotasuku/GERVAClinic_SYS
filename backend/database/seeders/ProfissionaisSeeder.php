<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProfissionaisSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('profissionais')->updateOrInsert(
            ['id_func' => 'FUNC001'],
            ['registro_profissional' => 'CRM-12345', 'nome' => 'Dra. Maria Silva']
        );

        DB::table('profissionais')->updateOrInsert(
            ['id_func' => 'FUNC002'],
            ['registro_profissional' => 'CRM-67890', 'nome' => 'Dr. João Souza']
        );
    }
}

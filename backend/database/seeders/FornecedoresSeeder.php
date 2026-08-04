<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FornecedoresSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('fornecedores')->updateOrInsert(
            ['nome' => 'BioVacinas Ltda'],
            [
                'logradouro' => 'Rua das Flores, 123',
                'contato' => 'contato@biovacinas.com',
                'bairro' => 'Centro',
                'cidade' => 'Natal',
                'uf' => 'RN',
                'cep' => '59000000'
            ]
        );

        DB::table('fornecedores')->updateOrInsert(
            ['nome' => 'Saúde Pharma'],
            [
                'logradouro' => 'Av. Brasil, 456',
                'contato' => 'vendas@saudepharma.com',
                'bairro' => 'Alecrim',
                'cidade' => 'Natal',
                'uf' => 'RN',
                'cep' => '59020000'
            ]
        );
    }
}

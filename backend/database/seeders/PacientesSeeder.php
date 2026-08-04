<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PacientesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('pacientes')->updateOrInsert(
            ['cpf' => '12345678901'],
            [
                'nome' => 'Ana Paula Souza',
                'logradouro' => 'Rua das Flores, 123',
                'email' => 'ana.souza@example.com',
                'telefone' => '(84) 99999-1111',
                'bairro' => 'Centro',
                'cidade' => 'Natal',
                'uf' => 'RN',
                'cep' => '59000000',
                'sexo' => 'Feminino',
                'data_nascimento' => Carbon::parse('1990-05-12'),
            ]
        );

        DB::table('pacientes')->updateOrInsert(
            ['cpf' => '98765432100'],
            [
                'nome' => 'Carlos Henrique Lima',
                'logradouro' => 'Av. Brasil, 456',
                'email' => 'carlos.lima@example.com',
                'telefone' => '(84) 98888-2222',
                'bairro' => 'Alecrim',
                'cidade' => 'Natal',
                'uf' => 'RN',
                'cep' => '59020000',
                'sexo' => 'Masculino',
                'data_nascimento' => Carbon::parse('1985-11-30'),
            ]
        );

        DB::table('pacientes')->updateOrInsert(
            ['cpf' => '45678912300'],
            [
                'nome' => 'Mariana Oliveira',
                'logradouro' => 'Rua Projetada, 789',
                'email' => 'mariana.oliveira@example.com',
                'telefone' => '(84) 97777-3333',
                'bairro' => 'Tirol',
                'cidade' => 'Natal',
                'uf' => 'RN',
                'cep' => '59030000',
                'sexo' => 'Feminino',
                'data_nascimento' => Carbon::parse('2000-02-20'),
            ]
        );
    }
}

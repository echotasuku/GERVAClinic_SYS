<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Cria a nova coluna mantendo os dados existentes de "preco"
        Schema::table('estoque', function (Blueprint $table) {
            $table->decimal('preco_unitario', 10, 2)
                  ->nullable()
                  ->after('preco');
        });

        // Copia os valores antigos para a nova coluna
        DB::statement('
            UPDATE estoque
            SET preco_unitario = preco
        ');

        // Remove a coluna antiga
        Schema::table('estoque', function (Blueprint $table) {
            $table->dropColumn('preco');
        });

        // Cria o valor total
        Schema::table('estoque', function (Blueprint $table) {
            $table->decimal('valor_total', 12, 2)
                  ->nullable()
                  ->after('preco_unitario');
        });

        // Calcula o valor total dos registros que já existem
        DB::statement('
            UPDATE estoque
            SET valor_total = quantidade_estoque * preco_unitario
            WHERE preco_unitario IS NOT NULL
        ');
    }

    public function down(): void
    {
        // Recria "preco"
        Schema::table('estoque', function (Blueprint $table) {
            $table->decimal('preco', 10, 2)
                  ->nullable()
                  ->after('id');
        });

        // Recupera os valores de preco_unitario
        DB::statement('
            UPDATE estoque
            SET preco = preco_unitario
        ');

        // Remove as novas colunas
        Schema::table('estoque', function (Blueprint $table) {
            $table->dropColumn([
                'preco_unitario',
                'valor_total'
            ]);
        });
    }
};
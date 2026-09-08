<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('aplicacoes', function (Blueprint $table) {
            $table->decimal('preco_unitario', 10, 2)
                  ->nullable()
                  ->after('estoque_id');

            $table->decimal('desconto_percentual', 5, 2)
                  ->nullable()
                  ->after('preco_unitario');

            $table->decimal('desconto_valor', 10, 2)
                  ->nullable()
                  ->after('desconto_percentual');

            $table->decimal('valor_final', 10, 2)
                  ->nullable()
                  ->after('desconto_valor');
        });
    }

    public function down(): void
    {
        Schema::table('aplicacoes', function (Blueprint $table) {
            $table->dropColumn([
                'preco_unitario',
                'desconto_percentual',
                'desconto_valor',
                'valor_final',
            ]);
        });
    }
};
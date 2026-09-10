<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('estoque', function (Blueprint $table) {
            // Índices aceleram drasticamente as consultas WHERE
            $table->index('vacina_id');
            $table->index('lote');
            $table->index('data_validade');
            $table->index('quantidade_estoque');
        });
    }

    public function down()
    {
        Schema::table('estoque', function (Blueprint $table) {
            $table->dropIndex(['vacina_id']);
            $table->dropIndex(['lote']);
            $table->dropIndex(['data_validade']);
            $table->dropIndex(['quantidade_estoque']);
        });
    }
};
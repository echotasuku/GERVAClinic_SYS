<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('estoque', function (Blueprint $table) {
            $table->id();
            $table->string('lote');
            $table->date('data_validade');
            $table->integer('quantidade_estoque');
            $table->decimal('preco', 10, 2);
            $table->unsignedBigInteger('medicamento_id'); // Chave estrangeira

            // Definindo as chaves estrangeiras
            $table->foreign('medicamento_id')->references('id')->on('medicamentos')
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('estoque', function (Blueprint $table) {
            $table->dropForeign(['medicamento_id']);
        });
        
        Schema::dropIfExists('estoque');
    }
};

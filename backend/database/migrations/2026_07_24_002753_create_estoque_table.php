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

            // Chave estrangeira para vacinas
            $table->unsignedBigInteger('vacina_id');

            // Campos da tabela
            $table->string('lote');                          // identificação do lote
            $table->decimal('preco', 10, 2)->nullable();     // preço do lote
            $table->unsignedInteger('quantidade_estoque');   // quantidade disponível
            $table->date('data_validade');                   // validade do lote
            $table->decimal('temperatura_recebimento', 5, 2)->nullable(); // temperatura recebida

            $table->timestamps();

            // Definição da foreign key
            $table->foreign('vacina_id')
                  ->references('id')->on('vacinas')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estoque');
    }
};

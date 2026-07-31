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
        Schema::create('aplicacoes', function (Blueprint $table) {
            $table->id();

            // Chaves estrangeiras
            $table->unsignedBigInteger('id_profissional');
            $table->unsignedBigInteger('paciente_id');
            $table->unsignedBigInteger('estoque_id');

            // Campos adicionais
            $table->text('observacoes')->nullable();
            $table->date('data_aplicacao');
            $table->time('hora_aplicacao');

            $table->timestamps();

            // Definição das foreign keys
            $table->foreign('id_profissional')
                  ->references('id')->on('profissionais')
                  ->onDelete('cascade');

            $table->foreign('paciente_id')
                  ->references('id')->on('pacientes')
                  ->onDelete('cascade');

            $table->foreign('estoque_id')
                  ->references('id')->on('estoque')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aplicacoes');
    }
};

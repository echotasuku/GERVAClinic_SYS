<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agendamentos_vacinas', function (Blueprint $table) {
            $table->id();

            // Relacionamento com aplicação
            $table->unsignedBigInteger('aplicacao_id');

            // Campos principais
            $table->date('data_prevista');
            $table->enum('status', ['pendente', 'aplicada', 'atrasada'])->default('pendente');
            $table->text('observacoes')->nullable();

            $table->timestamps();

            // Foreign key
            $table->foreign('aplicacao_id')
                  ->references('id')->on('aplicacoes')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agendamentos_vacinas');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recomendacoes_vacinas', function (Blueprint $table) {
            $table->id();

            // Relacionamentos
            $table->unsignedBigInteger('paciente_id');
            $table->unsignedBigInteger('vacina_id');

            // Campos principais
            $table->date('data_recomendada');
            $table->enum('status', ['pendente', 'aplicada'])->default('pendente');

            $table->timestamps();

            // Foreign keys
            $table->foreign('paciente_id')
                  ->references('id')->on('pacientes')
                  ->onDelete('cascade');

            $table->foreign('vacina_id')
                  ->references('id')->on('vacinas')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recomendacoes_vacinas');
    }
};

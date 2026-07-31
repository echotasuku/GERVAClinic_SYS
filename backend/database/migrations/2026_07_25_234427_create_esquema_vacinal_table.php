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
        Schema::create('esquema_vacinal', function (Blueprint $table) {
            $table->id();

            // Chave estrangeira compatível com vacinas.id
            $table->unsignedBigInteger('vacina_id');

            // Campos da tabela
            $table->unsignedInteger('numero_dose');                  // número da dose
            $table->unsignedInteger('idade_recomendada_meses');      // idade recomendada em meses
            $table->unsignedInteger('intervalo_minimo')->nullable(); // intervalo mínimo entre doses

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
        Schema::dropIfExists('esquema_vacinal');
    }
};

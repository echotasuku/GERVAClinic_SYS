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
        Schema::create('vacinas', function (Blueprint $table) {
            $table->id();

            // Chaves estrangeiras
            $table->unsignedBigInteger('fornecedor_id');
            $table->unsignedBigInteger('tipos_vacinas_id');

            // Campos da tabela
            $table->string('nome');
            $table->string('indicacao')->nullable();
            $table->string('laboratorio')->nullable();
            $table->string('fabricante')->nullable();
            $table->string('via_administracao')->nullable();

            $table->timestamps();

            // Definição das foreign keys
            $table->foreign('fornecedor_id')
                  ->references('id')->on('fornecedores')
                  ->onDelete('cascade');

            $table->foreign('tipos_vacinas_id')
                  ->references('id')->on('tipos_vacinas')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vacinas');
    }
};

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
        Schema::create('profissionais', function (Blueprint $table) {
            $table->id();

            // Campos da tabela
            $table->string('id_func')->unique();              // identificador funcional
            $table->string('registro_profissional')->unique(); // registro do conselho profissional
            $table->string('nome');                           // nome do profissional

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profissionais');
    }
};

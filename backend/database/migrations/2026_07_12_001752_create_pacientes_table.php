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
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('cpf', 14)->unique();
            $table->date('data_nascimento');
            $table->enum('sexo', ['Masculino', 'Feminino', 'Outro']);
            $table->string('telefone');
            $table->string('email')->nullable();

            $table->string('logradouro');
            $table->string('bairro');
            $table->string('cidade');
            $table->string('uf',2);
            $table->string('cep',9);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};
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
        Schema::create('medicamentos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->text('descricao');
            $table->foreignId('fornecedor_id')->constrained('fornecedores');
            $table->foreignId('categoria_id')->constrained('categorias');
            $table->string('tarja')->nullable();
            $table->boolean('generico')->default(false)->nullable();
            $table->string('laboratorio')->nullable();
            $table->string('dosagem')->nullable();
            $table->string('via_administracao')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicamentos');
    }
};

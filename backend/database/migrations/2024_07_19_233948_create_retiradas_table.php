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
        Schema::create('retiradas', function (Blueprint $table) {
            $table->id();
            $table->date('data');
            $table->foreignId('medicamento_id')->constrained('medicamentos');
            $table->foreignId('farmaceutico_id')->constrained('farmaceuticos'); // Relacionamento com a tabela de farmacêuticos
            $table->string('receita')->nullable();
            $table->integer('quantidade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retiradas');
    }
};

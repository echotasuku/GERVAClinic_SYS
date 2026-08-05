<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::create('calendarios_vacinais', function (Blueprint $table) {
        $table->id();
        $table->string('faixa_etaria'); // Ex: "0-6 meses"
        $table->unsignedBigInteger('vacina_id'); // FK para vacinas
        $table->string('dose'); // Ex: "1ª dose", "reforço"
        $table->integer('intervalo_dias')->nullable(); // intervalo entre doses
        $table->text('observacoes')->nullable();
        $table->timestamps();

        $table->foreign('vacina_id')->references('id')->on('vacinas')->onDelete('cascade');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendarios_vacinais');
    }
};

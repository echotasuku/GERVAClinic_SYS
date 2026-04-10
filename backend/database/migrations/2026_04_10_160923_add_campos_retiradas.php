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
    Schema::table('retiradas', function (Blueprint $table) {
        $table->string('nome_paciente')->nullable()->after('data');
        $table->string('cns')->nullable()->after('nome_paciente');
        $table->time('hora')->nullable()->after('cns');
    });
}

public function down()
{
    Schema::table('retiradas', function (Blueprint $table) {
        $table->dropColumn(['nome_paciente', 'cns', 'hora']);
    });
}
};

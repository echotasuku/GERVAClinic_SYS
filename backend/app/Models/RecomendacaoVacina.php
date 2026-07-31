<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecomendacaoVacina extends Model
{
    use HasFactory;

    protected $table = 'recomendacoes_vacinas';

    protected $fillable = [
        'paciente_id',
        'vacina_id',
        'data_recomendada',
        'status',
    ];

    // Relacionamentos
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function vacina()
    {
        return $this->belongsTo(Vacina::class, 'vacina_id');
    }
}

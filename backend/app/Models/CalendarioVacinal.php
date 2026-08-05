<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarioVacinal extends Model
{
    use HasFactory;

    
    protected $table = 'calendarios_vacinais';

    protected $fillable = [
        'faixa_etaria',
        'vacina_id',
        'dose',
        'intervalo_dias',
        'observacoes'
    ];

    public function vacina()
    {
        return $this->belongsTo(Vacina::class);
    }
}

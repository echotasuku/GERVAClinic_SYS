<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EsquemaVacinal extends Model
{
    use HasFactory;

    protected $table = 'esquema_vacinal';

    protected $fillable = [
        'vacina_id',
        'numero_dose',
        'idade_recomendada_meses',
        'intervalo_minimo',
    ];

    // Relacionamento: cada esquema pertence a uma vacina
    public function vacina()
    {
        return $this->belongsTo(Vacina::class, 'vacina_id');
    }
}

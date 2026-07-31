<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoVacina extends Model
{
    use HasFactory;

    protected $table = 'tipos_vacinas';

    protected $fillable = [
        'nome',
        'descricao',
    ];

    // Relacionamento: um tipo de vacina pode ter várias vacinas
    public function vacinas()
    {
        return $this->hasMany(Vacina::class, 'tipos_vacinas_id');
    }
}

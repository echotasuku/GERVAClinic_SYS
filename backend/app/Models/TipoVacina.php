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


    public function vacinas()
    {
        return $this->hasMany(Vacina::class, 'tipos_vacinas_id');
    }
}

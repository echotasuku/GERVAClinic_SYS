<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vacina extends Model
{
    use HasFactory;

    protected $table = 'vacinas';

    protected $fillable = [
        'fornecedor_id',
        'tipos_vacinas_id',
        'nome',
        'indicacao',
        'laboratorio',
        'fabricante',
        'via_administracao',
    ];

    // Relacionamentos
    public function fornecedor()
    {
        return $this->belongsTo(Fornecedor::class, 'fornecedor_id');
    }

    public function tipoVacina()
    {
        return $this->belongsTo(TipoVacina::class, 'tipos_vacinas_id');
    }

    public function estoques()
    {
        return $this->hasMany(Estoque::class, 'vacina_id');
    }

    public function esquemas()
    {
        return $this->hasMany(EsquemaVacinal::class, 'vacina_id');
    }

    public function recomendacoes()
    {
        return $this->hasMany(RecomendacaoVacina::class, 'vacina_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estoque extends Model
{
    use HasFactory;

    protected $table = 'estoque';

    protected $fillable = [
        'lote',
        'preco',
        'quantidade_estoque',
        'data_validade',
        'hora',
        'temperatura_recebimento',
        'vacina_id',
    ];

    public function vacina()
    {
        return $this->belongsTo(Vacina::class, 'vacina_id');
    }

    public function aplicacoes()
    {
        return $this->hasMany(Aplicacao::class, 'estoque_id');
    }
}

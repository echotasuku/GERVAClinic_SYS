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
        'temperatura_recebimento',
        'vacina_id',
    ];

    // Relacionamento: cada lote pertence a uma vacina
    public function vacina()
    {
        return $this->belongsTo(Vacina::class, 'vacina_id');
    }

    // Relacionamento: um lote pode ter várias aplicações
    public function aplicacoes()
    {
        return $this->hasMany(Aplicacao::class, 'estoque_id');
    }
}

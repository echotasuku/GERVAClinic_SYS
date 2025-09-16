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
        'data_validade',
        'quantidade_estoque',
        'preco',
        'medicamento_id',
    ];


    public function medicamento()
    {
        return $this->belongsTo(Medicamento::class);
    }
}

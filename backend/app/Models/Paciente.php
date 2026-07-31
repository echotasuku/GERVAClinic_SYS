<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'cpf',
        'data_nascimento',
        'sexo',
        'telefone',
        'email',
        'logradouro',
        'bairro',
        'cidade',
        'uf',
        'cep'
    ];

    
    public function retiradas()
    {
        return $this->hasMany(Retirada::class);
    }
}
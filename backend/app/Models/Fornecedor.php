<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fornecedor extends Model
{
    use HasFactory;

    protected $table = 'fornecedores'; 

    protected $fillable = [
        'nome',
        'logradouro', // Atualizado para refletir o novo campo
        'bairro',
        'cidade',
        'uf',
        'contato',
        'cep'
    ];

    public function medicamentos()
    {
        return $this->hasMany(Medicamento::class); // Atualizado para refletir o relacionamento correto
    }
}

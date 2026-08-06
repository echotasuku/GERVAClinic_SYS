<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profissional extends Model
{
    use HasFactory;

    protected $table = 'profissionais';

    protected $fillable = [
        'id_func',
        'registro_profissional',
        'nome',
    ];

    
    public function aplicacoes()
    {
        return $this->hasMany(Aplicacao::class, 'id_profissional');
    }
}

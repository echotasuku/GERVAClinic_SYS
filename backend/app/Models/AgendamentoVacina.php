<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgendamentoVacina extends Model
{
    use HasFactory;

    protected $table = 'agendamentos_vacinas';

    protected $fillable = [
        'aplicacao_id',
        'data_prevista',
        'status',
        'observacoes',
    ];

    
    public function aplicacao()
    {
        return $this->belongsTo(Aplicacao::class, 'aplicacao_id');
    }
}

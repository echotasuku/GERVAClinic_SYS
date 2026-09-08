<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aplicacao extends Model
{
    use HasFactory;

    protected $table = 'aplicacoes';

    protected $fillable = [
        'id_profissional',
        'paciente_id',
        'estoque_id',
        'observacoes',
        'data_aplicacao',
        'hora_aplicacao',
        'preco_unitario',       
        'desconto_percentual',   
        'desconto_valor',       
        'valor_final',           
    ];

    protected $casts = [
        'preco_unitario' => 'decimal:2',
        'desconto_percentual' => 'decimal:2',
        'desconto_valor' => 'decimal:2',
        'valor_final' => 'decimal:2',
        'data_aplicacao' => 'date',
    ];

    public function profissional()
    {
        return $this->belongsTo(Profissional::class, 'id_profissional');
    }

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function estoque()
    {
        return $this->belongsTo(Estoque::class, 'estoque_id');
    }
}
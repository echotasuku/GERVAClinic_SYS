<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicamento extends Model
{
    use HasFactory;

    protected $fillable = ['nome', 'descricao', 'fornecedor_id', 'categoria_id', 
'tarja', 'generico', 'laboratorio', 'dosagem', 'via_administracao'];

    public function fornecedor()
    {
        return $this->belongsTo(Fornecedor::class);
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function retiradas()
    {
        return $this->hasMany(Retirada::class);
    }


      public function estoque()
    {
        return $this->hasOne(Estoque::class);
    }
}

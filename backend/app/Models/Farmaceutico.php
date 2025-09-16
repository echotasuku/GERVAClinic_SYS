<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farmaceutico extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_func',
        'CRF',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function retiradas()
    {
        return $this->hasMany(Retirada::class);
    }
}


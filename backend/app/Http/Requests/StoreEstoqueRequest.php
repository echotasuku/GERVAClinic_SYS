<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEstoqueRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Defina isso com base na sua lógica de autorização
    }

    public function rules()
    {
        return [
            'lote' => 'required|string|max:255',
            'data_validade' => 'required|date|after:today',
            'quantidade_estoque' => 'required|integer|min:1',
            'preco' => 'required|numeric|min:0',
            'medicamento_id' => 'required|exists:medicamentos,id',
        ];
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Fornecedor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;

class FornecedorController extends Controller
{
    public function index()
    {
        return Fornecedor::all();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string',
            'contato' => 'required|string',
            'logradouro' => 'nullable|string',
            'bairro' => 'nullable|string',
            'cidade' => 'nullable|string',
            'uf' => 'nullable|string|max:2',
            'cep' => 'nullable|string|max:8',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        return Fornecedor::create($request->all());
    }

    public function show($id)
    {
        return Fornecedor::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $fornecedor = Fornecedor::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nome' => 'required|string',
            'contato' => 'required|string',
            'logradouro' => 'nullable|string',
            'bairro' => 'nullable|string',
            'cidade' => 'nullable|string',
            'uf' => 'nullable|string|max:2',
            'cep' => 'nullable|string|max:8',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $fornecedor->update($request->all());
        return $fornecedor;
    }

    public function destroy($id)
    {
        $fornecedor = Fornecedor::findOrFail($id);
        $fornecedor->delete();
        return response()->noContent();
    }

    // Função para consultar CEP
    public function consultarCep($cep)
    {
        $response = Http::get("https://viacep.com.br/ws/{$cep}/json/");
        return response()->json($response->json());
    }
}

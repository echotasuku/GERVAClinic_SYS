<?php

namespace App\Http\Controllers;

use App\Models\Medicamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MedicamentoController extends Controller
{
    public function index()
    {
        return Medicamento::all();
    }

    public function list()
    {
        // Retorna apenas o nome e id dos medicamentos, sem detalhes completos
        return Medicamento::select('id', 'nome')->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string',
            'descricao' => 'required|string',
            'fornecedor_id' => 'required|exists:fornecedores,id',
            'categoria_id' => 'required|exists:categorias,id',
            'tarja' => 'required|string',
            'generico' => 'required|boolean', //opcional mas eu coloquei mesmo assim `:P
            'laboratorio' => 'required|string',
            'dosagem' => 'required|string',
            'via_administracao' => 'required|string' 
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        return Medicamento::create($request->all());
    }

    public function show($id)
    {
        return Medicamento::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $medicamento = Medicamento::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nome' => 'required|string',
            'descricao' => 'required|string',
            'fornecedor_id' => 'required|exists:fornecedores,id',
            'categoria_id' => 'required|exists:categorias,id',
            'tarja' => 'required|string',
            'generico' => 'required|boolean',
            'laboratorio' => 'required|string',
            'dosagem' => 'required|string',
            'via_administracao' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $medicamento->update($request->all());
        return $medicamento;
    }

    public function destroy($id)
    {
        $medicamento = Medicamento::findOrFail($id);
        $medicamento->delete();
        return response()->noContent();
    }
}

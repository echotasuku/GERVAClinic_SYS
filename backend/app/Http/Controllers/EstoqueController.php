<?php

namespace App\Http\Controllers;

use App\Models\Estoque;
use App\Models\Medicamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class EstoqueController extends Controller
{
    public function index()
    {
        $estoques = Estoque::with('medicamento')->get();
        return response()->json($estoques);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lote' => 'required|string|max:255',
            'data_validade' => 'required|date|after:today',
            'quantidade_estoque' => 'required|integer|min:1',
            'preco' => 'required|numeric|min:0',
            'medicamento_id' => 'required|exists:medicamentos,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $estoque = Estoque::create($request->all());
            return response()->json($estoque, 201);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Medicamento não encontrado'], 404);
        }
    }

    public function show($id)
    {
        $estoque = Estoque::with('medicamento')->findOrFail($id);
        return response()->json($estoque);
    }

    public function update(Request $request, $id)
    {
        $estoque = Estoque::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'lote' => 'required|string|max:255',
            'data_validade' => 'required|date|after:today',
            'quantidade_estoque' => 'required|integer|min:1',
            'preco' => 'required|numeric|min:0',
            'medicamento_id' => 'required|exists:medicamentos,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $estoque->update($request->all());
        return response()->json($estoque);
    }

    public function destroy($id)
    {
        $estoque = Estoque::findOrFail($id);
        $estoque->delete();
        return response()->noContent();
    }
}

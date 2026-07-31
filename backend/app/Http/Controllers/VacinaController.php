<?php

namespace App\Http\Controllers;

use App\Models\Vacina;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VacinaController extends Controller
{
    // Listar todas as vacinas
    public function index()
    {
        return Vacina::with(['fornecedor', 'tipoVacina'])->get();
    }

    // Criar uma nova vacina
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fornecedor_id' => 'required|exists:fornecedores,id',
            'tipos_vacinas_id' => 'required|exists:tipos_vacinas,id',
            'nome' => 'required|string|max:255',
            'indicacao' => 'nullable|string',
            'laboratorio' => 'nullable|string',
            'fabricante' => 'nullable|string',
            'via_administracao' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $vacina = Vacina::create($request->all());
        return response()->json($vacina, 201);
    }

    // Mostrar uma vacina específica
    public function show($id)
    {
        return Vacina::with(['fornecedor', 'tipoVacina'])->findOrFail($id);
    }

    // Atualizar uma vacina
    public function update(Request $request, $id)
    {
        $vacina = Vacina::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'fornecedor_id' => 'required|exists:fornecedores,id',
            'tipos_vacinas_id' => 'required|exists:tipos_vacinas,id',
            'nome' => 'required|string|max:255',
            'indicacao' => 'nullable|string',
            'laboratorio' => 'nullable|string',
            'fabricante' => 'nullable|string',
            'via_administracao' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $vacina->update($request->all());
        return response()->json($vacina);
    }

    // Deletar uma vacina
    public function destroy($id)
    {
        $vacina = Vacina::findOrFail($id);
        $vacina->delete();
        return response()->noContent();
    }
}

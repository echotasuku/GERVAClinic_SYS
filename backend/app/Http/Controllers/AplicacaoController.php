<?php

namespace App\Http\Controllers;

use App\Models\Aplicacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AplicacaoController extends Controller
{
    // Listar todas as aplicações
    public function index()
    {
        return Aplicacao::with(['profissional', 'paciente', 'estoque'])->get();
    }

    // Criar uma nova aplicação
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_profissional' => 'required|exists:profissionais,id',
            'paciente_id' => 'required|exists:pacientes,id',
            'estoque_id' => 'required|exists:estoque,id',
            'observacoes' => 'nullable|string',
            'data_aplicacao' => 'required|date',
            'hora_aplicacao' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $aplicacao = Aplicacao::create($request->all());
        return response()->json($aplicacao, 201);
    }

    // Mostrar uma aplicação específica
    public function show($id)
    {
        return Aplicacao::with(['profissional', 'paciente', 'estoque'])->findOrFail($id);
    }

    // Atualizar uma aplicação
    public function update(Request $request, $id)
    {
        $aplicacao = Aplicacao::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'id_profissional' => 'required|exists:profissionais,id',
            'paciente_id' => 'required|exists:pacientes,id',
            'estoque_id' => 'required|exists:estoque,id',
            'observacoes' => 'nullable|string',
            'data_aplicacao' => 'required|date',
            'hora_aplicacao' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $aplicacao->update($request->all());
        return response()->json($aplicacao);
    }

    // Deletar uma aplicação
    public function destroy($id)
    {
        $aplicacao = Aplicacao::findOrFail($id);
        $aplicacao->delete();
        return response()->noContent();
    }
}

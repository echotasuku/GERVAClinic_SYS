<?php

namespace App\Http\Controllers;

use App\Models\AgendamentoVacina;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AgendamentoVacinaController extends Controller
{
    public function index()
    {
        return AgendamentoVacina::with('aplicacao')->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'aplicacao_id' => 'required|exists:aplicacoes,id',
            'data_prevista' => 'required|date|after:today',
            'status' => 'required|in:pendente,aplicada,atrasada',
            'observacoes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $agendamento = AgendamentoVacina::create($request->all());
        return response()->json($agendamento, 201);
    }

    public function show($id)
    {
        return AgendamentoVacina::with('aplicacao')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $agendamento = AgendamentoVacina::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'aplicacao_id' => 'required|exists:aplicacoes,id',
            'data_prevista' => 'required|date|after:today',
            'status' => 'required|in:pendente,aplicada,atrasada',
            'observacoes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $agendamento->update($request->all());
        return response()->json($agendamento);
    }

    public function destroy($id)
    {
        $agendamento = AgendamentoVacina::findOrFail($id);
        $agendamento->delete();
        return response()->noContent();
    }
}

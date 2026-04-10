<?php

namespace App\Http\Controllers;

use App\Models\Retirada;
use App\Models\Medicamento;
use App\Models\Estoque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class RetiradaController extends Controller
{
    public function index()
    {
        // Permitir que todos os usuários visualizem as retiradas
        $retiradas = Retirada::with(['medicamento', 'farmaceutico'])->get();
        return response()->json($retiradas);
    }

    public function store(Request $request)
    {
        // Permitir que todos os usuários possam criar retiradas

        $validator = Validator::make($request->all(), [
            'data' => 'required|date',
            'medicamento_id' => 'required|exists:medicamentos,id',
            'farmaceutico_id' => 'required|exists:farmaceuticos,id',
            'quantidade' => 'required|integer|min:1',
            'receita' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:2048',
            'nome_paciente' => 'required|string|max:255',
            'cns' => 'required|string|max:255',
            'hora' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors()->first(), 422);
        }

        try {
            $medicamento = Medicamento::findOrFail($request->medicamento_id);

            // Encontrar o estoque associado ao medicamento
            $estoque = Estoque::where('medicamento_id', $request->medicamento_id)->firstOrFail();

            // Verificar se a quantidade solicitada excede o estoque disponível
            if ($estoque->quantidade_estoque < $request->quantidade) {
                return response()->json(['error' => 'Quantidade solicitada excede o estoque disponível'], 400);
            }

            // Manipular o arquivo se ele estiver presente
            $receitaPath = null;
            if ($request->hasFile('receita')) {
                $file = $request->file('receita');
                $receitaPath = $file->store('receitas', 'public');
            }

            // Criar a retirada
            $data = $request->all();
            $data['receita'] = $receitaPath;
            $retirada = Retirada::create($data);

            // Atualizar o estoque
            $estoque->quantidade_estoque -= $request->quantidade;
            $estoque->save();

            $retirada->load(['medicamento', 'farmaceutico']);
            return response()->json($retirada, 201);

        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Medicamento ou Estoque não encontrado'], 404);
        }
    }

    public function show($id)
    {
        // Permitir que todos os usuários visualizem uma retirada específica
        $retirada = Retirada::with(['medicamento', 'farmaceutico'])->findOrFail($id);
        return response()->json($retirada);
    }

    public function update(Request $request, $id)
    {
        // Somente administradores podem atualizar retiradas
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado. Apenas administradores podem atualizar retiradas.'], 403);
        }

        $retirada = Retirada::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'data' => 'required|date',
            'medicamento_id' => 'required|exists:medicamentos,id',
            'farmaceutico_id' => 'required|exists:farmaceuticos,id',
            'quantidade' => 'required|integer|min:1',
            'receita' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:2048',
            'nome_paciente' => 'required|string|max:255',
            'cns' => 'required|string|max:255',
            'hora' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $medicamentoOriginal = $retirada->medicamento;
        $medicamentoAtual = Medicamento::findOrFail($request->medicamento_id);

        $estoqueOriginal = Estoque::where('medicamento_id', $medicamentoOriginal->id)->firstOrFail();
        $estoqueAtual = Estoque::where('medicamento_id', $medicamentoAtual->id)->firstOrFail();

        $estoqueOriginal->quantidade_estoque += $retirada->quantidade;
        $estoqueOriginal->save();

        if ($estoqueAtual->quantidade_estoque < $request->quantidade) {
            $estoqueOriginal->quantidade_estoque -= $retirada->quantidade;
            $estoqueOriginal->save();
            return response()->json(['error' => 'Quantidade solicitada excede o estoque disponível'], 400);
        }

        $receitaPath = $retirada->receita;
        if ($request->hasFile('receita')) {
            if ($receitaPath) {
                Storage::disk('public')->delete($receitaPath);
            }

            $file = $request->file('receita');
            $receitaPath = $file->store('receitas', 'public');
        }

        $data = $request->all();
        $data['receita'] = $receitaPath;
        $retirada->update($data);

        $estoqueAtual->quantidade_estoque -= $request->quantidade;
        $estoqueAtual->save();

        $retirada->load(['medicamento', 'farmaceutico']);
        return response()->json($retirada);
    }

    public function destroy($id)
    {
        // Somente administradores podem excluir retiradas
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado. Apenas administradores podem excluir retiradas.'], 403);
        }

        $retirada = Retirada::findOrFail($id);

        $estoque = Estoque::where('medicamento_id', $retirada->medicamento_id)->firstOrFail();

        $estoque->quantidade_estoque += $retirada->quantidade;
        $estoque->save();

        if ($retirada->receita) {
            Storage::disk('public')->delete($retirada->receita);
        }

        $retirada->delete();
        return response()->noContent();
    }
}

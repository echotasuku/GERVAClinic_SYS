<?php

namespace App\Http\Controllers;

use App\Models\EsquemaVacinal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EsquemaVacinalController extends Controller
{
    // Listar todos os esquemas vacinais
    public function index()
    {
        return EsquemaVacinal::with('vacina')->get();
    }

    // Criar um novo esquema vacinal
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vacina_id' => 'required|exists:vacinas,id',
            'numero_dose' => 'required|integer|min:1',
            'idade_recomendada_meses' => 'required|integer|min:0',
            'intervalo_minimo' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $esquema = EsquemaVacinal::create($request->all());
        return response()->json($esquema, 201);
    }

    // Mostrar um esquema vacinal específico
    public function show($id)
    {
        return EsquemaVacinal::with('vacina')->findOrFail($id);
    }

    // Atualizar um esquema vacinal
    public function update(Request $request, $id)
    {
        $esquema = EsquemaVacinal::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'vacina_id' => 'required|exists:vacinas,id',
            'numero_dose' => 'required|integer|min:1',
            'idade_recomendada_meses' => 'required|integer|min:0',
            'intervalo_minimo' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $esquema->update($request->all());
        return response()->json($esquema);
    }

    // Deletar um esquema vacinal
    public function destroy($id)
    {
        $esquema = EsquemaVacinal::findOrFail($id);
        $esquema->delete();
        return response()->noContent();
    }
}

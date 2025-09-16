<?php

namespace App\Http\Controllers;

use App\Models\Farmaceutico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FarmaceuticoController extends Controller
{
    public function index()
    {
        return Farmaceutico::all();
    }

    public function list()
    {
        // Retorna apenas o id_func e CRF dos farmacêuticos
        return Farmaceutico::select('id', 'id_func', 'CRF')->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_func' => 'required|integer',
            'CRF' => 'required|string|max:6', // Validar o campo CRF
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Criar um novo Farmaceutico
        $farmaceutico = Farmaceutico::create([
            'id_func' => $request->id_func,
            'CRF' => $request->CRF,
        ]);

        return $farmaceutico;
    }

    public function show($id)
    {
        return Farmaceutico::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $farmaceutico = Farmaceutico::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'id_func' => 'required|integer',
            'CRF' => 'required|string|max:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Atualizar o Farmaceutico
        $farmaceutico->update([
            'id_func' => $request->id_func,
            'CRF' => $request->CRF,
        ]);

        return $farmaceutico;
    }

    public function destroy($id)
    {
        $farmaceutico = Farmaceutico::findOrFail($id);
        $farmaceutico->delete();
        return response()->noContent();
    }
}

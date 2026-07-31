<?php

namespace App\Http\Controllers;

use App\Models\TipoVacina;
use Illuminate\Http\Request;

class TipoVacinaController extends Controller
{
    // Listar todos os tipos de vacinas
    public function index()
    {
        return TipoVacina::all();
    }

    // Criar um novo tipo de vacina
    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
        ]);

        return TipoVacina::create($request->all());
    }

    // Mostrar um tipo de vacina específico
    public function show($id)
    {
        return TipoVacina::findOrFail($id);
    }

    // Atualizar um tipo de vacina
    public function update(Request $request, $id)
    {
        $tipoVacina = TipoVacina::findOrFail($id);

        $tipoVacina->update($request->all());

        return $tipoVacina;
    }

    // Deletar um tipo de vacina
    public function destroy($id)
    {
        TipoVacina::destroy($id);

        return response()->json(['message' => 'Tipo de vacina removido com sucesso']);
    }
}

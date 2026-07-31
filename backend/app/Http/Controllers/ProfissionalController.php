<?php

namespace App\Http\Controllers;

use App\Models\Profissional;
use Illuminate\Http\Request;

class ProfissionalController extends Controller
{
    // Listar todos os profissionais
    public function index()
    {
        return Profissional::all();
    }

    // Criar um novo profissional
    public function store(Request $request)
    {
        $request->validate([
            'id_func' => 'required|string|max:255|unique:profissionais',
            'registro_profissional' => 'required|string|max:255|unique:profissionais',
            'nome' => 'required|string|max:255',
        ]);

        return Profissional::create($request->all());
    }

    // Mostrar um profissional específico
    public function show($id)
    {
        return Profissional::findOrFail($id);
    }

    // Atualizar um profissional
    public function update(Request $request, $id)
    {
        $profissional = Profissional::findOrFail($id);

        $request->validate([
            'id_func' => 'required|string|max:255|unique:profissionais,id_func,' . $id,
            'registro_profissional' => 'required|string|max:255|unique:profissionais,registro_profissional,' . $id,
            'nome' => 'required|string|max:255',
        ]);

        $profissional->update($request->all());

        return $profissional;
    }

    // Deletar um profissional
    public function destroy($id)
    {
        Profissional::destroy($id);

        return response()->json(['message' => 'Profissional removido com sucesso']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; 

class CategoriaController extends Controller
{
    public function index()
    {
        return Categoria::all();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string',
            'descricao' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422); // Retorna os erros de validação em JSON
        }

        return Categoria::create($request->all());
    }

    public function show($id)
    {
        return Categoria::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $categoria = Categoria::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nome' => 'required|string',
            'descricao' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422); 
        }

        $categoria->update($request->all());
        return $categoria;
    }

    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);
        $categoria->delete();
        //return response()->json(['message' => 'Categoria excluída com sucesso']);
         return response()->noContent();
    }
}

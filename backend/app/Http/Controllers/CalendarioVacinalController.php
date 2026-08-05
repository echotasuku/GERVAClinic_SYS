<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CalendarioVacinal;

class CalendarioVacinalController extends Controller
{
    /**
     * Listar todos os calendários vacinais
     */
    public function index()
    {
        return CalendarioVacinal::with('vacina')->get();
    }

    /**
     * Criar um novo calendário vacinal
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'faixa_etaria' => 'required|string',
            'vacina_id' => 'required|exists:vacinas,id',
            'dose' => 'required|string',
            'intervalo_dias' => 'nullable|integer',
            'observacoes' => 'nullable|string',
        ]);

        return CalendarioVacinal::create($data);
    }

    /**
     * Mostrar um calendário vacinal específico
     */
    public function show(string $id)
    {
        return CalendarioVacinal::with('vacina')->findOrFail($id);
    }

    /**
     * Atualizar um calendário vacinal
     */
    public function update(Request $request, string $id)
    {
        $calendario = CalendarioVacinal::findOrFail($id);

        $data = $request->validate([
            'faixa_etaria' => 'required|string',
            'vacina_id' => 'required|exists:vacinas,id',
            'dose' => 'required|string',
            'intervalo_dias' => 'nullable|integer',
            'observacoes' => 'nullable|string',
        ]);

        $calendario->update($data);

        return $calendario;
    }

    /**
     * Remover um calendário vacinal
     */
    public function destroy(string $id)
    {
        CalendarioVacinal::destroy($id);
        return response()->json(['message' => 'Calendário removido com sucesso']);
    }
}

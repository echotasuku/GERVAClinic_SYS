<?php

namespace App\Http\Controllers;

use App\Models\Estoque;
use App\Models\User;
use App\Notifications\AlertaSistema;
use App\Events\NovoAlerta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class EstoqueController extends Controller
{
    public function index()
    {
        $estoques = Estoque::with('medicamento')->get();
        return response()->json($estoques);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lote' => 'required|string|max:255',
            'data_validade' => 'required|date|after:today',
            'quantidade_estoque' => 'required|integer|min:1',
            'medicamento_id' => 'required|exists:medicamentos,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $estoque = Estoque::create($request->all());
            $this->verificarEDispararAlertas();
            return response()->json($estoque, 201);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Medicamento nao encontrado'], 404);
        }
    }

    public function show($id)
    {
        $estoque = Estoque::with('medicamento')->findOrFail($id);
        return response()->json($estoque);
    }

    public function update(Request $request, $id)
    {
        $estoque = Estoque::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'lote' => 'required|string|max:255',
            'data_validade' => 'required|date|after:today',
            'quantidade_estoque' => 'required|integer|min:1',
            'medicamento_id' => 'required|exists:medicamentos,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $estoque->update($request->all());
        $this->verificarEDispararAlertas();
        return response()->json($estoque);
    }

    public function destroy($id)
    {
        $estoque = Estoque::findOrFail($id);
        $estoque->delete();
        $this->verificarEDispararAlertas();
        return response()->noContent();
    }

    private function verificarEDispararAlertas()
    {
        $usuarios = User::where('role', 'admin')->get();
        $todosAlertas = [];
        
        $estoqueBaixo = Estoque::with('medicamento')
            ->where('quantidade_estoque', '<', 10)
            ->get();

        foreach ($estoqueBaixo as $item) {
            $alerta = [
                'tipo' => 'estoque_baixo',
                'mensagem' => "Estoque baixo: {$item->medicamento->nome} - {$item->quantidade_estoque} unidades"
            ];
            $todosAlertas[] = $alerta;
            
            foreach ($usuarios as $usuario) {
                $usuario->notify(new AlertaSistema($alerta));
            }
        }

        $validadeProxima = Estoque::with('medicamento')
            ->whereDate('data_validade', '<=', now()->addDays(30))
            ->get();

        foreach ($validadeProxima as $item) {
            $alerta = [
                'tipo' => 'validade_proxima',
                'mensagem' => "Validade proxima: {$item->medicamento->nome} - Vence em " . now()->diffInDays($item->data_validade) . " dias"
            ];
            $todosAlertas[] = $alerta;
            
            foreach ($usuarios as $usuario) {
                $usuario->notify(new AlertaSistema($alerta));
            }
        }
        
        if (count($todosAlertas) > 0) {
            event(new NovoAlerta($todosAlertas, count($todosAlertas)));
        }
    }

    public function verificarAlertas()
    {
        $alertas = [];

        $estoqueBaixo = Estoque::with('medicamento')
            ->where('quantidade_estoque', '<', 10)
            ->get();

        foreach ($estoqueBaixo as $item) {
            $alertas[] = [
                'tipo' => 'estoque_baixo',
                'mensagem' => "Estoque baixo: {$item->medicamento->nome} - {$item->quantidade_estoque} unidades"
            ];
        }

        $validadeProxima = Estoque::with('medicamento')
            ->whereDate('data_validade', '<=', now()->addDays(30))
            ->get();

        foreach ($validadeProxima as $item) {
            $alertas[] = [
                'tipo' => 'validade_proxima',
                'mensagem' => "Validade proxima: {$item->medicamento->nome}"
            ];
        }

        return response()->json($alertas);
    }
}
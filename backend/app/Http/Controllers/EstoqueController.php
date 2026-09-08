<?php

namespace App\Http\Controllers;

use App\Models\Estoque;
use App\Models\User;
use App\Models\Vacina;
use App\Notifications\AlertaSistema;
use App\Notifications\AlertaSistemaEmail;
use App\Events\NovoAlerta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EstoqueController extends Controller
{
    public function index()
    {
        $estoques = Estoque::with('vacina')->get();
        return response()->json($estoques);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lote'                  => 'required|string|max:255',
            'preco_unitario'        => 'nullable|numeric|min:0',
            'quantidade_estoque'    => 'required|integer|min:1',
            'data_validade'         => 'required|date|after:today',
            'temperatura_recebimento' => 'nullable|numeric',
            'hora'                  => 'nullable|date_format:H:i',
            'vacina_id'             => 'required|exists:vacinas,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $dados = [
            'lote' => $request->lote,
            'preco_unitario' => $request->preco_unitario,
            'quantidade_estoque' => $request->quantidade_estoque,
            'data_validade' => $request->data_validade,
            'temperatura_recebimento' => $request->temperatura_recebimento,
            'hora' => $request->hora,
            'vacina_id' => $request->vacina_id,
        ];

        if (
            $request->filled('preco_unitario') &&
            $request->preco_unitario !== null
        ) {
            $dados['valor_total'] =
                (float) $request->quantidade_estoque *
                (float) $request->preco_unitario;
        } else {
            $dados['valor_total'] = null;
        }

        $estoque = Estoque::create($dados);

        $this->verificarEDispararAlertas();

        return response()->json($estoque, 201);
    }

    public function show($id)
    {
        $estoque = Estoque::with('vacina')->findOrFail($id);
        return response()->json($estoque);
    }

    public function update(Request $request, $id)
    {
        $estoque = Estoque::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'lote'                  => 'required|string|max:255',
            'preco_unitario'        => 'nullable|numeric|min:0',
            'quantidade_estoque'    => 'required|integer|min:1',
            'data_validade'         => 'required|date|after:today',
            'hora'                  => 'nullable|date_format:H:i',
            'temperatura_recebimento' => 'nullable|numeric',
            'vacina_id'             => 'required|exists:vacinas,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $dados = [
            'lote' => $request->lote,
            'preco_unitario' => $request->preco_unitario,
            'quantidade_estoque' => $request->quantidade_estoque,
            'data_validade' => $request->data_validade,
            'hora' => $request->hora,
            'temperatura_recebimento' => $request->temperatura_recebimento,
            'vacina_id' => $request->vacina_id,
        ];

        if (
            $request->filled('preco_unitario') &&
            $request->preco_unitario !== null
        ) {
            $dados['valor_total'] =
                (float) $request->quantidade_estoque *
                (float) $request->preco_unitario;
        } else {
            $dados['valor_total'] = null;
        }

        $estoque->update($dados);

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

        // ALERTA: ESTOQUE BAIXO
        $estoqueBaixo = Estoque::with('vacina')
            ->where('quantidade_estoque', '<', 10)
            ->get();

        foreach ($estoqueBaixo as $item) {
            $alerta = [
                'tipo'       => 'estoque_baixo',
                'mensagem'   => "Estoque baixo: {$item->vacina->nome} - {$item->quantidade_estoque} unidades",
                'link'       => '/estoque',
                'recurso_id' => $item->id,
            ];

            $todosAlertas[] = $alerta;

            foreach ($usuarios as $usuario) {
                $usuario->notify(new AlertaSistema($alerta));
                $usuario->notify(new AlertaSistemaEmail($alerta));
            }
        }

        // ALERTA: VALIDADE PRÓXIMA
        $validadeProxima = Estoque::with('vacina')
            ->whereDate('data_validade', '<=', now()->addDays(30))
            ->get();

        foreach ($validadeProxima as $item) {
            $dias = now()->diffInDays($item->data_validade);

            $alerta = [
                'tipo'       => 'validade_proxima',
                'mensagem'   => "Validade próxima: {$item->vacina->nome} - vence em {$dias} dias",
                'link'       => '/estoque',
                'recurso_id' => $item->id,
            ];

            $todosAlertas[] = $alerta;

            foreach ($usuarios as $usuario) {
                $usuario->notify(new AlertaSistema($alerta));
                $usuario->notify(new AlertaSistemaEmail($alerta));
            }
        }

        if (count($todosAlertas) > 0) {
            event(new NovoAlerta($todosAlertas, count($todosAlertas)));
        }
    }

    // Rota: /api/alertas — Lista apenas leitura
    public function verificarAlertas()
    {
        $alertas = [];

        $estoqueBaixo = Estoque::with('vacina')
            ->where('quantidade_estoque', '<', 10)
            ->get();

        foreach ($estoqueBaixo as $item) {
            $alertas[] = [
                'tipo'       => 'estoque_baixo',
                'mensagem'   => "Estoque baixo: {$item->vacina->nome} - {$item->quantidade_estoque} unidades",
                'link'       => '/estoque',
                'recurso_id' => $item->id,
            ];
        }

        $validadeProxima = Estoque::with('vacina')
            ->whereDate('data_validade', '<=', now()->addDays(30))
            ->get();

        foreach ($validadeProxima as $item) {
            $alertas[] = [
                'tipo'       => 'validade_proxima',
                'mensagem'   => "Validade próxima: {$item->vacina->nome}",
                'link'       => '/estoque',
                'recurso_id' => $item->id,
            ];
        }

        return response()->json($alertas);
    }
}
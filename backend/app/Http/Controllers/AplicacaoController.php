<?php
namespace App\Http\Controllers;

use App\Models\Aplicacao;
use App\Models\Estoque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AplicacaoController extends Controller
{
    public function index()
    {
        return Aplicacao::with([
            'profissional',
            'paciente',
            'estoque.vacina'
        ])->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_profissional' => 'required|exists:profissionais,id',
            'paciente_id' => 'required|exists:pacientes,id',
            'estoque_id' => 'required|exists:estoque,id',
            'observacoes' => 'nullable|string',
            'data_aplicacao' => 'required|date',
            'hora_aplicacao' => 'required|date_format:H:i',
            'desconto_percentual' => 'nullable|numeric|min:0|max:100',
            'desconto_valor' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(
                $validator->errors(),
                422
            );
        }

        if (
            $request->filled('desconto_percentual') &&
            $request->filled('desconto_valor')
        ) {
            return response()->json([
                'message' =>
                    'Informe o desconto em percentual ou em reais, não os dois.'
            ], 422);
        }

        try {
            $aplicacao = DB::transaction(function () use ($request) {
                $estoque = Estoque::lockForUpdate()
                    ->findOrFail($request->estoque_id);

                if ($estoque->quantidade_estoque <= 0) {
                    throw new \Exception(
                        'Não há doses disponíveis deste lote.'
                    );
                }

                if ($estoque->preco_unitario === null) {
                    throw new \Exception(
                        'Este lote não possui preço unitário cadastrado.'
                    );
                }

                $precoUnitario = (float) $estoque->preco_unitario;

                $descontoPercentual = null;
                $descontoValor = 0;
                $valorFinal = $precoUnitario;

                if ($request->filled('desconto_percentual')) {
                    $descontoPercentual =
                        (float) $request->desconto_percentual;

                    $descontoValor =
                        $precoUnitario *
                        ($descontoPercentual / 100);

                    $valorFinal =
                        $precoUnitario -
                        $descontoValor;
                } elseif ($request->filled('desconto_valor')) {
                    $descontoValor =
                        (float) $request->desconto_valor;

                    if ($descontoValor > $precoUnitario) {
                        throw new \Exception(
                            'O desconto em reais não pode ser maior que o preço unitário.'
                        );
                    }

                    $valorFinal =
                        $precoUnitario -
                        $descontoValor;
                }

                if ($valorFinal < 0) {
                    $valorFinal = 0;
                }

                $estoque->decrement(
                    'quantidade_estoque',
                    1
                );

                return Aplicacao::create([
                    'id_profissional' =>
                        $request->id_profissional,

                    'paciente_id' =>
                        $request->paciente_id,

                    'estoque_id' =>
                        $request->estoque_id,

                    'preco_unitario' =>
                        round($precoUnitario, 2),

                    'desconto_percentual' =>
                        $descontoPercentual !== null
                            ? round($descontoPercentual, 2)
                            : null,

                    'desconto_valor' =>
                        round($descontoValor, 2),

                    'valor_final' =>
                        round($valorFinal, 2),

                    'observacoes' =>
                        $request->observacoes,

                    'data_aplicacao' =>
                        $request->data_aplicacao,

                    'hora_aplicacao' =>
                        $request->hora_aplicacao,
                ]);
            });

            $aplicacao->load([
                'profissional',
                'paciente',
                'estoque.vacina'
            ]);

            return response()->json(
                $aplicacao,
                201
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function show($id)
    {
        return Aplicacao::with([
            'profissional',
            'paciente',
            'estoque.vacina'
        ])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $aplicacao = Aplicacao::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'id_profissional' => 'required|exists:profissionais,id',
            'paciente_id' => 'required|exists:pacientes,id',
            'estoque_id' => 'required|exists:estoque,id',
            'observacoes' => 'nullable|string',
            'data_aplicacao' => 'required|date',
            'hora_aplicacao' => 'required|date_format:H:i',
            'desconto_percentual' => 'nullable|numeric|min:0|max:100',
            'desconto_valor' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(
                $validator->errors(),
                422
            );
        }

        if (
            $request->filled('desconto_percentual') &&
            $request->filled('desconto_valor')
        ) {
            return response()->json([
                'message' =>
                    'Informe o desconto em percentual ou em reais, não os dois.'
            ], 422);
        }

        try {
            DB::transaction(function () use ($request, $aplicacao) {
                if (
                    $aplicacao->estoque_id ==
                    $request->estoque_id
                ) {
                    $precoUnitario =
                        $aplicacao->preco_unitario !== null
                            ? (float) $aplicacao->preco_unitario
                            : null;

                    if ($precoUnitario === null) {
                        $estoqueAtual = Estoque::lockForUpdate()
                            ->findOrFail($request->estoque_id);

                        if ($estoqueAtual->preco_unitario === null) {
                            throw new \Exception(
                                'Este lote não possui preço unitário cadastrado.'
                            );
                        }

                        $precoUnitario =
                            (float) $estoqueAtual->preco_unitario;
                    }

                    $descontoPercentual = null;
                    $descontoValor = 0;
                    $valorFinal = $precoUnitario;

                    if ($request->filled('desconto_percentual')) {
                        $descontoPercentual =
                            (float) $request->desconto_percentual;

                        $descontoValor =
                            $precoUnitario *
                            ($descontoPercentual / 100);

                        $valorFinal =
                            $precoUnitario -
                            $descontoValor;
                    } elseif ($request->filled('desconto_valor')) {
                        $descontoValor =
                            (float) $request->desconto_valor;

                        if ($descontoValor > $precoUnitario) {
                            throw new \Exception(
                                'O desconto em reais não pode ser maior que o preço unitário.'
                            );
                        }

                        $valorFinal =
                            $precoUnitario -
                            $descontoValor;
                    }

                    if ($valorFinal < 0) {
                        $valorFinal = 0;
                    }

                    $aplicacao->update([
                        'id_profissional' =>
                            $request->id_profissional,

                        'paciente_id' =>
                            $request->paciente_id,

                        'preco_unitario' =>
                            round($precoUnitario, 2),

                        'desconto_percentual' =>
                            $descontoPercentual !== null
                                ? round($descontoPercentual, 2)
                                : null,

                        'desconto_valor' =>
                            round($descontoValor, 2),

                        'valor_final' =>
                            round($valorFinal, 2),

                        'observacoes' =>
                            $request->observacoes,

                        'data_aplicacao' =>
                            $request->data_aplicacao,

                        'hora_aplicacao' =>
                            $request->hora_aplicacao,
                    ]);

                    return;
                }

                $estoqueAntigo = Estoque::lockForUpdate()
                    ->findOrFail($aplicacao->estoque_id);

                $estoqueAntigo->increment(
                    'quantidade_estoque',
                    1
                );

                $estoqueNovo = Estoque::lockForUpdate()
                    ->findOrFail($request->estoque_id);

                if ($estoqueNovo->quantidade_estoque <= 0) {
                    throw new \Exception(
                        'Não há doses disponíveis no novo lote.'
                    );
                }

                if ($estoqueNovo->preco_unitario === null) {
                    throw new \Exception(
                        'O novo lote não possui preço unitário cadastrado.'
                    );
                }

                $precoUnitario =
                    (float) $estoqueNovo->preco_unitario;

                $descontoPercentual = null;
                $descontoValor = 0;
                $valorFinal = $precoUnitario;

                if ($request->filled('desconto_percentual')) {
                    $descontoPercentual =
                        (float) $request->desconto_percentual;

                    $descontoValor =
                        $precoUnitario *
                        ($descontoPercentual / 100);

                    $valorFinal =
                        $precoUnitario -
                        $descontoValor;
                } elseif ($request->filled('desconto_valor')) {
                    $descontoValor =
                        (float) $request->desconto_valor;

                    if ($descontoValor > $precoUnitario) {
                        throw new \Exception(
                            'O desconto em reais não pode ser maior que o preço unitário.'
                        );
                    }

                    $valorFinal =
                        $precoUnitario -
                        $descontoValor;
                }

                if ($valorFinal < 0) {
                    $valorFinal = 0;
                }

                $estoqueNovo->decrement(
                    'quantidade_estoque',
                    1
                );

                $aplicacao->update([
                    'id_profissional' =>
                        $request->id_profissional,

                    'paciente_id' =>
                        $request->paciente_id,

                    'estoque_id' =>
                        $request->estoque_id,

                    'preco_unitario' =>
                        round($precoUnitario, 2),

                    'desconto_percentual' =>
                        $descontoPercentual !== null
                            ? round($descontoPercentual, 2)
                            : null,

                    'desconto_valor' =>
                        round($descontoValor, 2),

                    'valor_final' =>
                        round($valorFinal, 2),

                    'observacoes' =>
                        $request->observacoes,

                    'data_aplicacao' =>
                        $request->data_aplicacao,

                    'hora_aplicacao' =>
                        $request->hora_aplicacao,
                ]);
            });

            $aplicacao->load([
                'profissional',
                'paciente',
                'estoque.vacina'
            ]);

            return response()->json(
                $aplicacao
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function destroy($id)
    {
        try {
            DB::transaction(function () use ($id) {
                $aplicacao = Aplicacao::findOrFail($id);

                $estoque = Estoque::lockForUpdate()
                    ->findOrFail($aplicacao->estoque_id);

                $estoque->increment(
                    'quantidade_estoque',
                    1
                );

                $aplicacao->delete();
            });

            return response()->json([
                'message' =>
                    'Vacinação excluída e estoque atualizado com sucesso.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' =>
                    'Erro ao excluir vacinação.',
                'error' =>
                    $e->getMessage()
            ], 422);
        }
    }
}

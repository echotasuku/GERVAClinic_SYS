<?php
namespace App\Http\Controllers;

use App\Models\Aplicacao;
use App\Models\Estoque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AplicacaoController extends Controller
{
    // =========================================================
    // LISTAR APLICAÇÕES
    // =========================================================

    public function index()
    {
        return Aplicacao::with([
            'profissional',
            'paciente',
            'estoque.vacina'
        ])->get();
    }


    // =========================================================
    // REGISTRAR APLICAÇÃO
    // =========================================================

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_profissional' => 'required|exists:profissionais,id',
            'paciente_id' => 'required|exists:pacientes,id',
            'estoque_id' => 'required|exists:estoque,id',
            'observacoes' => 'nullable|string',
            'data_aplicacao' => 'required|date',
            'hora_aplicacao' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(
                $validator->errors(),
                422
            );
        }


        try {

            /*
             * Transação:
             * aplicação e alteração do estoque acontecem juntas.
             */
            $aplicacao = DB::transaction(function () use ($request) {

                // Busca o lote escolhido
                $estoque = Estoque::lockForUpdate()
                    ->findOrFail($request->estoque_id);


                // Verifica se ainda existe estoque disponível
                if ($estoque->quantidade_estoque <= 0) {

                    throw new \Exception(
                        'Não há doses disponíveis deste lote.'
                    );

                }


                // Diminui uma dose do estoque
                $estoque->decrement(
                    'quantidade_estoque',
                    1
                );


                // Registra a aplicação
                return Aplicacao::create([
                    'id_profissional' =>
                        $request->id_profissional,

                    'paciente_id' =>
                        $request->paciente_id,

                    'estoque_id' =>
                        $request->estoque_id,

                    'observacoes' =>
                        $request->observacoes,

                    'data_aplicacao' =>
                        $request->data_aplicacao,

                    'hora_aplicacao' =>
                        $request->hora_aplicacao,
                ]);

            });


            // Retorna a aplicação já com os relacionamentos
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


    // =========================================================
    // MOSTRAR APLICAÇÃO
    // =========================================================

    public function show($id)
    {
        return Aplicacao::with([
            'profissional',
            'paciente',
            'estoque.vacina'
        ])->findOrFail($id);
    }


    // =========================================================
    // ATUALIZAR APLICAÇÃO
    // =========================================================

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
        ]);

        if ($validator->fails()) {
            return response()->json(
                $validator->errors(),
                422
            );
        }


        try {

            DB::transaction(function () use ($request, $aplicacao) {

                /*
                 * Se o lote da aplicação não mudou,
                 * não precisamos alterar o estoque.
                 */
                if (
                    $aplicacao->estoque_id ==
                    $request->estoque_id
                ) {

                    $aplicacao->update([
                        'id_profissional' =>
                            $request->id_profissional,

                        'paciente_id' =>
                            $request->paciente_id,

                        'observacoes' =>
                            $request->observacoes,

                        'data_aplicacao' =>
                            $request->data_aplicacao,

                        'hora_aplicacao' =>
                            $request->hora_aplicacao,
                    ]);

                    return;
                }


                /*
                 * A aplicação mudou de lote.
                 *
                 * Devolve a dose para o lote antigo.
                 */
                $estoqueAntigo = Estoque::lockForUpdate()
                    ->findOrFail($aplicacao->estoque_id);

                $estoqueAntigo->increment(
                    'quantidade_estoque',
                    1
                );


                /*
                 * Retira uma dose do novo lote.
                 */
                $estoqueNovo = Estoque::lockForUpdate()
                    ->findOrFail($request->estoque_id);


                if ($estoqueNovo->quantidade_estoque <= 0) {

                    throw new \Exception(
                        'Não há doses disponíveis no novo lote.'
                    );

                }


                $estoqueNovo->decrement(
                    'quantidade_estoque',
                    1
                );


                /*
                 * Atualiza a aplicação.
                 */
                $aplicacao->update([
                    'id_profissional' =>
                        $request->id_profissional,

                    'paciente_id' =>
                        $request->paciente_id,

                    'estoque_id' =>
                        $request->estoque_id,

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


    // =========================================================
    // EXCLUIR APLICAÇÃO
    // =========================================================

    public function destroy($id)
    {
        try {

            DB::transaction(function () use ($id) {

                $aplicacao = Aplicacao::findOrFail($id);


                /*
                 * Recupera o lote usado na vacinação.
                 */
                $estoque = Estoque::lockForUpdate()
                    ->findOrFail($aplicacao->estoque_id);


                /*
                 * Devolve a dose ao estoque.
                 */
                $estoque->increment(
                    'quantidade_estoque',
                    1
                );


                /*
                 * Remove a aplicação.
                 */
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


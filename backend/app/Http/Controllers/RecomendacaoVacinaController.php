<?php

namespace App\Http\Controllers;

use App\Jobs\EnviarNotificacaoVacinaJob;
use App\Models\RecomendacaoVacina;
use App\Models\Paciente;
use App\Models\Vacina;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecomendacaoVacinaController extends Controller
{
    /**
     * Verifica se o usuário pode acessar o paciente.
     *
     * Admin e profissional podem acessar qualquer paciente.
     * Usuário comum somente o paciente do próprio e-mail.
     */
    private function autorizarPaciente(Request $request, Paciente $paciente)
    {
        $user = $request->user();

        // Admin e profissional podem acessar qualquer paciente
        if (
            $user->role === 'admin' ||
            $user->role === 'profissional'
        ) {
            return null;
        }

        // Usuário comum
        if (empty($user->email)) {
            return response()->json([
                'error' => 'Usuário não possui e-mail cadastrado.'
            ], 403);
        }

        if (empty($paciente->email)) {
            return response()->json([
                'error' => 'Este paciente não possui e-mail cadastrado.'
            ], 403);
        }

        if (
            strtolower(trim($user->email)) !==
            strtolower(trim($paciente->email))
        ) {
            return response()->json([
                'error' => 'Você não tem permissão para acessar estas recomendações.'
            ], 403);
        }

        return null;
    }


    /**
     * Lista recomendações.
     *
     * Admin/profissional:
     * retorna todas.
     *
     * Usuário comum:
     * retorna somente as do paciente vinculado ao seu e-mail.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Admin e profissional podem consultar todas
        if (
            $user->role === 'admin' ||
            $user->role === 'profissional'
        ) {
            return response()->json(
                RecomendacaoVacina::with([
                    'paciente',
                    'vacina'
                ])->get()
            );
        }

        // Usuário comum procura seu paciente pelo e-mail
        $paciente = Paciente::where(
            'email',
            $user->email
        )->first();

        // Ainda não existe paciente associado
        if (!$paciente) {
            return response()->json([
                'paciente' => null,
                'recomendacoes' => []
            ]);
        }

        $recomendacoes = RecomendacaoVacina::with([
            'paciente',
            'vacina'
        ])
        ->where('paciente_id', $paciente->id)
        ->get();

        return response()->json($recomendacoes);
    }


    /**
     * Cadastro de recomendação.
     *
     * Somente profissional/admin devem chegar aqui,
     * pois a rota será protegida pelo middleware.
     *
     * Depois de criar a recomendação,
     * coloca um Job na fila para enviar o e-mail ao paciente.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'paciente_id' => 'required|exists:pacientes,id',
            'vacina_id' => 'required|exists:vacinas,id',
            'data_recomendada' => 'required|date',
            'status' => 'required|in:pendente,aplicada',
        ]);

        if ($validator->fails()) {
            return response()->json(
                $validator->errors(),
                422
            );
        }

        // Cria a recomendação normalmente
        $recomendacao = RecomendacaoVacina::create(
            $request->all()
        );

        /*
        |--------------------------------------------------------------------------
        | ENVIO DO E-MAIL
        |--------------------------------------------------------------------------
        */

        // Busca o paciente
        $paciente = Paciente::find(
            $recomendacao->paciente_id
        );

        // Busca a vacina
        $vacina = Vacina::find(
            $recomendacao->vacina_id
        );

        /*
        |--------------------------------------------------------------------------
        | COLOCA O ENVIO NA FILA
        |--------------------------------------------------------------------------
        */

        if (
            $paciente &&
            !empty($paciente->email) &&
            $vacina
        ) {
            EnviarNotificacaoVacinaJob::dispatch(
                $paciente,
                $vacina,
                $recomendacao->data_recomendada
            );
        }

        return response()->json(
            $recomendacao,
            201
        );
    }


    /**
     * Consulta uma recomendação específica.
     */
    public function show(Request $request, $id)
    {
        $recomendacao = RecomendacaoVacina::with([
            'paciente',
            'vacina'
        ])->findOrFail($id);

        $erro = $this->autorizarPaciente(
            $request,
            $recomendacao->paciente
        );

        if ($erro) {
            return $erro;
        }

        return response()->json($recomendacao);
    }


    /**
     * Atualiza recomendação.
     *
     * A rota será protegida pelo middleware profissional.
     */
    public function update(Request $request, $id)
    {
        $recomendacao = RecomendacaoVacina::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'paciente_id' => 'required|exists:pacientes,id',
            'vacina_id' => 'required|exists:vacinas,id',
            'data_recomendada' => 'required|date',
            'status' => 'required|in:pendente,aplicada',
        ]);

        if ($validator->fails()) {
            return response()->json(
                $validator->errors(),
                422
            );
        }

        $recomendacao->update(
            $request->all()
        );

        return response()->json(
            $recomendacao
        );
    }


    /**
     * Exclui recomendação.
     *
     * A rota será protegida pelo middleware profissional.
     */
    public function destroy($id)
    {
        $recomendacao =
            RecomendacaoVacina::findOrFail($id);

        $recomendacao->delete();

        return response()->noContent();
    }


    /**
     * Gera recomendações automáticas.
     *
     * Somente profissional/admin devem acessar.
     */
    public function gerarAutomaticas($pacienteId)
    {
        $paciente = Paciente::with(
            'aplicacoes'
        )->findOrFail($pacienteId);

        $vacinas = Vacina::all();

        $recomendacoesCriadas = [];

        foreach ($vacinas as $vacina) {

            $jaAplicada = $paciente
                ->aplicacoes
                ->where('vacina_id', $vacina->id)
                ->count() > 0;

            if (!$jaAplicada) {

                $recomendacao =
                    RecomendacaoVacina::firstOrCreate(
                        [
                            'paciente_id' => $paciente->id,
                            'vacina_id' => $vacina->id,
                        ],
                        [
                            'data_recomendada' => now(),
                            'status' => 'pendente',
                        ]
                    );

                /*
                |--------------------------------------------------------------------------
                | ENVIA E-MAIL PARA RECOMENDAÇÃO AUTOMÁTICA
                |--------------------------------------------------------------------------
                */

                if (
                    $paciente &&
                    !empty($paciente->email)
                ) {
                    EnviarNotificacaoVacinaJob::dispatch(
                        $paciente,
                        $vacina,
                        $recomendacao->data_recomendada
                    );
                }

                $recomendacoesCriadas[] =
                    $recomendacao;
            }
        }

        return response()->json(
            $recomendacoesCriadas
        );
    }
}
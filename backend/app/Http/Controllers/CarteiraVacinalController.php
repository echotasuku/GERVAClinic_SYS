<?php

namespace App\Http\Controllers;

use App\Models\Aplicacao;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class CarteiraVacinalController extends Controller
{
    /**
     * Verifica se o usuário pode acessar determinado paciente.
     *
     * Admin e profissional:
     * podem acessar qualquer paciente.
     *
     * Usuário comum:
     * somente o paciente cujo e-mail corresponde ao seu e-mail.
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

        // Usuário comum precisa ter e-mail
        if (empty($user->email)) {
            return response()->json([
                'error' => 'Usuário não possui e-mail cadastrado.'
            ], 403);
        }

        // Paciente precisa ter e-mail
        if (empty($paciente->email)) {
            return response()->json([
                'error' => 'Este paciente não possui e-mail cadastrado.'
            ], 403);
        }

        // Compara os e-mails ignorando maiúsculas/minúsculas e espaços
        if (
            strtolower(trim($user->email)) !==
            strtolower(trim($paciente->email))
        ) {
            return response()->json([
                'error' => 'Você não tem permissão para acessar esta carteira.'
            ], 403);
        }

        return null;
    }


    /**
     * Procura automaticamente o paciente relacionado
     * ao e-mail do usuário autenticado.
     */
    private function buscarPacienteDoUsuario(Request $request)
    {
        $user = $request->user();

        // Usuário precisa possuir e-mail
        if (empty($user->email)) {
            return null;
        }

        return Paciente::whereRaw(
            'LOWER(TRIM(email)) = ?',
            [strtolower(trim($user->email))]
        )->first();
    }


    /**
     * Retorna as aplicações da carteira de um paciente.
     */
    private function buscarAplicacoes($pacienteId)
    {
        return Aplicacao::with([
            'estoque.vacina',
            'profissional'
        ])
        ->where('paciente_id', $pacienteId)
        ->orderBy('data_aplicacao', 'ASC')
        ->orderBy('hora_aplicacao', 'ASC')
        ->get();
    }


    /**
     * Retorna a carteira do usuário comum.
     *
     * O paciente é encontrado automaticamente pelo
     * e-mail da conta autenticada.
     */
    public function minhaCarteira(Request $request)
    {
        $user = $request->user();

        // Verifica se o usuário possui e-mail
        if (empty($user->email)) {
            return response()->json([
                'error' => 'Usuário não possui e-mail cadastrado.'
            ], 403);
        }

        // Procura o paciente pelo e-mail do usuário logado
        $paciente = $this->buscarPacienteDoUsuario($request);

        if (!$paciente) {
            return response()->json([
                'error' => 'Nenhum paciente está vinculado a este e-mail.'
            ], 404);
        }

        $aplicacoes = $this->buscarAplicacoes($paciente->id);

        return response()->json([
            'paciente' => $paciente,
            'aplicacoes' => $aplicacoes
        ]);
    }


    /**
     * Exporta a carteira do próprio usuário em PDF.
     *
     * O paciente é localizado automaticamente pelo
     * e-mail da conta autenticada.
     */
    public function exportarMinhaCarteira(Request $request)
    {
        $user = $request->user();

        // Verifica se o usuário possui e-mail
        if (empty($user->email)) {
            return response()->json([
                'error' => 'Usuário não possui e-mail cadastrado.'
            ], 403);
        }

        // Procura o paciente pelo e-mail
        $paciente = $this->buscarPacienteDoUsuario($request);

        if (!$paciente) {
            return response()->json([
                'error' => 'Nenhum paciente está vinculado a este e-mail.'
            ], 404);
        }

        $aplicacoes = $this->buscarAplicacoes($paciente->id);

        $pdf = Pdf::loadView('carteira-vacinal.pdf', [
            'paciente' => $paciente,
            'aplicacoes' => $aplicacoes
        ]);

        return $pdf->download(
            'carteira-vacinal-' .
            preg_replace('/\s+/', '-', $paciente->nome) .
            '.pdf'
        );
    }


    /**
     * Exibe a carteira de determinado paciente.
     *
     * Admin/profissional podem acessar qualquer paciente.
     * Usuário comum somente o paciente correspondente ao seu e-mail.
     */
    public function show(Request $request, $pacienteId)
    {
        $paciente = Paciente::findOrFail($pacienteId);

        // Verifica a permissão
        $erro = $this->autorizarPaciente($request, $paciente);

        if ($erro) {
            return $erro;
        }

        $aplicacoes = $this->buscarAplicacoes($pacienteId);

        return response()->json([
            'paciente' => $paciente,
            'aplicacoes' => $aplicacoes
        ]);
    }


    /**
     * Exporta a carteira vacinal de determinado paciente em PDF.
     *
     * Admin/profissional podem exportar qualquer paciente.
     * Usuário comum somente seu próprio paciente.
     */
    public function exportar(Request $request, $pacienteId)
    {
        $paciente = Paciente::findOrFail($pacienteId);

        // Verifica a permissão
        $erro = $this->autorizarPaciente($request, $paciente);

        if ($erro) {
            return $erro;
        }

        $aplicacoes = $this->buscarAplicacoes($pacienteId);

        $pdf = Pdf::loadView('carteira-vacinal.pdf', [
            'paciente' => $paciente,
            'aplicacoes' => $aplicacoes
        ]);

        return $pdf->download(
            'carteira-vacinal-' .
            preg_replace('/\s+/', '-', $paciente->nome) .
            '.pdf'
        );
    }
}
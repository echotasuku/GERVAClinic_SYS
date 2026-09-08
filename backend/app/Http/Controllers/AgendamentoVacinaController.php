<?php

namespace App\Http\Controllers;

use App\Models\AgendamentoVacina;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Jobs\EnviarNotificacaoVacinaJob; 
use App\Models\Paciente;
use App\Models\Vacina;
use App\Mail\NotificacaoVacinaMail; 
use Illuminate\Support\Facades\Mail;

class AgendamentoVacinaController extends Controller
{
    public function index()
    {
        // ✅ Carrega a aplicação E TAMBÉM o paciente, profissional e vacina dentro dela
        return AgendamentoVacina::with([
            'aplicacao.paciente',
            'aplicacao.profissional',
            'aplicacao.estoque.vacina'
        ])->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'aplicacao_id' => 'required|exists:aplicacoes,id',
            'data_prevista' => 'required|date|after:today',
            'status' => 'required|in:pendente,aplicada,atrasada',
            'observacoes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $agendamento = AgendamentoVacina::create($request->all());

        // Para pegar paciente e vacina, buscamos através da aplicação vinculada
        $aplicacao = \App\Models\Aplicacao::with(['paciente', 'estoque.vacina'])->findOrFail($request->aplicacao_id);
        
        $paciente = $aplicacao->paciente;
        $vacina = $aplicacao->estoque->vacina;

        // agenda o envio do e-mail 1 dia antes da data prevista
        EnviarNotificacaoVacinaJob::dispatch($paciente, $vacina, $agendamento->data_prevista)
            ->delay(now()->parse($agendamento->data_prevista)->subDay());

        // Retorna o agendamento já com os relacionamentos carregados
        return response()->json($agendamento->load([
            'aplicacao.paciente',
            'aplicacao.profissional',
            'aplicacao.estoque.vacina'
        ]), 201);
    }

    public function show($id)
    {
        return AgendamentoVacina::with([
            'aplicacao.paciente',
            'aplicacao.profissional',
            'aplicacao.estoque.vacina'
        ])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $agendamento = AgendamentoVacina::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'aplicacao_id' => 'required|exists:aplicacoes,id',
            'data_prevista' => 'required|date', // Removi 'after:today' para permitir edição de datas passadas se necessário
            'status' => 'required|in:pendente,aplicada,atrasada',
            'observacoes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $agendamento->update($request->all());
        
        return response()->json($agendamento->load([
            'aplicacao.paciente',
            'aplicacao.profissional',
            'aplicacao.estoque.vacina'
        ]));
    }

    public function destroy($id)
    {
        $agendamento = AgendamentoVacina::findOrFail($id);
        $agendamento->delete();
        return response()->noContent();
    }

    public function enviarNotificacao($pacienteId, $vacinaId)
    {
        $paciente = Paciente::findOrFail($pacienteId);
        $vacina   = Vacina::findOrFail($vacinaId);

        $mensagem = "Olá {$paciente->nome}, sua próxima dose da vacina {$vacina->nome} está agendada.";

        Mail::to($paciente->email)->send(new NotificacaoVacinaMail($mensagem));

        return response()->json(['status' => 'Email enviado com sucesso!']);
    }
}
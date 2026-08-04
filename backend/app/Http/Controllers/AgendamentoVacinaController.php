<?php

namespace App\Http\Controllers;

use App\Models\AgendamentoVacina;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Jobs\EnviarNotificacaoVacinaJob; // importa o Job
use App\Models\Paciente;
use App\Models\Vacina;
use App\Mail\NotificacaoVacinaMail; // importa o Mailable
use Illuminate\Support\Facades\Mail;

class AgendamentoVacinaController extends Controller
{
    public function index()
    {
        return AgendamentoVacina::with('aplicacao')->get();
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

        // pega paciente e vacina relacionados
        $paciente = Paciente::findOrFail($request->paciente_id);
        $vacina   = Vacina::findOrFail($request->vacina_id);

        // agenda o envio do e-mail 1 dia antes da data prevista
        EnviarNotificacaoVacinaJob::dispatch($paciente, $vacina, $agendamento->data_prevista)
            ->delay(now()->parse($agendamento->data_prevista)->subDay());

        return response()->json($agendamento, 201);
    }

    public function show($id)
    {
        return AgendamentoVacina::with('aplicacao')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $agendamento = AgendamentoVacina::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'aplicacao_id' => 'required|exists:aplicacoes,id',
            'data_prevista' => 'required|date|after:today',
            'status' => 'required|in:pendente,aplicada,atrasada',
            'observacoes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $agendamento->update($request->all());
        return response()->json($agendamento);
    }

    public function destroy($id)
    {
        $agendamento = AgendamentoVacina::findOrFail($id);
        $agendamento->delete();
        return response()->noContent();
    }

    // método extra para enviar notificação manualmente
    public function enviarNotificacao($pacienteId, $vacinaId)
    {
        $paciente = Paciente::findOrFail($pacienteId);
        $vacina   = Vacina::findOrFail($vacinaId);

        $mensagem = "Olá {$paciente->nome}, sua próxima dose da vacina {$vacina->nome} está agendada para {$vacina->data_agendada}.";

        Mail::to($paciente->email)->send(new NotificacaoVacinaMail($mensagem));

        return response()->json(['status' => 'Email enviado com sucesso!']);
    }
}

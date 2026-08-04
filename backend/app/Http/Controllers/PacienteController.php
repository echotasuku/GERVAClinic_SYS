<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Barryvdh\DomPDF\Facade\Pdf; // importa o DomPDF
use App\Mail\NotificacaoVacinaMail; // importa o Mailable
use Illuminate\Support\Facades\Mail; // importa o Mail

class PacienteController extends Controller
{
    public function index()
    {
        return Paciente::all();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string',
            'cpf' => 'required|string|unique:pacientes,cpf',
            'data_nascimento' => 'required|date',
            'logradouro' => 'nullable|string',
            'bairro' => 'nullable|string',
            'cidade' => 'nullable|string',
            'uf' => 'nullable|string|max:2',
            'cep' => 'nullable|string|max:8',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        return Paciente::create($request->all());
    }

    public function show($id)
    {
        return Paciente::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $paciente = Paciente::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nome' => 'required|string',
            'cpf' => 'required|string|unique:pacientes,cpf,' . $id,
            'data_nascimento' => 'required|date',
            'logradouro' => 'nullable|string',
            'bairro' => 'nullable|string',
            'cidade' => 'nullable|string',
            'uf' => 'nullable|string|max:2',
            'cep' => 'nullable|string|max:8',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $paciente->update($request->all());
        return $paciente;
    }

    public function destroy($id)
    {
        $paciente = Paciente::findOrFail($id);
        $paciente->delete();
        return response()->noContent();
    }

    // Função para consultar CEP
    public function consultarCep($cep)
    {
        $response = Http::get("https://viacep.com.br/ws/{$cep}/json/");
        return response()->json($response->json());
    }

    // Função para exportar histórico vacinal em PDF
    public function exportarHistorico($id)
    {
        $paciente = Paciente::with('aplicacoes.vacina', 'aplicacoes.profissional')->findOrFail($id);

        $pdf = Pdf::loadView('pdf.historico', compact('paciente'));
        return $pdf->download("historico_vacinal_{$paciente->nome}.pdf");
    }

    // Função para enviar notificação por e-mail
    public function enviarNotificacao($pacienteId)
    {
        $paciente = Paciente::findOrFail($pacienteId);
        $mensagem = "Olá {$paciente->nome}, lembre-se da sua próxima dose de vacina!";

        Mail::to($paciente->email)->send(new NotificacaoVacinaMail($mensagem));

        return response()->json(['status' => 'Email enviado com sucesso!']);
    }
}

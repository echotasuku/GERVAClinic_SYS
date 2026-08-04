<?php

namespace App\Jobs;

use App\Mail\NotificacaoVacinaMail;
use App\Models\Paciente;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class EnviarNotificacaoVacinaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $paciente;
    protected $vacina;
    protected $dataAgendada;

    public function __construct($paciente, $vacina, $dataAgendada)
    {
        $this->paciente = $paciente;
        $this->vacina = $vacina;
        $this->dataAgendada = $dataAgendada;
    }

    public function handle()
    {
        $mensagem = "Olá {$this->paciente->nome}, sua próxima dose da vacina {$this->vacina->nome} está marcada para {$this->dataAgendada}.";
        Mail::to($this->paciente->email)->send(new NotificacaoVacinaMail($mensagem));
    }
}



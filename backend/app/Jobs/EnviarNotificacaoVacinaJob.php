<?php

namespace App\Jobs;

use App\Mail\NotificacaoVacinaMail;
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

    /**
     * Cria uma nova instância do Job.
     */
    public function __construct($paciente, $vacina, $dataAgendada)
    {
        $this->paciente = $paciente;
        $this->vacina = $vacina;
        $this->dataAgendada = $dataAgendada;
    }

    /**
     * Executa o Job.
     */
    public function handle()
    {
        // Verifica se o paciente possui e-mail
        if (empty($this->paciente->email)) {
            return;
        }

        // Verifica se existe uma vacina
        if (!$this->vacina) {
            return;
        }

        // Envia o e-mail utilizando o Mailable existente
        Mail::to($this->paciente->email)->send(
            new NotificacaoVacinaMail(
                $this->paciente,
                $this->vacina,
                $this->dataAgendada
            )
        );
    }
}
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NotificacaoVacinaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $paciente;
    public $vacina;
    public $dataAgendada;

    public function __construct($paciente, $vacina, $dataAgendada)
    {
        $this->paciente = $paciente;
        $this->vacina = $vacina;
        $this->dataAgendada = $dataAgendada;
    }

    public function build()
    {
        return $this
            ->subject('Notificação de Vacinação')
            ->view('emails.notificacao')
            ->with([
                'paciente' => $this->paciente,
                'vacina' => $this->vacina,
                'dataAgendada' => $this->dataAgendada,
            ]);
    }
}
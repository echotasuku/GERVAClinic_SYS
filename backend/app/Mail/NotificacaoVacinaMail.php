<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;


class NotificacaoVacinaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $paciente;
    public $vacina;
    public $dataAgendada;

    /**
     * Cria uma nova instância da mensagem.
     */
    public function __construct($paciente, $vacina, $dataAgendada)
    {
        $this->paciente = $paciente;
        $this->vacina = $vacina;
        $this->dataAgendada = $dataAgendada;
    }

    /**
     * Constrói o e-mail.
     */
    public function build()
    {
        return $this->subject('Notificação de Vacinação')
                    ->view('emails.notificacao')
                    ->with([
                        'paciente' => $this->paciente,
                        'vacina' => $this->vacina,
                        'dataAgendada' => $this->dataAgendada,
                    ]);
    }
}



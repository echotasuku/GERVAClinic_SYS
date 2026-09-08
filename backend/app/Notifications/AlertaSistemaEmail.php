<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class AlertaSistemaEmail extends Notification
{
    use Queueable;

    public $dados;

    public function __construct($dados)
    {
        $this->dados = $dados;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $assunto = $this->dados['tipo'] === 'validade_proxima' 
            ? 'ALERTA: Validade Próxima de Vacina'
            : 'ALERTA: Estoque Baixo';

        $nomeAdmin = $notifiable->name ?? 'Administrador';

        return (new MailMessage)
            ->subject($assunto)
            ->view('emails.alerta-sistema', [
                'nomeAdmin' => $nomeAdmin,
                'dados'     => $this->dados,
            ]);
    }
}
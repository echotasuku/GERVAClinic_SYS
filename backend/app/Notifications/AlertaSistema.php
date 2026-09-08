<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AlertaSistema extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $dados;

    public function __construct($dados)
    {
        $this->dados = $dados;
    }

    public function via($notifiable)
    {
        // Salva no banco de dados E envia em tempo real via broadcast
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'tipo'       => $this->dados['tipo'],
            'mensagem'   => $this->dados['mensagem'],
            'link'       => $this->dados['link'] ?? null,        // ✅ Novo: link de redirecionamento
            'recurso_id' => $this->dados['recurso_id'] ?? null,  // ✅ Novo: ID do recurso relacionado
            'created_at' => now()->toDateTimeString(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'id'         => $this->id,
            'tipo'       => $this->dados['tipo'],
            'mensagem'   => $this->dados['mensagem'],
            'link'       => $this->dados['link'] ?? null,        // ✅ Novo: link de redirecionamento
            'recurso_id' => $this->dados['recurso_id'] ?? null,  // ✅ Novo: ID do recurso relacionado
            'created_at' => now()->toDateTimeString(),
        ]);
    }

    public function broadcastType()
    {
        return 'alerta.sistema';
    }
}
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NovoAlerta implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $alertas;
    public $quantidade;

    public function __construct($alertas, $quantidade)
    {
        $this->alertas = $alertas;
        $this->quantidade = $quantidade;
    }

    public function broadcastOn()
    {
        return new Channel('alertas');
    }

    public function broadcastAs()
    {
        return 'novo-alerta';
    }
}
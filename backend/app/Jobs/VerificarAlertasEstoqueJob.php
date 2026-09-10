<?php

namespace App\Jobs;

use App\Models\Estoque;
use App\Models\User;
use App\Notifications\AlertaSistema;
use App\Notifications\AlertaSistemaEmail;
use App\Events\NovoAlerta;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class VerificarAlertasEstoqueJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $usuarios = User::where('role', 'admin')->get();
        $todosAlertas = [];

        // ALERTA: ESTOQUE BAIXO
        $estoqueBaixo = Estoque::with('vacina')
            ->where('quantidade_estoque', '<', 10)
            ->get();

        foreach ($estoqueBaixo as $item) {
            $alerta = [
                'tipo'       => 'estoque_baixo',
                'mensagem'   => "Estoque baixo: {$item->vacina->nome} - Lote {$item->lote} - {$item->quantidade_estoque} unidades",
                'link'       => '/estoque',
                'recurso_id' => $item->id,
            ];
            $todosAlertas[] = $alerta;

            foreach ($usuarios as $usuario) {
                $usuario->notify(new AlertaSistema($alerta));
                $usuario->notify(new AlertaSistemaEmail($alerta));
            }
        }

        // ALERTA: VALIDADE PRÓXIMA
        $validadeProxima = Estoque::with('vacina')
            ->whereDate('data_validade', '<=', now()->addDays(30))
            ->get();

        foreach ($validadeProxima as $item) {
            $dias = now()->diffInDays($item->data_validade);
            $alerta = [
                'tipo'       => 'validade_proxima',
                'mensagem'   => "Validade próxima: {$item->vacina->nome} - Lote {$item->lote} - vence em {$dias} dias",
                'link'       => '/estoque',
                'recurso_id' => $item->id,
            ];
            $todosAlertas[] = $alerta;

            foreach ($usuarios as $usuario) {
                $usuario->notify(new AlertaSistema($alerta));
                $usuario->notify(new AlertaSistemaEmail($alerta));
            }
        }

        if (count($todosAlertas) > 0) {
            event(new NovoAlerta($todosAlertas, count($todosAlertas)));
        }
    }
}
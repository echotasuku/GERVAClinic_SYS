<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificacaoController extends Controller
{
    // TODAS as notificações (para a página)
    public function index()
    {
        $notificacoes = auth()->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notificacao) {
                return [
                    'id' => $notificacao->id,
                    'tipo' => $notificacao->data['tipo'] ?? 'desconhecido',
                    'mensagem' => $notificacao->data['mensagem'] ?? 'Sem mensagem',
                    'lida' => !is_null($notificacao->read_at),
                    'created_at' => $notificacao->created_at
                ];
            });
            
        return response()->json($notificacoes);
    }

    // Apenas NÃO LIDAS (para o dropdown)
    public function naoLidas()
    {
        $notificacoes = auth()->user()->unreadNotifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notificacao) {
                return [
                    'id' => $notificacao->id,
                    'tipo' => $notificacao->data['tipo'] ?? 'desconhecido',
                    'mensagem' => $notificacao->data['mensagem'] ?? 'Sem mensagem',
                    'created_at' => $notificacao->created_at
                ];
            });
            
        return response()->json($notificacoes);
    }

    // Marcar como lida (some do dropdown)
    public function marcarComoLida($id)
    {
        $notificacao = auth()->user()->notifications()->findOrFail($id);
        $notificacao->markAsRead();
        return response()->json(['ok' => true]);
    }

    // Deletar uma notificação
    public function destroy($id)
    {
        $notificacao = auth()->user()->notifications()->findOrFail($id);
        $notificacao->delete();
        return response()->json(['ok' => true]);
    }

    // Deletar TODAS as notificações
    public function destroyAll()
    {
        auth()->user()->notifications()->delete();
        return response()->json(['ok' => true]);
    }
}
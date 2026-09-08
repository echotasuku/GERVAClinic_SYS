<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VacinaController;
use App\Http\Controllers\EsquemaVacinalController;
use App\Http\Controllers\TipoVacinaController;
use App\Http\Controllers\FornecedorController;
use App\Http\Controllers\AplicacaoController;
use App\Http\Controllers\ProfissionalController;
use App\Http\Controllers\AgendamentoVacinaController;
use App\Http\Controllers\RecomendacaoVacinaController;
use App\Http\Controllers\EstoqueController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\NotificacaoController;
use App\Http\Controllers\RelatorioController;
use App\Http\Controllers\CalendarioVacinalController;
use App\Http\Controllers\CarteiraVacinalController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Broadcast;

// =====================================================
// USUÁRIO AUTENTICADO
// =====================================================
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// =====================================================
// ROTAS QUE QUALQUER USUÁRIO AUTENTICADO PODE CONSULTAR
// =====================================================
Route::middleware('auth:sanctum')->group(function () {
    // =================================================
    // RECOMENDAÇÕES - SOMENTE CONSULTA
    //
    // ADMIN/PROFISSIONAL -> podem consultar todas
    // USUÁRIO COMUM      -> controller filtra as dele
    // =================================================
    Route::get(
        '/recomendacoes-vacinas',
        [RecomendacaoVacinaController::class, 'index']
    );
    Route::get(
        '/recomendacoes-vacinas/{id}',
        [RecomendacaoVacinaController::class, 'show']
    );

    // =================================================
    // MINHA CARTEIRA VACINAL
    //
    // USUÁRIO COMUM
    //
    // O paciente é encontrado automaticamente pelo
    // e-mail do usuário autenticado.
    //
    // NÃO precisa enviar ID do paciente.
    // =================================================
    Route::get(
        '/minha-carteira',
        [CarteiraVacinalController::class, 'minhaCarteira']
    );
    Route::get(
        '/minha-carteira/exportar',
        [CarteiraVacinalController::class, 'exportarMinhaCarteira']
    );
    Route::get(
        '/carteira-vacinal/{pacienteId}',
        [CarteiraVacinalController::class, 'show']
    );
    Route::get(
        '/carteira-vacinal/{pacienteId}/exportar',
        [CarteiraVacinalController::class, 'exportar']
    );
});

Route::middleware([
    'auth:sanctum',
    'profissional'
])->group(function () {
    // =================================================
    // APLICAÇÕES
    // =================================================
    Route::apiResource(
        'aplicacoes',
        AplicacaoController::class
    );

    // =================================================
    // ESQUEMAS VACINAIS
    // =================================================
    Route::apiResource(
        'esquemas-vacinais',
        EsquemaVacinalController::class
    );

    // =================================================
    // RECOMENDAÇÕES
    // CRUD COMPLETO
    // =================================================
    Route::get(
        '/recomendacoes-vacinas/gerar-automaticas/{pacienteId}',
        [RecomendacaoVacinaController::class, 'gerarAutomaticas']
    );
    Route::post(
        '/recomendacoes-vacinas',
        [RecomendacaoVacinaController::class, 'store']
    );
    Route::put(
        '/recomendacoes-vacinas/{id}',
        [RecomendacaoVacinaController::class, 'update']
    );
    Route::patch(
        '/recomendacoes-vacinas/{id}',
        [RecomendacaoVacinaController::class, 'update']
    );
    Route::delete(
        '/recomendacoes-vacinas/{id}',
        [RecomendacaoVacinaController::class, 'destroy']
    );

    // =================================================
    // AGENDAMENTOS
    // =================================================
    Route::apiResource(
        'agendamentos-vacinas',
        AgendamentoVacinaController::class
    );
    Route::post(
        '/agendamentos-vacinas/{pacienteId}/{vacinaId}/enviar-notificacao',
        [AgendamentoVacinaController::class, 'enviarNotificacao']
    );

    // =================================================
    // CALENDÁRIOS
    // =================================================
    Route::apiResource(
        'calendarios-vacinais',
        CalendarioVacinalController::class
    );
    Route::get(
        '/calendarios-vacinais/gerar-recomendacoes/{pacienteId}',
        [CalendarioVacinalController::class, 'gerarRecomendacoes']
    );

    // =================================================
    // PLANEJAMENTO
    // =================================================
    Route::get(
        '/planejamento',
        [VacinaController::class, 'planejamento']
    );

    // =================================================
    // PACIENTES
    //
    // SOMENTE ADMIN/PROFISSIONAL
    //
    // Usuário comum NÃO possui acesso.
    // =================================================
    // Deve ficar antes de /pacientes/{paciente}
    Route::get(
        '/pacientes/consultar-cep/{cep}',
        [PacienteController::class, 'consultarCep']
    );
    Route::get(
        '/pacientes',
        [PacienteController::class, 'index']
    );
    Route::post(
        '/pacientes',
        [PacienteController::class, 'store']
    );
    Route::get(
        '/pacientes/{paciente}',
        [PacienteController::class, 'show']
    );
    Route::put(
        '/pacientes/{paciente}',
        [PacienteController::class, 'update']
    );
    Route::patch(
        '/pacientes/{paciente}',
        [PacienteController::class, 'update']
    );
    Route::delete(
        '/pacientes/{paciente}',
        [PacienteController::class, 'destroy']
    );
    Route::get(
        '/pacientes/{id}/historico/exportar',
        [PacienteController::class, 'exportarHistorico']
    );

    // =================================================
    // PROFISSIONAIS
    //
    // Profissional pode consultar.
    // CRUD continua no ADMIN.
    // =================================================
    Route::get(
        '/profissionais',
        [ProfissionalController::class, 'index']
    );
    Route::get(
        '/profissionais/{id}',
        [ProfissionalController::class, 'show']
    );

    // =================================================
    // ESTOQUE
    //
    // Profissional pode consultar.
    // CRUD continua no ADMIN.
    // =================================================
    Route::get(
        '/estoque',
        [EstoqueController::class, 'index']
    );
    Route::get(
        '/estoque/{id}',
        [EstoqueController::class, 'show']
    );

    // =================================================
    // VACINAS
    //
    // Profissional pode consultar.
    // CRUD continua no ADMIN.
    // =================================================
    Route::get(
        '/vacinas',
        [VacinaController::class, 'index']
    );
    Route::get(
        '/vacinas/{vacina}',
        [VacinaController::class, 'show']
    );

    // =================================================
    // RELATÓRIOS
    //
    // Profissional e Admin podem consultar/exportar.
    // =================================================
    Route::get(
        '/relatorios',
        [RelatorioController::class, 'index']
    );
    Route::get(
        '/relatorios/exportar',
        [RelatorioController::class, 'exportar']
    );
});

// =====================================================
// ROTAS EXCLUSIVAS DO ADMIN
// =====================================================
Route::middleware([
    'auth:sanctum',
    'admin'
])->group(function () {
    // =================================================
    // DASHBOARD
    // =================================================
    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    );

    // =================================================
    // TIPOS DE VACINA
    // =================================================
    Route::apiResource(
        'tipos-vacinas',
        TipoVacinaController::class
    );

    // =================================================
    // FORNECEDORES
    // =================================================
    Route::apiResource(
        'fornecedores',
        FornecedorController::class
    );

    // =================================================
    // VACINAS
    // =================================================
    Route::post(
        '/vacinas',
        [VacinaController::class, 'store']
    );
    Route::put(
        '/vacinas/{vacina}',
        [VacinaController::class, 'update']
    );
    Route::patch(
        '/vacinas/{vacina}',
        [VacinaController::class, 'update']
    );
    Route::delete(
        '/vacinas/{vacina}',
        [VacinaController::class, 'destroy']
    );

    // =================================================
    // PROFISSIONAIS
    // =================================================
    Route::post(
        '/profissionais',
        [ProfissionalController::class, 'store']
    );
    Route::put(
        '/profissionais/{profissional}',
        [ProfissionalController::class, 'update']
    );
    Route::patch(
        '/profissionais/{profissional}',
        [ProfissionalController::class, 'update']
    );
    Route::delete(
        '/profissionais/{profissional}',
        [ProfissionalController::class, 'destroy']
    );

    // =================================================
    // ESTOQUE
    // =================================================
    Route::post(
        '/estoque',
        [EstoqueController::class, 'store']
    );
    Route::put(
        '/estoque/{estoque}',
        [EstoqueController::class, 'update']
    );
    Route::patch(
        '/estoque/{estoque}',
        [EstoqueController::class, 'update']
    );
    Route::delete(
        '/estoque/{estoque}',
        [EstoqueController::class, 'destroy']
    );

    // =================================================
    // NOTIFICAÇÃO DE PACIENTE
    // =================================================
    Route::post(
        '/pacientes/{id}/enviar-notificacao',
        [PacienteController::class, 'enviarNotificacao']
    );

    // =================================================
    // NOTIFICAÇÕES DO SISTEMA
    // =================================================
    Route::get(
        '/notificacoes',
        [NotificacaoController::class, 'index']
    );
    Route::get(
        '/notificacoes-nao-lidas',
        [NotificacaoController::class, 'naoLidas']
    );
    Route::post(
        '/notificacoes/{id}/ler',
        [NotificacaoController::class, 'marcarComoLida']
    );
    Route::post(
        '/notificacoes/marcar-todas-lidas',
        [NotificacaoController::class, 'marcarTodasComoLida']
    );
    Route::delete(
        '/notificacoes/{id}',
        [NotificacaoController::class, 'destroy']
    );
    Route::delete(
        '/notificacoes',
        [NotificacaoController::class, 'destroyAll']
    );

    // =================================================
    // ALERTAS
    // =================================================
    Route::get(
        '/alertas',
        [EstoqueController::class, 'verificarAlertas']
    );
});

// =====================================================
// GOOGLE LOGIN
// =====================================================
Route::get(
    '/auth/google',
    [LoginController::class, 'redirectToGoogle']
);
Route::any(
    '/auth/google/callback',
    [LoginController::class, 'handleGoogleCallback']
);

// =====================================================
// CEP
// =====================================================
Route::get(
    '/consultar-cep/{cep}',
    [FornecedorController::class, 'consultarCep']
);

// =====================================================
// LOGOUT
// =====================================================
Route::middleware('auth:sanctum')->post(
    '/logout',
    function (Request $request) {
        $request->user()
            ->currentAccessToken()
            ->delete();
        return response()->json([
            'message' => 'Logout realizado com sucesso'
        ], 200);
    }
);

// =====================================================
// PUSHER
// =====================================================
Route::post(
    '/broadcasting/auth',
    function (Request $request) {
        return Broadcast::auth($request);
    }
)->middleware('auth:sanctum');
Route::post(
    '/teste-pusher',
    [EstoqueController::class, 'dispararEventoTeste']
)->middleware('auth:sanctum');
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Carteira Vacinal - {{ $paciente->nome }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; padding: 20px; }
        h2 { text-align: center; color: #2c3e50; margin-bottom: 30px; }
        .dados { margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 6px; }
        .dados p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 11px; }
        th { background: #2c3e50; color: white; }
    </style>
</head>
<body>

    <h2>📋 CARTEIRA VACINAL</h2>

    <div class="dados">
        <p><strong>Paciente:</strong> {{ $paciente->nome }}</p>
        @if ($paciente->data_nascimento)
            <p><strong>Data de Nascimento:</strong> {{ date('d/m/Y', strtotime($paciente->data_nascimento)) }}</p>
        @endif
        <p><strong>Total de vacinações:</strong> {{ $aplicacoes->count() }}</p>
    </div>

    <h4>Histórico de Vacinação</h4>

    @if ($aplicacoes->isEmpty())
        <p style="color: #666;">Nenhuma vacinação registrada.</p>
    @else
        <table>
            <thead>
                <tr>
                    <th>Vacina</th>
                    {{-- ❌ LOTE REMOVIDO --}}
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Profissional</th>
                    <th>Observações</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($aplicacoes as $app)
                    <tr>
                        <td>{{ $app->estoque?->vacina?->nome ?? 'Não informado' }}</td>
                        {{-- ❌ SEM LOTE --}}
                        <td>{{ $app->data_aplicacao ? date('d/m/Y', strtotime($app->data_aplicacao)) : '-' }}</td>
                        <td>{{ $app->hora_aplicacao ? substr($app->hora_aplicacao, 0, 5) : '-' }}</td>
                        <td>{{ $app->profissional?->nome ?? 'Não informado' }}</td>
                        <td>{{ $app->observacoes ?? '-' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

</body>
</html>
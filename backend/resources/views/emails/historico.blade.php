<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; }
        h1 { color: #4CAF50; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f4f4f4; }
    </style>
</head>
<body>
    <h1>Histórico Vacinal - {{ $paciente->nome }}</h1>
    <p>Data de nascimento: {{ \Carbon\Carbon::parse($paciente->data_nascimento)->format('d/m/Y') }}</p>

    <table>
        <thead>
            <tr>
                <th>Vacina</th>
                <th>Data</th>
                <th>Profissional</th>
            </tr>
        </thead>
        <tbody>
            @foreach($paciente->aplicacoes as $aplicacao)
                <tr>
                    <td>{{ $aplicacao->vacina->nome }}</td>
                    <td>{{ \Carbon\Carbon::parse($aplicacao->data)->format('d/m/Y') }}</td>
                    <td>{{ $aplicacao->profissional->nome }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>

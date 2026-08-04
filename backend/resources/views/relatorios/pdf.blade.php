<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">

    <title>Relatório de Aplicações</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
        }

        h1 {
            text-align: center;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #eeeeee;
        }
    </style>
</head>

<body>

    <h1>Relatório de Aplicações de Vacinas</h1>

    <table>
        <thead>
            <tr>
                <th>Paciente</th>
                <th>Vacina</th>
                <th>Data</th>
                <th>Profissional</th>
            </tr>
        </thead>

        <tbody>
            @foreach ($dados as $aplicacao)
                <tr>
                    <td>
                        {{ $aplicacao->paciente->nome ?? 'Não informado' }}
                    </td>

                    <td>
                        {{ $aplicacao->estoque->vacina->nome ?? 'Não informado' }}
                    </td>

                    <td>
                        {{ $aplicacao->data_aplicacao ?? 'Não informado' }}
                    </td>

                    <td>
                        {{ $aplicacao->profissional->nome ?? 'Não informado' }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .header {
            background: #4CAF50;
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
            color: #333;
            line-height: 1.6;
        }
        .content h2 {
            color: #4CAF50;
        }
        .footer {
            background: #f4f6f8;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            background: #4CAF50;
            color: #fff;
            padding: 12px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Clínica de Vacinação</h1>
        </div>
        <div class="content">
            <h2>Olá, {{ $paciente->nome }}!</h2>
            <p>Este é um lembrete da sua próxima dose da vacina <strong>{{ $vacina->nome }}</strong>.</p>
            <p>A aplicação está agendada para o dia <strong>{{ \Carbon\Carbon::parse($dataAgendada)->format('d/m/Y') }}</strong>.</p>
            <p>Por favor, compareça à clínica na data marcada para garantir sua proteção.</p>
            <a href="http://127.0.0.1:8080" class="button">Ver detalhes do agendamento</a>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Clínica de Vacinação. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>

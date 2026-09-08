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
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .cabecalho {
            background-color: #28a745;
            color: white;
            padding: 25px;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
        }
        .conteudo {
            padding: 30px;
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
        }
        .saudacao {
            color: #28a745;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 25px;
        }
        .alerta-caixa {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .botao {
            display: inline-block;
            background-color: #28a745;
            color: white !important;
            padding: 14px 28px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            margin-top: 20px;
        }
        .botao:hover {
            background-color: #218838;
        }
        .rodape {
            text-align: center;
            padding: 20px;
            font-size: 13px;
            color: #888888;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- FAIXA VERDE NO TOPO (IGUAL AO SEU!) -->
        <div class="cabecalho">
            Clínica de Vacinação
        </div>

        <div class="conteudo">
            <h2 class="saudacao">Olá, {{ $nomeAdmin }}!</h2>

            <p>Você recebeu um aviso importante do sistema de controle de estoque:</p>

            <div class="alerta-caixa">
                <strong>⚠️ Alerta do Sistema</strong><br>
                {{ $dados['mensagem'] }}
            </div>

            <p>Por favor, verifique as informações no estoque o quanto antes.</p>

            <a href="{{ url('/estoque') }}" class="botao">Ver Estoque</a>
        </div>

        <div class="rodape">
            Atenciosamente,<br>
            Sistema de Gestão de Vacinas
        </div>
    </div>
</body>
</html>
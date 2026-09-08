<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Vacinação</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            color: #333; 
            margin: 20px; 
        }

        .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #0d6efd; 
            padding-bottom: 10px; 
        }
        .header h2 { 
            margin: 0; 
            color: #0d6efd; 
            font-size: 18px; 
        }
        .header p { 
            margin: 5px 0 0; 
            color: #666; 
            font-size: 11px; 
        }
        
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
        }
        th { 
            background-color: #0d6efd; 
            color: white; 
            font-weight: bold; 
            font-size: 11px; 
        }
        tr:nth-child(even) { 
            background-color: #f9f9f9; 
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>Relatório de Aplicações de Vacinas</h2>
        <p>Gerado em: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Paciente</th>
                <th>Vacina</th>
                <th>Lote</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Profissional</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($dados as $item)
                <tr>
                    <td>{{ $item->paciente->nome ?? 'Não informado' }}</td>
                    <td>{{ $item->estoque->vacina->nome ?? 'Não informado' }}</td>
                    <td>{{ $item->estoque->lote ?? 'Não informado' }}</td>
                    
                    {{-- Usando as variaveis formatadas no Controller --}}
                    <td>{{ $item->data_formatada }}</td>
                    <td>{{ $item->hora_formatada }}</td>
                    
                    <td>{{ $item->profissional->nome ?? 'Não informado' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                        Nenhuma vacinação encontrada.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>
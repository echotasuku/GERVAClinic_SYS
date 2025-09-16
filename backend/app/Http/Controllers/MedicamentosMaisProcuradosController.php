<?php
namespace App\Http\Controllers;

use App\Models\Retirada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MedicamentosMaisProcuradosController extends Controller
{
    public function index()
    {
        $medicamentosMaisProcurados = Retirada::select('medicamento_id', DB::raw('count(*) as quantidade'))
            ->whereMonth('created_at', now()->month) // Filtrar pelo mês atual
            ->groupBy('medicamento_id')
            ->orderByDesc('quantidade')
            ->take(10) // Limitar aos 10 medicamentos mais procurados
            ->get();

        return response()->json($medicamentosMaisProcurados);
    }
}


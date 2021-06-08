<?php

namespace App\Http\Controllers;

use App\Services\SystemAuthorities;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PTReportController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_pt_report'])) {
            return response()->json(['Message' => 'Not allowed to view pt report: '], 500);
        }
        return view('reports/pt/index');
    }
}

<?php

namespace App\Http\Controllers;

use App\Services\SystemAuthorities;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LogbookReportController extends Controller
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
        if (!Gate::allows(SystemAuthorities::$authorities['view_log_book_report'])) {
            return response()->json(['Message' => 'Not allowed to view log book report: '], 500);
        }
        return view('reports/logbook/index');
    }
}

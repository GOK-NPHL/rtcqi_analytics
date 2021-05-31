<?php

namespace App\Http\Controllers;
use App\Services\ODKDataAggregator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SpiReportController extends Controller
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
        return view('reports/spi/index');
    }

    public function getData(Request $request )
    {   
        $odkObj = new ODKDataAggregator;
        Log::info($request->orgUnitIds);
        $orgTimeline = $request->orgTimeline;
        $orgUnitIds=$request->orgUnitIds;
        $result=$odkObj->getData($orgUnitIds,$orgTimeline);
        return $result;
    }
}

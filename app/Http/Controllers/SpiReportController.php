<?php

namespace App\Http\Controllers;

use App\Services\ODKDataAggregator;
use Exception;
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

    public function getData(Request $request)
    {
        try {
            $odkObj = new ODKDataAggregator;
            $orgTimeline = $request->orgTimeline;
            $orgUnitIds = $request->orgUnitIds;
            $siteType = $request->siteType;
            $result = $odkObj->getData($orgUnitIds, $orgTimeline, $siteType);
            return $result;
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Could not fetch data: ' . $ex->getMessage()], 500);
        }
    }
}

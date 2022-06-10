<?php

namespace App\Http\Controllers;

use App\Services\ODKDataAggregator;
use App\Services\SystemAuthorities;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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
        if (!Gate::allows(SystemAuthorities::$authorities['view_spi_report'])) {
            return view('reports/spi/index', ['error' => 'You are not authorized to view this page.']);
            // return response()->json(['Message' => 'Not allowed to view spi report: '], 500);
        }
        return view('reports/spi/index');
    }

    public function getData(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_spi_report'])) {
            return response()->json(['Message' => 'Not allowed to view spi report: '], 500);
        }
        try {
            $odkObj = new ODKDataAggregator;
            $orgTimeline = $request->orgTimeline;
            $orgUnitIds = $request->orgUnitIds;
            $siteType = $request->siteType;
            $startDate = $request->startDate;
            $endDate = $request->endDate;

            $result = $odkObj->getData($orgUnitIds, $orgTimeline, $siteType, $startDate, $endDate);
            return $result;
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Could not fetch data: ' . $ex->getMessage()], 500);
        }
    }
}

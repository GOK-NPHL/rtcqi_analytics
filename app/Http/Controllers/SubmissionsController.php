<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ODkHTSDataAggregator;
use App\Services\SystemAuthorities;
use Exception;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class SubmissionsController extends Controller
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
        if (!Gate::allows(SystemAuthorities::$authorities['view_submissions'])) {
            return response()->json(['Message' => 'Not allowed to view submissions: '], 500);
        }
        return view('reports/submissions/index');
    }

    public function getData(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_submissions'])) {
            return response()->json(['Message' => 'Not allowed to view submissions: '], 500);
        }
        try {
            $odkObj = new ODkHTSDataAggregator;
            $orgUnitIds = $request->orgUnitIds;
            $siteType = $request->siteType;
            $startDate = $request->startDate;
            $endDate = $request->endDate;

            $result = $odkObj->getData($orgUnitIds, $siteType, $startDate, $endDate);
            return $result;
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Could not fetch data: ' . $ex->getMessage()], 500);
        }
    }
}

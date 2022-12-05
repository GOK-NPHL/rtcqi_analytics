<?php

namespace App\Http\Controllers;

use App\Partner;
use App\PartnerOrgUnits;
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
            // <partners
            $partners = $request->partners;
            $aggregate_partners = $request->aggregate_partners ?? false;
            if ($partners != null && $partners != '') {
                // foreach partner, get the orgs and overwrite the orgUnitIds
                $partner_ous = [];
                foreach ($partners as $partner) {
                    $ptnr = Partner::find($partner);
                    if ($ptnr != null) {
                        $ptnr_ous = PartnerOrgUnits::where('partner_id', $partner)->pluck('org_unit_id')->toArray();
                        $partner_ous = array_merge($partner_ous, $ptnr_ous);
                    }
                }
                $orgUnitIds = $partner_ous;
            }
            // partners/>
            $siteType = $request->siteType;
            $startDate = $request->startDate;
            $endDate = $request->endDate;

            $result = $odkObj->getData(
                $orgUnitIds,
                $orgTimeline,
                $siteType,
                $startDate,
                $endDate,
                $partners
                // , $aggregate_partners
            );
            return $result;
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Could not fetch data: ' . $ex->getMessage()], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\OdkOrgunit;
use App\Partner;
use App\PartnerOrgUnits;
use App\Services\ODKDataAggregator;
use App\Services\SystemAuthorities;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

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
            // cache key format = 'method:path:uniqueid'
            $cache_unique_uid = md5($request->path() . json_encode($request->all()));
            $cacheId = strtolower($request->method()) . ':' . $request->path() .   ':' . $cache_unique_uid;
            // Log::info('Cache ID: ' . $cacheId);


            if (config('app.skip_cache')) {
            } else {
                if (Cache::has($cacheId)) {
                    Log::info('Cache hit for ' . $cacheId);
                    $data = Cache::get($cacheId);
                    return response()->json($data);
                } else {
                    Log::info('Cache miss for ' . $cacheId);
                }
            }
            $odkObj = new ODKDataAggregator;
            $orgTimeline = $request->orgTimeline;
            $orgUnitIds = $request->orgUnitIds;
            // <partners
            $partners = $request->partners;
            $aggregate_partners = $request->aggregate_partners ?? false;
            if ($partners != null && $partners != '') {
                // foreach partner, get the orgs and overwrite the orgUnitIds
                $partnerous = [];
                $partner_sites = [];
                foreach ($partners as $partner) {
                    $ptnr = Partner::find($partner);
                    if ($ptnr != null) {
                        $ptnr_ous = PartnerOrgUnits::where('partner_id', $partner)->pluck('org_unit_id')->toArray();
                        $partnerous = array_merge($partnerous, $ptnr_ous);
                    }
                }
                // $orgUnitIds = $partner_ous;
                foreach ($partnerous as $ouid) {
                    $ou = OdkOrgunit::where('org_unit_id', $ouid)->first();
                    // 77777777
                    if ($ou) {
                        // check ou level. If level is less than 4, loop through all children till you get level 4 children and add them to the partner_sites array
                        if ($ou->level < 4) {
                            $children = $ou->children()->get();
                            // $children = OdkOrgunit::where('parent_id', $ou->org_unit_id)->get();
                            foreach ($children as $child) {
                                if ($child->level == 4) {
                                    array_push($partner_sites, $child);
                                } else {
                                    $grand_children = $child->children()->get();
                                    foreach ($grand_children as $grand_child) {
                                        if ($grand_child->level == 4) {
                                            array_push($partner_sites, $grand_child);
                                        } else {
                                            $great_grand_children = $grand_child->children()->get();
                                            foreach ($great_grand_children as $great_grand_child) {
                                                if ($great_grand_child->level == 4) {
                                                    array_push($partner_sites, $great_grand_child);
                                                } else {
                                                    $great_great_grand_children = $great_grand_child->children()->get();
                                                    foreach ($great_great_grand_children as $great_great_grand_child) {
                                                        if ($great_great_grand_child->level == 4) {
                                                            array_push($partner_sites, $great_great_grand_child);
                                                        } else {
                                                            $great_great_great_grand_children = $great_great_grand_child->children()->get();
                                                            foreach ($great_great_great_grand_children as $great_great_great_grand_child) {
                                                                if ($great_great_great_grand_child->level == 4) {
                                                                    array_push($partner_sites, $great_great_great_grand_child);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            array_push($partner_sites, $ou);
                        }
                    }
                    // 77777777
                }

                // Log::info('partner_sites: '.json_encode($partner_sites));
                // Log::info('partnerous: '.json_encode($partnerous));

                // reduce partner_sites to ids only
                $partner_sites_ids = array();
                foreach ($partner_sites as $partner_site) {
                    array_push($partner_sites_ids, $partner_site->org_unit_id);
                }
                $orgUnitIds = $partner_sites_ids;
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
            // cache the result; expires in 4 hours
            if ($result && !config('app.skip_cache')) {
                $cached = Cache::put($cacheId, $result, now()->addHours(4));
                if (!$cached) {
                    Log::error('<SpiReportController->getData(): Could not cache data');
                }
            }
            return $result;
        } catch (Exception $ex) {

            Log::error('<SpiReportController->getData(): Could not fetch data: ' . $ex->getMessage());
            Log::error($ex);
            Log::error('</SpiReportController->getData()');
            return response()->json(['Message' => 'Could not fetch data: ' . $ex->getMessage()], 500);
        }
    }
}

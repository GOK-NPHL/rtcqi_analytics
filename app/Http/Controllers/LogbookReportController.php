<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ODkHTSDataAggregator;
use App\Services\SystemAuthorities;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

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
            return view('reports/logbook/index', ['error' => 'You are not authorized to view this page.']);
            // return response()->json(['Message' => 'Not allowed to view log book report: '], 500);
        }
        return view('reports/logbook/index');
    }

    public function getData(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_log_book_report'])) {
            return response()->json(['Message' => 'Not allowed to view log book report: '], 500);
        }
        try {
            // cache key format = 'method:path:uniqueid'
            $cache_unique_uid = md5($request->path() . json_encode($request->all()));
            $cacheId = strtolower($request->method()) . ':' . $request->path() .   ':' . $cache_unique_uid;
            // Log::info('Cache ID: ' . $cacheId);
            if (config('app.skip_cache')) {
            } else {
                if (Cache::has($cacheId)) {
                    // Log::info('Cache hit for ' . $cacheId);
                    $data = Cache::get($cacheId);
                    return response()->json($data);
                } else {
                    Log::info('Cache miss for ' . $cacheId);
                }
            }

            $odkObj = new ODkHTSDataAggregator;
            $orgUnitIds = $request->orgUnitIds;
            $siteType = $request->siteType;
            $startDate = $request->startDate;
            $endDate = $request->endDate;

            $result = $odkObj->getData($orgUnitIds, $siteType, $startDate, $endDate);
            // cache the result; expires in 4 hours
            if ($result && !config('app.skip_cache')) {
                $cached = Cache::put($cacheId, $result, now()->addHours(4));
                if (!$cached) {
                    Log::error('<LogbookReportController->getData(): Could not cache data');
                }
            }
            return $result;
        } catch (Exception $ex) {
            Log::error('<LogbookReportController->getData(): Could not fetch data: ' . $ex->getMessage());
            Log::error($ex);
            Log::error('</LogbookReportController->getData()');
            return response()->json(['Message' => 'Could not fetch data: ' . $ex->getMessage()], 500);
        }
    }
}

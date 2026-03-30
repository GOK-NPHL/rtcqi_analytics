<?php

namespace App\Http\Controllers;

use App\Services\ODKDataAggregator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DevController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function timelineCheck()
    {
        return view('dev/timeline_check');
    }

    public function getFacilityTimeline(Request $request)
    {
        try {
            $mfl = trim($request->input('mfl', ''));
            if (empty($mfl)) {
                return response()->json(['error' => 'MFL code is required'], 422);
            }

            $agg = new ODKDataAggregator();
            $rows = $agg->getFacilityTimeline($mfl);

            return response()->json(['data' => $rows, 'count' => count($rows)]);
        } catch (\Exception $ex) {
            Log::error($ex);
            return response()->json(['error' => $ex->getMessage()], 500);
        }
    }
}

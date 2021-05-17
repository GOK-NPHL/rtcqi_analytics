<?php

namespace App\Http\Controllers\Service;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\OdkOrgunit;
use Exception;
use Illuminate\Support\Facades\Auth;



class OrgunitsController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('interface/orgunits/index');
    }

    public function getOrgunits()
    {
        $levels = OdkOrgunit::select("level")->orderBy('level', 'asc')->groupByRaw('level')->get();
        $levelsArr = array();
        foreach ($levels as $level) {
            $levelsArr[] = $level->level;
        }

        $orgUnitsPayload = [
            'metadata' =>
            ['levels' => $levelsArr],
            'payload' => [OdkOrgunit::all()]
        ];

        return $orgUnitsPayload;
    }

    public function saveOrgunits(Request $request)
    {
        try {
            $organisationUnit = $request->orgunits;
            for ($x = 0; $x < count($organisationUnit); $x++) {
                $orgUnit = new OdkOrgunit([
                    'org_unit_id' => $organisationUnit[$x]['id'],
                    'odk_unit_name' => $organisationUnit[$x]['name'],
                    'level' => $organisationUnit[$x]['level'],
                    'parent_id' => $organisationUnit[$x]['parentId'],

                ]);
                $orgUnit->save();
            }
            return response()->json(['Message' => 'Created successfully'], 200);
        } catch (Exception $ex) {
            Log::error($ex);
            return response()->json(['Message' => 'Could not save organisation units: ' . $ex->getMessage()], 500);
        }
    }

    public function updateOrg(Request $request)
    {
        try {
            $org = OdkOrgunit::find($request->org['id']);
            $org->odk_unit_name = $request->org['odk_unit_name'];
            $org->save();
            return response()->json(['Message' => 'Updated successfully'], 200);
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Could not save role: ' . $ex->getMessage()], 500);
        }
    }

    public function deleteOrg(Request $request)
    {
        try {
            log::info("delete org 1");
            $dependentOrgs = OdkOrgunit::where('parent_id', $request->org['org_unit_id'])
                ->get();
            log::info("delete org 2");
            if (count($dependentOrgs) != 0) {
                log::info("delete org 4");
                return response()->json(['Message' => 'Can\'t delete orgunit as it contains children orgunits'], 500);
            } else {
                log::info("delete org 4");
                $org = OdkOrgunit::find($request->org['id']);
                $org->delete();
            }
            log::info("delete org 5");
            return response()->json(['Message' => 'Deleted successfully'], 200);
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Delete failed.  Error code' . $ex->getMessage()], 500);
        }
    }
}

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
            return ['Error' => '500', 'Message' => 'Could not save organisation units: ' . $ex->getMessage()];
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
            return ['Error' => '500', 'Message' => 'Could not save role: ' . $ex->getMessage()];
        }
    }
}

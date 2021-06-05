<?php

namespace App\Http\Controllers\Service;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\OdkOrgunit;
use App\OrgunitLevelMap;
use App\Services\SystemAuthorities;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

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
        if (Gate::allows(SystemAuthorities::$authorities['view_orgunit'])) {
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
        } else {
            return response()->json(['Message' => 'Not allowed to view organisation units: '], 500);
        }
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

            $orgunitMetadata = $request->orgunit_metadata;
            Log::info($orgunitMetadata);
            for ($x = 0; $x < count($orgunitMetadata); $x++) {
                $orgunitMetadataTable = new OrgunitLevelMap([
                    'sheet' => $orgunitMetadata[$x]['sheet'],
                    'column' => $orgunitMetadata[$x]['column'],
                    'level' => $orgunitMetadata[$x]['level'],
                ]);
                $orgunitMetadataTable->save();
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
            $org = OdkOrgunit::where('org_unit_id', $request->id)->first();
            $org->odk_unit_name = $request->name;
            $org->save();
            return response()->json(['Message' => 'Updated successfully'], 200);
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Could not save org: ' . $ex->getMessage()], 500);
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

    public function addSubOrg(Request $request)
    {
        try {
            $childOrg = $request->child_org;
            $parentOrg = $request->parent_org;
            Log::info($childOrg);
            $childOrgs = OdkOrgunit::where('parent_id', $parentOrg['id'])
                ->where('odk_unit_name', $childOrg)
                ->get();
            if (count($childOrgs) != 0) {
                return response()->json(['Message' => 'Orgunit already exists'], 500);
            } else {
                $orgUnit = new OdkOrgunit([
                    'org_unit_id' =>  (string) Str::uuid(),
                    'odk_unit_name' => $childOrg,
                    'level' => $parentOrg['level'] + 1,
                    'parent_id' => $parentOrg['id'],
                ]);
                $orgUnit->save();
                return response()->json(['Message' => 'Created successfully'], 200);
            }
        } catch (Exception $ex) {
            Log::error($ex);
            return response()->json(['Message' => 'Could not save organisation unit: ' . $ex->getMessage()], 500);
        }
    }
}

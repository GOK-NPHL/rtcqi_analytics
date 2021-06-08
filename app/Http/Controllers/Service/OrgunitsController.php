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

    private function runOrgUnitsLevelQuery($orgUnitId, $level)
    {
        if ($level == 5) {
            //site
            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id"
            )->where('odkorgunit.org_unit_id', $orgUnitId)
                ->get();

            return $orgUnitObject;
        } else if ($level == 4) {
            //facility
            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id",
                "org5.level",
                "org5.odk_unit_name",
                "org5.parent_id",
                "org5.org_unit_id"
            )->join('odkorgunit as org5', 'org5.parent_id', '=', 'odkorgunit.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->get();

            return $orgUnitObject;
        } else if ($level == 3) {
            //sub county
            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id",
                "org4.level",
                "org4.odk_unit_name",
                "org4.parent_id",
                "org4.org_unit_id",
                "org5.level",
                "org5.odk_unit_name",
                "org5.parent_id",
                "org5.org_unit_id"
            )->join('odkorgunit as org4', 'org4.parent_id', '=', ' odkorgunit.org_unit_id')
                ->join('odkorgunit as org5', 'org5.parent_id', '=', 'org4.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->get();
            return $orgUnitObject;
        } else if ($level == 2) {
            //county
            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id",
                "org4.level",
                "org4.odk_unit_name",
                "org4.parent_id",
                "org4.org_unit_id",
                "org5.level",
                "org5.odk_unit_name",
                "org5.parent_id",
                "org5.org_unit_id",
                "org3.level",
                "org3.odk_unit_name",
                "org3.parent_id",
                "org3.org_unit_id",
            )->join('odkorgunit as org3', 'org3.parent_id', '=', 'odkorgunit.org_unit_id')
                ->join('odkorgunit as org4', 'org4.parent_id', '=', ' org3.org_unit_id')
                ->join('odkorgunit as org5', 'org5.parent_id', '=', 'org4.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->get();

            return $orgUnitObject;
        } else if ($level == 1) {
            //national
            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id"
            )->get();

            return $orgUnitObject;
        }
    }

    private function getOrgunitsByUser()
    {
        // get all org units & their levels registered.
        // for each orgunit registered, get its childeren upto lowest level.
        $combinedRecords = [];
        //$combinedRecords = array_merge($combinedRecords, iterator_to_array($perCountyRecords, true));
        $user = Auth::user();

        $registeredOrgs = OdkOrgunit::select(
            "odkorgunit.level",
            "odkorgunit.org_unit_id"
        )->join('odkorgunit_user', 'odkorgunit_user.odk_orgunit_id', '=', 'odkorgunit.org_unit_id')
            ->join('users', 'users.id', '=', 'odkorgunit_user.user_id')
            ->where('users.id', $user->id)
            ->get();
        foreach ($registeredOrgs as $registeredOrg) {

            $orgUnitResultSet = $this->runOrgUnitsLevelQuery($registeredOrg->org_unit_id, $registeredOrg->level);
            $combinedRecords = array_merge($combinedRecords, iterator_to_array($orgUnitResultSet, true));
        }
        return  $combinedRecords;
    }


    public function getOrgunits()
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_orgunit'])) {
            return response()->json(['Message' => 'Not allowed to view organisation units: '], 500);
        }

        return $this->getOrgunitsByUser();

        // $levels = OdkOrgunit::select("level")->orderBy('level', 'asc')->groupByRaw('level')->get();
        // $levelsArr = array();
        // foreach ($levels as $level) {
        //     $levelsArr[] = $level->level;
        // }
        // $orgUnitsPayload = [
        //     'metadata' =>
        //     ['levels' => $levelsArr],
        //     'payload' => [OdkOrgunit::all()]
        // ];
        // return $orgUnitsPayload;
    }

    public function saveOrgunits(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['add_orgunit'])) {
            return response()->json(['Message' => 'Not allowed to add organisation units: '], 500);
        }
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
        if (!Gate::allows(SystemAuthorities::$authorities['edit_orgunit'])) {
            return response()->json(['Message' => 'Not allowed to update organisation units: '], 500);
        }
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
        if (!Gate::allows(SystemAuthorities::$authorities['delete_orgunit'])) {
            return response()->json(['Message' => 'Not allowed to delete organisation units: '], 500);
        }
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
        if (!Gate::allows(SystemAuthorities::$authorities['add_orgunit'])) {
            return response()->json(['Message' => 'Not allowed to add organisation units: '], 500);
        }
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

<?php

namespace App\Http\Controllers\Service;

use App\FormSubmissions;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Service\Utils as ServiceUtils;
use Illuminate\Http\Request;
use App\OdkOrgunit;
use App\OrgunitLevelMap;
use App\Services\ODKUtils;
use App\Services\SystemAuthorities;
use App\User;
use Exception;
use Hamcrest\Util;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

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
        if (!Gate::allows(SystemAuthorities::$authorities['view_orgunit'])) {
            return response()->json(['Message' => 'Not allowed to view organisation units: '], 500);
        }
        try {
            $utils = new Utils();
            $orgUnitsPayload = [
                'metadata' =>
                ['levels' => [1, 2, 3, 4, 5]],
                'payload' => [$utils->getOrgunitsByUser()]
            ];
            return $orgUnitsPayload;
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Error getting org units: ' . $ex->getMessage()], 500);
        }
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

    public function updateUploadOrgunits(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['add_orgunit'])) {
            return response()->json(['Message' => 'Not allowed to add organisation units: '], 500);
        }
        try {
            $kenya = OdkOrgunit::where("org_unit_id", "0")->first();
            $organisationUnit = $request->orgunits;
            for ($x = 0; $x < count($organisationUnit); $x++) {
                if ($organisationUnit[$x]['id'] != '0') {

                    OdkOrgunit::create([
                        'org_unit_id' => $organisationUnit[$x]['id'],
                        'odk_unit_name' => $organisationUnit[$x]['name'],
                        'level' => $organisationUnit[$x]['level'],
                        'parent_id' => $organisationUnit[$x]['parentId'],

                    ]);

                    if ($organisationUnit[$x]['name'] == 'Kamukunji') Log::info("Saved Kamukunji");
                }
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

            $orgUnitToDelete = OdkOrgunit::where('org_unit_id', $request->org['org_unit_id'])->first();
            $utils = new ServiceUtils();
            $childrenOrgUnits = $utils->getAssociatedOrganizationUnits($orgUnitToDelete->org_unit_id, $orgUnitToDelete->level);
            $orgsToDeleteId = [];
            foreach ($childrenOrgUnits as $childOrgUnit) {
                $orgsToDeleteId[] = $childOrgUnit->org_unit_id;
            }
            OdkOrgunit::whereIn('org_unit_id', $orgsToDeleteId)->delete();
            FormSubmissions::where('org_id', $request->org['org_unit_id'])->delete();
            $user = Auth::user();
            if ($orgUnitToDelete->org_unit_id == '0') {
                DB::insert('insert into odkorgunit_user (odk_orgunit_id, user_id) values (0,' . $user->id . ')');
            }

            return response()->json(['Message' => 'Deleted successfully'], 200);
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Delete failed.  Error code' . $ex->getMessage()], 500);
        }
    }

    public function deleteAllOrgs(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['upload_new_orgunit_structure'])) {
            return response()->json(['Message' => 'Not allowed to add new organisation units: '], 500);
        }
        try {
            $user = Auth::user();
            OdkOrgunit::query()->truncate();
            DB::statement('TRUNCATE odkorgunit_user');
            FormSubmissions::query()->truncate();
            DB::insert('insert into odkorgunit_user (odk_orgunit_id, user_id) values (0,' . $user->id . ')'); //initialize current user access to orgs
            return response()->json(['Message' => 'Delete successfully'], 200);
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Delete all orgunits failed.  Error code' . $ex->getMessage()], 500);
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

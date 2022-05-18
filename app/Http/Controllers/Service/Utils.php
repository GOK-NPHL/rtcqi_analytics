<?php

namespace App\Http\Controllers\Service;

use App\FormSubmissions;
use App\OdkOrgunit;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class Utils
{
    public function getAssociatedOrganizationUnits($orgUnitId, $level)
    {
        if ($level == 5) {
            //site
            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id",
                "odkorgunit.id",
                "odkorgunit.updated_at",
            )->where('odkorgunit.org_unit_id', $orgUnitId)
            ->orderBy('level', 'ASC')
            ->orderBy('odk_unit_name', 'ASC')
                ->get();

            return $orgUnitObject;
        } else if ($level == 4) {
            //facility
            $org5 = OdkOrgunit::select(
                "org5.level",
                "org5.odk_unit_name",
                "org5.parent_id",
                "org5.org_unit_id",
                "org5.id",
                "org5.updated_at"
            )->join('odkorgunit as org5', 'org5.parent_id', '=', 'odkorgunit.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId);

            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id",
                "odkorgunit.id",
                "odkorgunit.updated_at",
            )->where('odkorgunit.org_unit_id', $orgUnitId)
                ->union($org5)
                ->orderBy('level', 'ASC')
                ->orderBy('odk_unit_name', 'ASC')
                ->get();

            return $orgUnitObject;
        } else if ($level == 3) {
            //sub county

            $org4 = OdkOrgunit::select(
                "org4.level",
                "org4.odk_unit_name",
                "org4.parent_id",
                "org4.org_unit_id",
                "org4.id",
                "org4.updated_at",
            )->join('odkorgunit as org4', 'org4.parent_id', '=', 'odkorgunit.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId);

            $org5 = OdkOrgunit::select(
                "org5.level",
                "org5.odk_unit_name",
                "org5.parent_id",
                "org5.org_unit_id",
                "org5.id",
                "org5.updated_at"
            )->join('odkorgunit as org4', 'org4.parent_id', '=', 'odkorgunit.org_unit_id')
                ->join('odkorgunit as org5', 'org5.parent_id', '=', 'org4.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId);

            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id",
                "odkorgunit.id",
                "odkorgunit.updated_at",
            )->where('odkorgunit.org_unit_id', $orgUnitId)
                ->union($org4)
                ->union($org5)
                ->orderBy('level', 'ASC')
                ->orderBy('odk_unit_name', 'ASC')
                ->get();

            return $orgUnitObject;
        } else if ($level == 2) {
            //county
            $org4 = OdkOrgunit::select(
                "org4.level",
                "org4.odk_unit_name",
                "org4.parent_id",
                "org4.org_unit_id",
                "org4.id",
                "org4.updated_at",
            )->join('odkorgunit as org3', 'org3.parent_id', '=', 'odkorgunit.org_unit_id')
                ->join('odkorgunit as org4', 'org4.parent_id', '=', 'org3.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId);

            $org5 = OdkOrgunit::select(
                "org5.level",
                "org5.odk_unit_name",
                "org5.parent_id",
                "org5.org_unit_id",
                "org5.id",
                "org5.updated_at"
            )->join('odkorgunit as org3', 'org3.parent_id', '=', 'odkorgunit.org_unit_id')
                ->join('odkorgunit as org4', 'org4.parent_id', '=', 'org3.org_unit_id')
                ->join('odkorgunit as org5', 'org5.parent_id', '=', 'org4.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId);

            $org3 = OdkOrgunit::select(
                "org3.level",
                "org3.odk_unit_name",
                "org3.parent_id",
                "org3.org_unit_id",
                "org3.id",
                "org3.updated_at"
            )->join('odkorgunit as org3', 'org3.parent_id', '=', 'odkorgunit.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId);

            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id",
                "odkorgunit.id",
                "odkorgunit.updated_at",
            )->where('odkorgunit.org_unit_id', $orgUnitId)
                ->union($org3)
                ->union($org4)
                ->union($org5)
                ->orderBy('level', 'ASC')
                ->orderBy('odk_unit_name', 'ASC')
                ->get();

            return $orgUnitObject;
        } else if ($level == 1) {
            //national
            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.level",
                "odkorgunit.odk_unit_name",
                "odkorgunit.parent_id",
                "odkorgunit.org_unit_id",
                "odkorgunit.id",
                "odkorgunit.updated_at"
            )
                ->orderBy('level', 'ASC')
                ->orderBy('odk_unit_name', 'ASC')
                ->get();

            return $orgUnitObject;
        }
    }


    public function getOrgunitsByUser($user_id = null)
    {
        // get all org units & their levels registered.
        // for each orgunit registered, get its childeren upto lowest level.
        $combinedRecords = [];
        //$combinedRecords = array_merge($combinedRecords, iterator_to_array($perCountyRecords, true));
        
        if( $user_id != null ) {
            $usrid = $user_id;
        }else{
            $user = Auth::user();
            $usrid = $user->id;
        }

        $registeredOrgs = OdkOrgunit::select(
            "odkorgunit.level",
            "odkorgunit.org_unit_id"
        )->join('odkorgunit_user', 'odkorgunit_user.odk_orgunit_id', '=', 'odkorgunit.org_unit_id')
            ->join('users', 'users.id', '=', 'odkorgunit_user.user_id')
            ->where('users.id', $usrid)
            ->get();

        if (count($registeredOrgs) == 0) {
            throw new Exception("User has no org unit attached:".$usrid);
        }
        foreach ($registeredOrgs as $registeredOrg) {
            $utils = new Utils();
            $orgUnitResultSet = $this->getAssociatedOrganizationUnits($registeredOrg->org_unit_id, $registeredOrg->level);
            $combinedRecords = array_merge($combinedRecords, iterator_to_array($orgUnitResultSet, true));
        }
        return  $combinedRecords;
    }
}

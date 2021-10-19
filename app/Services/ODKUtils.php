<?php

namespace App\Services;

use App\FormSubmissions;
use App\OdkOrgunit;
use Exception;
use Illuminate\Support\Facades\Log;

class ODKUtils
{
    public function getOrgsByLevel($orgUnitId)
    {
        $levelObj = OdkOrgunit::select("level")->where('org_unit_id', $orgUnitId)->first();

        $orgUnitObject = null;
        $level = $levelObj->level;

        if ($level == 1) {

            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.odk_unit_name as country"
            )->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            $orgUnitSruc =  array();
            //mimic how odk replaces org unit name for analyses
            $stringReplace =  str_replace(' ( ', '_', trim(strtolower($orgUnitObject->country)));
            $stringReplace =  str_replace(' ) ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' (', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' )', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('(', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(')', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('-', '_', trim(strtolower($stringReplace)));
            $orgUnitSruc[] = $stringReplace;
            return [$orgUnitSruc, $level];
        } else if ($level == 2) {
            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.odk_unit_name as county",
                "org1.odk_unit_name as country"
            )->join('odkorgunit as org1', 'odkorgunit.parent_id', '=', 'org1.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            $orgUnitSruc =  array();

            //mimic how odk replaces org unit name for analyses
            $stringReplace =  str_replace(' ( ', '_', trim(strtolower($orgUnitObject->country)));
            $stringReplace =  str_replace(' ) ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' (', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' )', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('(', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(')', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('-', '_', trim(strtolower($stringReplace)));
            $orgUnitSruc[] = $stringReplace;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceCounty =  str_replace(' ( ', '_', trim(strtolower($orgUnitObject->county)));
            $stringReplaceCounty =  str_replace(' ) ', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' (', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' )', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace('(', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(')', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' ', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace('-', '_', trim(strtolower($stringReplaceCounty)));
            $orgUnitSruc[] = $stringReplaceCounty;

            return [$orgUnitSruc, $level];
        } else if ($level == 3) {

            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.odk_unit_name as subcounty",
                "org2.odk_unit_name as county",
                "org1.odk_unit_name as country"
            )->join('odkorgunit as org2', 'odkorgunit.parent_id', '=', 'org2.org_unit_id')
                ->join('odkorgunit as org1', 'org2.parent_id', '=', 'org1.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            $orgUnitSruc =  array();

            //mimic how odk replaces org unit name for analyses
            $stringReplace =  str_replace(' ) ', '_', trim(strtolower($orgUnitObject->country)));
            $stringReplace =  str_replace(' ( ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' (', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' )', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('(', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(')', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('-', '_', trim(strtolower($stringReplace)));
            $orgUnitSruc[] = $stringReplace;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceCounty =  str_replace(' ( ', '_', trim(strtolower($orgUnitObject->county)));
            $stringReplaceCounty =  str_replace(' ) ', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' (', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' )', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace('(', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(')', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' ', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace('-', '_', trim(strtolower($stringReplaceCounty)));
            $orgUnitSruc[] = $stringReplaceCounty;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceSubCounty =  str_replace(' ( ', '_', trim(strtolower($orgUnitObject->subcounty)));
            $stringReplaceSubCounty =  str_replace(' ) ', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(' (', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(' )', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace('(', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(')', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(' ', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace('-', '_', trim(strtolower($stringReplaceSubCounty)));
            $orgUnitSruc[] = $stringReplaceSubCounty;


            return [$orgUnitSruc, $level];
        } else if ($level == 4) {

            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.odk_unit_name as facility",
                "org3.odk_unit_name as subcounty",
                "org2.odk_unit_name as county",
                "org1.odk_unit_name as country"
            )->join('odkorgunit as org3', 'odkorgunit.parent_id', '=', 'org3.org_unit_id')
                ->join('odkorgunit as org2', 'org3.parent_id', '=', 'org2.org_unit_id')
                ->join('odkorgunit as org1', 'org2.parent_id', '=', 'org1.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            $orgUnitSruc =  array();

            //mimic how odk replaces org unit name for analyses
            $stringReplace =  str_replace(' ( ', '_', trim(strtolower($orgUnitObject->country)));
            $stringReplace =  str_replace(' ) ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' (', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' )', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('(', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(')', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('-', '_', trim(strtolower($stringReplace)));
            $orgUnitSruc[] = $stringReplace;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceCounty =  str_replace(' ) ', '_', trim(strtolower($orgUnitObject->county)));
            $stringReplaceCounty =  str_replace(' ( ', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' (', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' )', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace('(', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(')', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' ', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace('-', '_', trim(strtolower($stringReplaceCounty)));
            $orgUnitSruc[] = $stringReplaceCounty;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceSubCounty =  str_replace(' ) ', '_', trim(strtolower($orgUnitObject->subcounty)));
            $stringReplaceSubCounty =  str_replace(' ( ', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(' (', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(' )', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace('(', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(')', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(' ', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace('-', '_', trim(strtolower($stringReplaceSubCounty)));
            $orgUnitSruc[] = $stringReplaceSubCounty;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceFacility =  str_replace(' ) ', '_', trim(strtolower($orgUnitObject->facility)));
            $stringReplaceFacility =  str_replace(' ( ', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace(' (', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace(' )', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace('(', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace(')', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace(' ', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace('-', '_', trim(strtolower($stringReplaceFacility)));
            $orgUnitSruc[] = $stringReplaceFacility;


            return [$orgUnitSruc, $level];
        } else if ($level == 5) {

            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.odk_unit_name as site",
                "org4.odk_unit_name as facility",
                "org3.odk_unit_name as subcounty",
                "org2.odk_unit_name as county",
                "org1.odk_unit_name as country"
            )->join('odkorgunit as org4', 'odkorgunit.parent_id', '=', 'org4.org_unit_id')
                ->join('odkorgunit as org3', 'org4.parent_id', '=', 'org3.org_unit_id')
                ->join('odkorgunit as org2', 'org3.parent_id', '=', 'org2.org_unit_id')
                ->join('odkorgunit as org1', 'org2.parent_id', '=', 'org1.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            $orgUnitSruc =  array();


            //mimic how odk replaces org unit name for analyses
            $stringReplace =  str_replace(' ( ', '_', trim(strtolower($orgUnitObject->country)));
            $stringReplace =  str_replace(' ) ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' (', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' )', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('(', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(')', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace(' ', '_', trim(strtolower($stringReplace)));
            $stringReplace =  str_replace('-', '_', trim(strtolower($stringReplace)));
            $orgUnitSruc[] = $stringReplace;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceCounty =  str_replace(' ) ', '_', trim(strtolower($orgUnitObject->county)));
            $stringReplaceCounty =  str_replace(' ( ', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' (', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' )', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace('(', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(')', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace(' ', '_', trim(strtolower($stringReplaceCounty)));
            $stringReplaceCounty =  str_replace('-', '_', trim(strtolower($stringReplaceCounty)));
            $orgUnitSruc[] = $stringReplaceCounty;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceSubCounty =  str_replace(' ) ', '_', trim(strtolower($orgUnitObject->subcounty)));
            $stringReplaceSubCounty =  str_replace(' ( ', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(' (', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(' )', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace('(', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(')', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace(' ', '_', trim(strtolower($stringReplaceSubCounty)));
            $stringReplaceSubCounty =  str_replace('-', '_', trim(strtolower($stringReplaceSubCounty)));
            $orgUnitSruc[] = $stringReplaceSubCounty;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceFacility =  str_replace(' ) ', '_', trim(strtolower($orgUnitObject->facility)));
            $stringReplaceFacility =  str_replace(' ( ', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace(' (', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace(' )', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace('(', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace(')', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace(' ', '_', trim(strtolower($stringReplaceFacility)));
            $stringReplaceFacility =  str_replace('-', '_', trim(strtolower($stringReplaceFacility)));
            $orgUnitSruc[] = $stringReplaceFacility;


            //mimic how odk replaces org unit name for analyses
            $stringReplaceSite =  str_replace(' ) ', '_', trim(strtolower($orgUnitObject->site)));
            $stringReplaceSite =  str_replace(' ( ', '_', trim(strtolower($stringReplaceSite)));
            $stringReplaceSite =  str_replace(' (', '_', trim(strtolower($stringReplaceSite)));
            $stringReplaceSite =  str_replace(' )', '_', trim(strtolower($stringReplaceSite)));
            $stringReplaceSite =  str_replace('(', '_', trim(strtolower($stringReplaceSite)));
            $stringReplaceSite =  str_replace(')', '_', trim(strtolower($stringReplaceSite)));
            $stringReplaceSite =  str_replace(' ', '_', trim(strtolower($stringReplaceSite)));
            $stringReplaceSite =  str_replace('-', '_', trim(strtolower($stringReplaceSite)));
            $orgUnitSruc[] = $stringReplaceSite;

            return [$orgUnitSruc, $level];
        }
    }

    public function getOrgUnitHierachyNames($orgToProcess, $level)
    {
        $orgUnit = array();
        $orgUnitName = '';
        try {
            $orgUnit['mysites_county'] = $orgToProcess[1];
            $orgUnitName = $orgToProcess[1];
        } catch (Exception $ex) {
            $orgUnit['mysites_county'] = null;
        }

        try {
            $orgUnit['mysites_subcounty'] = $orgToProcess[2];
            $orgUnitName = $orgToProcess[2];
        } catch (Exception $ex) {
            $orgUnit['mysites_subcounty'] = null;
        }

        try {
            $orgUnit['mysites_facility'] = $orgToProcess[3];
            $orgUnitName = $orgToProcess[3];
        } catch (Exception $ex) {
            $orgUnit['mysites_facility'] = null;
        }

        try {
            $orgUnit['mysites'] = $orgToProcess[4];
            $orgUnitName = $orgToProcess[3] . "/" . $orgUnitName = $orgToProcess[4];;
        } catch (Exception $ex) {
            $orgUnit['mysites'] = null;
        }
        if ($level == 1) {
            $orgUnitName = 'Kenya';
        }
        return [$orgUnit,  $orgUnitName];
    }


    public function getFormFormdProjectIds($orgUnit, $formType)
    {

        $levelObj = OdkOrgunit::select("level")->where('org_unit_id', $orgUnit['org_unit_id'])->first();
        $level = $levelObj->level;

        if ($level == 2) { // Form Submissions table maps orgid at county level to form id
            $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
                ->where('org_id', $orgUnit['org_unit_id'])
                ->where('form_id', 'like', $formType) // for spi data
                ->first();
            if (!$submissionOrgUnitmap) {
                Log::error("===>>>> No form submissions data found in Form Submissions table");
            }
            $projectId = $submissionOrgUnitmap->project_id;
            $formId = $submissionOrgUnitmap->form_id;
        } else {
            $countyId = $this->getCountyIdOfOrg($orgUnit['org_unit_id'], $levelObj);
            Log::info("county id for file search =====>" . $countyId);
            $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
                ->where('org_id', $countyId)
                ->where('form_id', 'like', $formType) // for spi data
                ->first();
            $projectId = $submissionOrgUnitmap->project_id;
            $formId = $submissionOrgUnitmap->form_id;
        }

        return [$projectId, $formId];
    }

    public function getCountyIdOfOrg($orgUnitId, $levelObj)
    {

        $orgUnitObject = null;
        $level = $levelObj->level;

        if ($level == 1) {

            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.org_unit_id as org_unit_id"
            )->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            return $orgUnitObject->org_unit_id;
        } else if ($level == 2) {
            $orgUnitObject = OdkOrgunit::select(
                "org1.org_unit_id as org_unit_id"
            )->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            return $orgUnitObject->org_unit_id;
        } else if ($level == 3) {

            $orgUnitObject = OdkOrgunit::select(
                "org2.org_unit_id as org_unit_id",
            )->join('odkorgunit as org2', 'odkorgunit.parent_id', '=', 'org2.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            return $orgUnitObject->org_unit_id;
        } else if ($level == 4) {

            $orgUnitObject = OdkOrgunit::select(
                "org2.org_unit_id as org_unit_id",
            )->join('odkorgunit as org3', 'odkorgunit.parent_id', '=', 'org3.org_unit_id')
                ->join('odkorgunit as org2', 'org3.parent_id', '=', 'org2.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            return $orgUnitObject->org_unit_id;
        } else if ($level == 5) {

            $orgUnitObject = OdkOrgunit::select(
                "org2.org_unit_id as org_unit_id",
            )->join('odkorgunit as org4', 'odkorgunit.parent_id', '=', 'org4.org_unit_id')
                ->join('odkorgunit as org3', 'org4.parent_id', '=', 'org3.org_unit_id')
                ->join('odkorgunit as org2', 'org3.parent_id', '=', 'org2.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            return $orgUnitObject->org_unit_id;
        }
    }
}

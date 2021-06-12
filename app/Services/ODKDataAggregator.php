<?php

namespace App\Services;

use Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

use App\FormSubmissions;
use App\OdkOrgunit;
use App\OdkProject;
use Exception;
use Illuminate\Support\Arr;
use League\Csv\Reader;
use League\Csv\Statement;
use PhpParser\Node\Stmt\Continue_;

class ODKDataAggregator
{
    private $reportSections = array();
    private $timeLines = ['baseline', 'follow1', 'follow2', 'follow3'];
    private $userOrgTimelineParams = array();
    private $siteType = null;
    private $startDate = null;
    private $endDate = null;
    public function __construct()
    {
        $this->reportSections["personnel_training_and_certification"] = 1;
        $this->reportSections["QA_counselling"] = 2;
        $this->reportSections["physical_facility"] = 3;
        $this->reportSections["safety"] = 4;
        $this->reportSections["pre_testing_phase"] = 5;
        $this->reportSections["testing_phase"] = 6;
        $this->reportSections["post_testing_phase"] = 7;
        $this->reportSections["external_quality_assessment"] = 8;
        $this->reportSections["overall_performance"] = 0;
        $this->reportSections["overall_sites_level"] = 101;
    }


    public function getData($orgUnitIds, $orgTimeline, $siteTypes, $startDate, $endDate)
    {
        $this->userOrgTimelineParams = empty($orgTimeline) ? [] : $orgTimeline;
        $this->startDate = $startDate;
        $this->endDate = $endDate;

        $recordsReadData = [];
        $payload = null;
        if (isset($siteTypes) && !empty($siteTypes)) {
            $payload = array();
            for ($x = 0; $x < count($siteTypes); $x++) {
                $this->siteType = strtolower($siteTypes[$x]);
                [$recordsReadData, $payld] = $this->getDataLoopOrgs($orgUnitIds, $recordsReadData);
                for ($i = 0; $i < count($orgUnitIds); $i++) {
                    $payld[$orgUnitIds[$i]]["OrgUniType"] = $siteTypes[$x];
                }

                $payload[] = $payld;
            }
        } else {
            [$recordsReadData, $payload] = $this->getDataLoopOrgs($orgUnitIds, $recordsReadData);
        }

        return $payload;
    }

    private function getDataLoopOrgs($orgUnitIds, $recordsReadData)
    {
        $payload = array();
        for ($x = 0; $x < count($orgUnitIds); $x++) {
            try {
                $orgMeta = $this->getOrgsByLevel($orgUnitIds[$x]);
                $orgToProcess = $orgMeta[0];
                $level = $orgMeta[1];
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
                $orgUnit['org_unit_id'] = $orgUnitIds[$x];

                $records = null;

                if (array_key_exists($orgUnit['org_unit_id'], $recordsReadData)) {
                    $records = $recordsReadData[$orgUnit['org_unit_id']];
                } else {
                    $records = $this->getFormRecords($orgUnit);
                    $recordsReadData[$orgUnit['org_unit_id']] = $records;
                }
                $results = array();
                $results["orgName"] = $orgUnitName;
                $results["PersonellTrainingAndCertification"] = $this->getPersonellTrainingAndCertification($orgUnit, $records);
                $results["QACounselling"] = $this->getQACounselling($orgUnit, $records);
                $results["PhysicalFacility"] = $this->getPhysicalFacility($orgUnit, $records);
                $results["Safety"] = $this->getSafety($orgUnit, $records);
                $results["PreTestingPhase"] = $this->getPreTestingPhase($orgUnit, $records);
                $results["TestingPhase"] = $this->getTestingPhase($orgUnit, $records);
                $results["PostTestingPhase"] = $this->getPostTestingPhase($orgUnit, $records);
                $results["ExternalQualityAssessment"] = $this->getExternalQualityAssessment($orgUnit, $records);
                $results["OverallPerformance"] = $this->getOverallPerformance($orgUnit, $records);
                $results["OverallSitesLevel"] = $this->getOverallSitesLevel($orgUnit, $records);
                $payload[$orgUnitIds[$x]] = $results;
            } catch (Exception $ex) {
                Log::error($ex);
            }
        }
        return [$recordsReadData, $payload];
    }


    private function getOrgsByLevel($orgUnitId)
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
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->country)));
            return [$orgUnitSruc, $level];
        } else if ($level == 2) {
            $orgUnitObject = OdkOrgunit::select(
                "odkorgunit.odk_unit_name as county",
                "org1.odk_unit_name as country"
            )->join('odkorgunit as org1', 'odkorgunit.parent_id', '=', 'org1.org_unit_id')
                ->where('odkorgunit.org_unit_id', $orgUnitId)
                ->first();

            $orgUnitSruc =  array();
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->country)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->county)));
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
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->country)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->county)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->subcounty)));
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
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->country)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->county)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->subcounty)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->facility)));
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
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->country)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->county)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->subcounty)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->facility)));
            $orgUnitSruc[] = str_replace(' ', '_', trim(strtolower($orgUnitObject->site)));
            return [$orgUnitSruc, $level];
        }
    }

    private function sumValues($record, $scores, $rowCounters, $section)
    {
        if ($record["baselinefollowup"] == 'Baseline') {
            if (in_array($this->timeLines[0], $this->userOrgTimelineParams) || empty($this->userOrgTimelineParams)) {
                $scores[$this->timeLines[0]] += $this->callFunctionBysecition($section, $record);
                $rowCounters[$this->timeLines[0]] += 1;
            }
        } else if ($record["baselinefollowup"] == 'followup') {

            $followupType = $record["followup"];
            for ($x = 0; $x < count($this->timeLines); $x++) {
                if ($followupType == $this->timeLines[$x]) {
                    if (in_array($this->timeLines[$x], $this->userOrgTimelineParams) || empty($this->userOrgTimelineParams)) {
                        $rowCounters[$this->timeLines[$x]] += 1;
                        $scores[$this->timeLines[$x]] += $this->callFunctionBysecition($section, $record);
                    }
                }
            }
        }
        return [$scores, $rowCounters];
    }

    private function processRecord($record, $scores, $orgUnit, $overallSitesLevel, $rowCounters, $score, $rowCounter, $section)
    {
        if ($orgUnit['mysites_county'] == 'kenya' || empty($orgUnit['mysites_county'])) {
            Log::info("processing kenya");
            $rowCounter = $rowCounter + 1; //no or rows processed.
            if ($section == $this->reportSections["overall_sites_level"]) {
                $overallSitesLevel =  $this->callFunctionBysecition($section, $record, $overallSitesLevel);
            } else {
                $valueAccumulations = $this->sumValues($record, $scores, $rowCounters, $section);
                $scores = $valueAccumulations[0];
                $rowCounters = $valueAccumulations[1];
                $score =  $this->callFunctionBysecition($section, $record) + $score;
            }
        } else {
            Log::info(strtolower($record['mysites_county']) . "  compp  " . $orgUnit['mysites_county']);
            if (strtolower($record['mysites_county']) == $orgUnit['mysites_county']) {
                Log::info("facility 1 " . $orgUnit['mysites_county']);
                if (!empty($orgUnit['mysites_subcounty'])) {
                    Log::info(strtolower($record['mysites_subcounty']) . " facility2 " . $orgUnit['mysites_subcounty']);
                    if (strtolower($record['mysites_subcounty']) == $orgUnit['mysites_subcounty']) {

                        if (!empty($orgUnit['mysites_facility'])) {
                            Log::info(strtolower($record['mysites_facility']) . " facility3 " . $orgUnit['mysites_facility']);
                            if (strtolower($record['mysites_facility']) == $orgUnit['mysites_facility']) {
                                Log::info(strtolower($record['mysites']) . " site1 " . $orgUnit['mysites']);
                                if (!empty($orgUnit['mysites'])) {
                                    Log::info(strtolower($record['mysites']) . " site2 " . $orgUnit['mysites']);
                                    if (strtolower($record['mysites']) == $orgUnit['mysites']) {
                                        Log::info(strtolower($record['mysites']) . " site3 " . $orgUnit['mysites']);
                                        $rowCounter = $rowCounter + 1; //no or rows processed.
                                        if ($section == $this->reportSections["overall_sites_level"]) {
                                            $overallSitesLevel =  $this->callFunctionBysecition($section, $record, $overallSitesLevel);
                                        } else {
                                            $valueAccumulations = $this->sumValues($record, $scores, $rowCounters, $section);
                                            $scores = $valueAccumulations[0];
                                            $rowCounters = $valueAccumulations[1];
                                            $score =  $this->callFunctionBysecition($section, $record) + $score;
                                        }
                                    }
                                } else {
                                    $rowCounter = $rowCounter + 1; //no or rows processed.
                                    if ($section == $this->reportSections["overall_sites_level"]) {
                                        $overallSitesLevel =  $this->callFunctionBysecition($section, $record, $overallSitesLevel);
                                    } else {
                                        $valueAccumulations = $this->sumValues($record, $scores, $rowCounters, $section);
                                        $scores = $valueAccumulations[0];
                                        $rowCounters = $valueAccumulations[1];
                                        $score =  $this->callFunctionBysecition($section, $record)  + $score;
                                    }
                                }
                            }
                        } else {
                            $rowCounter = $rowCounter + 1; //no or rows processed.
                            if ($section == $this->reportSections["overall_sites_level"]) {
                                $overallSitesLevel =  $this->callFunctionBysecition($section, $record, $overallSitesLevel);
                            } else {
                                $valueAccumulations = $this->sumValues($record, $scores, $rowCounters, $section);
                                $scores = $valueAccumulations[0];
                                $rowCounters = $valueAccumulations[1];
                                $score =  $this->callFunctionBysecition($section, $record)  + $score;
                            }
                        }
                    }
                } else {
                    $rowCounter = $rowCounter + 1; //no or rows processed.
                    if ($section == $this->reportSections["overall_sites_level"]) {
                        $overallSitesLevel =  $this->callFunctionBysecition($section, $record, $overallSitesLevel);
                    } else {
                        $valueAccumulations = $this->sumValues($record, $scores, $rowCounters, $section);
                        $scores = $valueAccumulations[0];
                        $rowCounters = $valueAccumulations[1];
                        $score =  $this->callFunctionBysecition($section, $record)  + $score;
                    }
                }
            }
        }

        return [$record, $scores, $orgUnit, $overallSitesLevel, $rowCounters, $score, $rowCounter, $section];
    }

    private function getSummationValues($records, $orgUnit, $section)
    {
        $rowCounter = 0;
        $score = 0;
        $overallSitesLevelScores = [
            "level0" => 0,
            "level1" => 0,
            "level2" => 0,
            "level3" => 0,
            "level4" => 0,
            "counter" => 0
        ];
        $overallSitesLevel = [];
        $rowCounters = [];
        $scores = [];

        for ($x = 0; $x < count($this->timeLines); $x++) {
            if (in_array($this->timeLines[$x], $this->userOrgTimelineParams) || empty($this->userOrgTimelineParams)) {
                $overallSitesLevel[$this->timeLines[$x]] = $overallSitesLevelScores;
                $rowCounters[$this->timeLines[$x]] = 0;
                $scores[$this->timeLines[$x]] = 0;
            }
        }

        foreach ($records as $record) {
            Log::info("Start record traversal =========>>");
            $shouldProcessRecord = true;

            if (isset($this->startDate) && !empty($this->startDate)) {

                $recordDate = strtotime($record['start']);
                $newRecordformat = date('Y-m-d', $recordDate);

                $userStartDate = strtotime($this->startDate);
                $newUserStartDate = date('Y-m-d', $userStartDate);
                Log::info("start date =====>> 2");
                Log::info($newUserStartDate);
                Log::info($userStartDate);
                if ($newUserStartDate > $newRecordformat) {
                    Log::info("start date =====>>");
                    Log::info($newUserStartDate);
                    Log::info($userStartDate);
                    $shouldProcessRecord = false;
                }
            }
            if (isset($this->endDate) && !empty($this->endDate)) {

                $recordDate = strtotime($record['start']);
                $newRecordformat = date('Y-m-d', $recordDate);

                $userEndDate = strtotime($this->endDate);
                $newUserEndDate = date('Y-m-d', $userEndDate);

                if ($newRecordformat > $newUserEndDate) {
                    $shouldProcessRecord = false;
                }
            }

            if (
                (isset($this->siteType) && substr(trim(strtolower($record['mysites'])), 0, strlen($this->siteType)) != $this->siteType)
            ) {
                $shouldProcessRecord = false;
            }

            if ($shouldProcessRecord) {
                [$record, $scores, $orgUnit, $overallSitesLevel, $rowCounters, $score, $rowCounter, $section] =
                    $this->processRecord($record, $scores, $orgUnit, $overallSitesLevel, $rowCounters, $score, $rowCounter, $section);
            }

            Log::info("end record traversal ========>>");
        }

        $results = array();
        if ($section == $this->reportSections["overall_sites_level"]) {
            // $results['rowCounter'] = $rowCounter;
            $results['score'] = $overallSitesLevel;
            return $results;
        } else {
            $results['rowCounter'] = $rowCounters;
            $results['score'] = $scores;
            return $results;
        }
    }

    private function getFormRecords($orgUnit)
    {

        $levelObj = OdkOrgunit::select("level")->where('org_unit_id', $orgUnit['org_unit_id'])->first();
        $level = $levelObj->level;
        $fileName = null;

        if ($level == 1) {
            $combinedRecords = [];
            $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
                ->where('form_id', 'like', "spi%") // for spi data
                ->get();
            foreach ($submissionOrgUnitmap as $mapping) {
                $projectId = $mapping->project_id;
                $formId = $mapping->form_id;
                $fileName = $this->getFileToProcessgetFileToProcess($projectId, $formId);
                $perCountyRecords = $this->getSingleFileRecords($fileName);
                if($perCountyRecords){
                    $combinedRecords = array_merge($combinedRecords, iterator_to_array($perCountyRecords, true));
                }
            }
            return $combinedRecords;
        } else if ($level == 2) { // Form Submissions table maps orgid at county level to form id
            $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
                ->where('org_id', $orgUnit['org_unit_id'])
                ->where('form_id', 'like', "spi%") // for spi data
                ->first();
            if (!$submissionOrgUnitmap) {
                Log::error("===>>>> No form submissions data found in Form Submissions table");
            }
            $projectId = $submissionOrgUnitmap->project_id;
            $formId = $submissionOrgUnitmap->form_id;
            $fileName = $this->getFileToProcessgetFileToProcess($projectId, $formId);
        } else {
            $countyId = $this->getCountyIdOfOrg($orgUnit['org_unit_id'], $levelObj);
            Log::info("county id for file search =====>" . $countyId);
            $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
                ->where('org_id', $countyId)
                ->where('form_id', 'like', "spi%") // for spi data
                ->first();
            $projectId = $submissionOrgUnitmap->project_id;
            $formId = $submissionOrgUnitmap->form_id;
            $fileName = $this->getFileToProcessgetFileToProcess($projectId, $formId);
        }

        if ($level != 1) {
            return $this->getSingleFileRecords($fileName);
        }
    }

    private function getSingleFileRecords($fileName)
    {
        $url = "";

        if (Storage::exists($fileName)) {
            $url = Storage::path($fileName);
        } else {
            return 0;
        }
        $csv = Reader::createFromPath($url, 'r');
        $csv->setHeaderOffset(0); //set the CSV header offset
        $stmt = Statement::create();
        $records = $stmt->process($csv);
        return $records;
    }

    private function callFunctionBysecition($section, $record, $overallSites = 0)
    {
        if ($section == $this->reportSections["personnel_training_and_certification"]) {
            return $this->aggregatePersonnellAndTrainingScore($record);
        } else if ($section == $this->reportSections["QA_counselling"]) {
            return $this->aggregateQACounsellingScore($record);
        } else if ($section == $this->reportSections["physical_facility"]) {
            return $this->aggregatePhysicalFacilityScore($record);
        } else if ($section == $this->reportSections["safety"]) {
            return $this->aggregateSafetyScore($record);
        } else if ($section == $this->reportSections["pre_testing_phase"]) {
            return $this->aggregatePreTestingPhase($record);
        } else if ($section == $this->reportSections["testing_phase"]) {
            return $this->aggregateTestingPhase($record);
        } else if ($section == $this->reportSections["post_testing_phase"]) {
            return $this->aggregatePostTestingPhase($record);
        } else if ($section == $this->reportSections["external_quality_assessment"]) {
            return $this->aggregateExternalQualityAssessment($record);
        } else if ($section == $this->reportSections["overall_performance"]) {
            return $this->aggregateOverallPerformance($record);
        } else if ($section == $this->reportSections["overall_sites_level"]) {
            return $this->aggregateOverallSitesLevel($record, $overallSites);
        }
    }

    private function getPercentileValueForSections($score, $rowCounter, $multiplier)
    {
        foreach ($score as $key => $value) {
            try {
                $score[$key] = ($value / ($rowCounter[$key] * $multiplier)) * 100; //get denominator   
                $score[$key] = number_format((float)$score[$key], 1, '.', ',');
            } catch (Exception $ex) {
                $score[$key] = 0;
            }
        }
        return $score;
    }

    //section 1 (Personnel Training & Certification)
    private function getPersonellTrainingAndCertification($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["personnel_training_and_certification"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        $score = $this->getPercentileValueForSections($score, $rowCounter, 3);
        // $score = ($score / ($rowCounter * 3)) * 100; //get denominator   
        // $score = number_format((float)$score, 1, '.', ',');

        return $score;
    }

    private function aggregatePersonnellAndTrainingScore($record)
    {

        $values = array();
        $values["sec_1"] = $record["Section-Section1-providers_undergone_training"];
        $values["sec_2"] =  $record["Section-Section1-training_certificates_available"];
        $values["sec_3"] = $record["Section-Section1-refresher_training"];

        foreach ($values as $key => $val) {
            if (empty($val))
                $values[$key] = 0;
        }

        $score = $values["sec_1"] + $values["sec_2"] + $values["sec_3"];

        return $score;
    }


    //section 2 (QA in Counselling)
    private function getQACounselling($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["QA_counselling"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        $score = $this->getPercentileValueForSections($score, $rowCounter, 6);
        // $score = ($score / ($rowCounter * 6)) * 100; //get denominator   
        // $score = number_format((float)$score, 1, '.', ',');

        return $score;
    }

    private function aggregateQACounsellingScore($record)
    {

        $values = array();
        $values["sec_1"] = $record["Section-Section2-attended_support_supervision"];
        $values["sec_2"] =  $record["Section-Section2-provider_self_assessment"];
        $values["sec_3"] = $record["Section-Section2-client_satisfaction_survey_done"];
        $values["sec_4"] = $record["Section-Section2-observed_practice"];
        $values["sec_5"] = $record["Section-Section2-scmlcsupport"];
        $values["sec_6"] = $record["Section-Section2-cmlcsupport"];

        foreach ($values as $key => $val) {
            if (empty($val))
                $values[$key] = 0;
        }

        $score = $values["sec_1"] + $values["sec_2"] + $values["sec_3"] +
            $values["sec_4"] + $values["sec_5"] + $values["sec_6"];

        return $score;
    }

    //section 3 (Physical Facility)
    private function getPhysicalFacility($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["physical_facility"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        $score = $this->getPercentileValueForSections($score, $rowCounter, 6);
        // $score = ($score / ($rowCounter * 6)) * 100; //get denominator   
        // $score = number_format((float)$score, 1, '.', ',');

        return $score;
    }

    private function aggregatePhysicalFacilityScore($record)
    {

        $values = array();
        $values["sec_1"] = $record["Section-Section3-HIV_testing_area"];
        $values["sec_2"] =  $record["Section-Section3-sufficient_space"];
        $values["sec_3"] = $record["Section-Section3-confidentiality"];
        $values["sec_4"] = $record["Section-Section3-clean_testing_area"];
        $values["sec_5"] = $record["Section-Section3-sufficient_lighting"];
        $values["sec_6"] = $record["Section-Section3-secure_storage"];

        foreach ($values as $key => $val) {
            if (empty($val))
                $values[$key] = 0;
        }

        $score = $values["sec_1"] + $values["sec_2"] + $values["sec_3"] +
            $values["sec_4"] + $values["sec_5"] + $values["sec_6"];

        return $score;
    }


    //section 4 (Safety)
    private function getSafety($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["safety"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        $score = $this->getPercentileValueForSections($score, $rowCounter, 6);
        // $score = ($score / ($rowCounter * 6)) * 100; //get denominator   
        // $score = number_format((float)$score, 1, '.', ',');

        return $score;
    }

    private function aggregateSafetyScore($record)
    {

        $values = array();
        $values["sec_1"] = $record["Section-Section4-running_water"];
        $values["sec_2"] =  $record["Section-Section4-soap"];
        $values["sec_3"] = $record["Section-Section4-wastesegregationfacility"];
        $values["sec_4"] = $record["Section-Section4-segregationonsite"];
        $values["sec_5"] = $record["Section-Section4-pep_protocols"];
        $values["sec_6"] = $record["Section-Section4-pep_protocols_followed"];

        foreach ($values as $key => $val) {
            if (empty($val))
                $values[$key] = 0;
        }

        $score = $values["sec_1"] + $values["sec_2"] + $values["sec_3"] +
            $values["sec_4"] + $values["sec_5"] + $values["sec_6"];


        return $score;
    }

    //section 5 (Pre Testing Phase)
    private function getPreTestingPhase($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["pre_testing_phase"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        $score = $this->getPercentileValueForSections($score, $rowCounter, 14);
        // $score = ($score / ($rowCounter * 14)) * 100; //get denominator   
        // $score = number_format((float)$score, 1, '.', ',');

        return $score;
    }

    private function aggregatePreTestingPhase($record)
    {
        $values = array();
        $values["sec5_1"] = $record["Section-Section5-job_aides_infectious_waste"];
        $values["sec5_2"] = $record["Section-Section5-bloodspills"];
        $values["sec5_3"] = $record["Section-Section5-job_aides_nationalalgo"];
        $values["sec5_4"] = $record["Section-Duokit_used"];
        $values["sec5_5"] = $record["Section-subsec5-Duokit_jobaide"];
        $values["sec5_7"] = $record["Section-subsec5-Determine_jobaide"];
        $values["sec5_8"] = $record["Section-subsec5-FirstResponce_jobaide"];
        $values["sec5_9"] = $record["Section-subsec5-expirationdate"];
        $values["sec5_10"] = $record["Section-subsec5-testkitskeptwell"];
        $values["sec5_11"] = $record["Section-subsec5-newconsignmentQC"];
        $values["sec5_12"] = $record["Section-subsec5-newkitlotQC"];
        $values["sec5_13"] = $record["Section-subsec5-monthlyQC"];
        $values["sec5_14"] = $record["Section-subsec5-qc_recorded"];
        $values["sec5_15"] = $record["Section-subsec5-stepstocorrect_invalid_QC"];

        foreach ($values as $key => $val) {
            if (empty($val))
                $values[$key] = 0;
        }

        $score = $values["sec5_1"] + $values["sec5_2"] + $values["sec5_3"] +
            $values["sec5_4"] + $values["sec5_5"] + $values["sec5_7"] +
            $values["sec5_8"] + $values["sec5_9"] + $values["sec5_10"] +
            $values["sec5_11"] + $values["sec5_12"] + $values["sec5_13"] +
            $values["sec5_14"] + $values["sec5_15"];

        return $score;
    }


    //section 6 (Testing Phase)
    private function getTestingPhase($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["testing_phase"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        $score = $this->getPercentileValueForSections($score, $rowCounter, 11);
        // $score = ($score / ($rowCounter * 11)) * 100; //get denominator   
        // $score = number_format((float)$score, 1, '.', ',');

        return $score;
    }

    private function aggregateTestingPhase($record)
    {
        $values = array();
        $values["sec5_1"] = $record["Section-Section6-hts_algorithmfollowed"];
        $values["sec5_2"] =  $record["Section-Section6-duokit_algo_followed"];

        $values["sec5_3"] = $record["Section-Section6-samplecollection"];

        $values["sec5_4"] = $record["Section-Section6-Determine_algo"];

        $values["sec5_5"] = $record["Section-Section6-Duokit_procedure"];

        $values["sec5_7"] = $record["Section-Section6-FirstResponce_algo"];

        $values["sec5_8"] = $record["Section-Section6-timersavailable"];

        $values["sec5_9"] = $record["Section-Section6-timersused"];

        $values["sec5_10"] = $record["Section-Section6-resultsinterpreted"];

        $values["sec5_11"] = $record["Section-Section6-retesting"];

        $values["sec5_12"] = $record["Section-Section6-retestingrecord"];


        foreach ($values as $key => $val) {
            if (empty($val))
                $values[$key] = 0;
        }

        $score = $values["sec5_1"] + $values["sec5_2"] + $values["sec5_3"] +
            $values["sec5_4"] + $values["sec5_5"] + $values["sec5_7"] +
            $values["sec5_8"] + $values["sec5_9"] + $values["sec5_10"] +
            $values["sec5_11"] + $values["sec5_12"];

        return $score;
    }

    //section 7 (Post Testing Phase)
    private function getPostTestingPhase($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["post_testing_phase"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        $score = $this->getPercentileValueForSections($score, $rowCounter, 10);
        // $score = ($score / ($rowCounter * 10)) * 100; //get denominator   
        // $score = number_format((float)$score, 1, '.', ',');

        return $score;
    }

    private function aggregatePostTestingPhase($record)
    {
        $values = array();
        $values["sec_1"] = $record["Section-Section7-Qc_records_review"];
        $values["sec_2"] =  $record["Section-Section7-registeravailable"];

        $values["sec_3"] = $record["Section-Section7-qualityelements"];

        $values["sec_4"] = $record["Section-Section7-elementscapturedcorrectly"];

        $values["sec_5"] = $record["Section-Section7-summaryavailable"];

        $values["sec_6"] = $record["Section-Section7-invalid_results"];

        $values["sec_7"] = $record["Section-Section7-invalid_repeated"];

        $values["sec_8"] = $record["Section-Section7-client_docs_stored"];

        $values["sec_9"] = $record["Section-Section7-secure_doc_storage"];

        $values["sec_10"] = $record["Section-Section7-properly_labelled"];


        foreach ($values as $key => $val) {
            if (empty($val))
                $values[$key] = 0;
        }

        $score = $values["sec_1"] + $values["sec_2"] + $values["sec_3"] +
            $values["sec_4"] + $values["sec_5"] + $values["sec_6"]  + $values["sec_7"] +
            $values["sec_8"] + $values["sec_9"] + $values["sec_10"];

        return $score;
    }


    //section 8 External Quality Assessment
    private function getExternalQualityAssessment($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["external_quality_assessment"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        $score = $this->getPercentileValueForSections($score, $rowCounter, 10);
        // $score = ($score / ($rowCounter * 10)) * 100; //get denominator   
        // $score = number_format((float)$score, 1, '.', ',');

        return $score;
    }

    private function aggregateExternalQualityAssessment($record)
    {
        $values = array();
        $values["sec_1"] = $record["Section-Section8-allprovidersenrolled"];
        $values["sec_2"] =  $record["Section-Section8-providerstestPT"];

        $values["sec_3"] = $record["Section-Section8-resultssubmittedonline"];

        $values["sec_4"] = $record["Section-Section8-feedbackreceived"];

        $values["sec_5"] = $record["Section-Section8-feedbackreviewed"];

        $values["sec_6"] = $record["Section-Section8-feedbackreportfilled"];

        $values["sec_7"] = $record["Section-Section8-providerscorrectiveaction"];

        $values["sec_8"] = $record["Section-Section8-technicalsupervision"];

        $values["sec_9"] = $record["Section-Section8-retrainingdone"];

        $values["sec_10"] = $record["Section-Section8-feedbackdocumented"];


        foreach ($values as $key => $val) {
            if (empty($val))
                $values[$key] = 0;
        }

        $score = $values["sec_1"] + $values["sec_2"] + $values["sec_3"] +
            $values["sec_4"] + $values["sec_5"] + $values["sec_6"]  + $values["sec_7"] +
            $values["sec_8"] + $values["sec_9"] + $values["sec_10"];

        return $score;
    }

    //section 0 Overall Performance
    private function getOverallPerformance($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["overall_performance"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];

        foreach ($score as $key => $value) {
            try {
                $score[$key] = ($value / $rowCounter[$key]); //get denominator   
                $score[$key] = number_format((float)$score[$key], 1, '.', ',');
            } catch (Exception $ex) {
                $score[$key] = 0;
            }
        }

        return $score;
    }

    private function aggregateOverallPerformance($record)
    {
        $values = array();
        $values["sec_1"] = $record["Section-sec91percentage"];

        foreach ($values as $key => $val) {
            if (empty($val))
                $values[$key] = 0;
        }

        $score = $values["sec_1"];

        return $score;
    }


    //section 101 Overall Sites Level
    private function getOverallSitesLevel($orgUnit, $records)
    {
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["overall_sites_level"]);
        $overallSitesLevel = $summationValues['score'];
        foreach ($overallSitesLevel as $timeLine => $timeLineData) {
            // value level0, level1 etc
            foreach ($timeLineData as $key => $value) {
                if ($key != 'counter') {
                    try {
                        Log::info("ths value of data ==>");
                        Log::info(print_r($timeLineData[$key], true));
                        Log::info(print_r($timeLineData["counter"], true));
                        Log::info($key);
                        Log::info("ths value of data ==> 2");
                        $overallSitesLevel[$timeLine][$key] = number_format((float)($timeLineData[$key] / $timeLineData["counter"]) * 100, 1, '.', ',');
                    } catch (Exception $ex) {
                        $timeLineData[$key] = '';
                    }
                }
            }
        }

        return $overallSitesLevel;
    }

    private function summTimelineData($timeLine, $val, $overallSites)
    {
        if (round($val) < 40) {
            $overallSites[$timeLine]["level0"] = $overallSites[$timeLine]["level0"] + 1;
        } else if (round($val) >= 40 && round($val) <= 59) {
            $overallSites[$timeLine]["level1"] = $overallSites[$timeLine]["level1"] + 1;
        } else if (round($val) >= 60 && round($val) <= 79) {
            $overallSites[$timeLine]["level2"] = $overallSites[$timeLine]["level2"] + 1;
        } else if (round($val) >= 80 && round($val) <= 89) {
            $overallSites[$timeLine]["level3"] = $overallSites[$timeLine]["level3"] + 1;
        } else if (round($val) >= 90) {
            $overallSites[$timeLine]["level4"] = $overallSites[$timeLine]["level4"] + 1;
        }
        return $overallSites;
    }

    private function aggregateOverallSitesLevel($record, $overallSites)
    {

        $val = $record["Section-sec91percentage"];
        if ($record["baselinefollowup"] == 'Baseline') {
            if (in_array($this->timeLines[0], $this->userOrgTimelineParams) || empty($this->userOrgTimelineParams)) {
                $overallSites[$this->timeLines[0]]["counter"] = $overallSites[$this->timeLines[0]]["counter"] + 1;
                $overallSites = $this->summTimelineData($this->timeLines[0], $val, $overallSites);
            }
        } else if ($record["baselinefollowup"] == 'followup') {
            $followupType = $record["followup"];
            for ($x = 0; $x < count($this->timeLines); $x++) {
                if (in_array($this->timeLines[$x], $this->userOrgTimelineParams) || empty($this->userOrgTimelineParams)) {
                    if ($followupType == $this->timeLines[$x]) {
                        $overallSites[$this->timeLines[$x]]["counter"] = $overallSites[$this->timeLines[$x]]["counter"] + 1;
                        $overallSites = $this->summTimelineData($this->timeLines[$x], $val, $overallSites);
                    }
                }
            }
        }

        return $overallSites;
    }


    private function getCountyIdOfOrg($orgUnitId, $levelObj)
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

    private function getFileToProcessgetFileToProcess($projectId, $formId)
    {
        $filePath = "submissions/" . $projectId . "_" . $formId . "_submissions.csv";
        return $filePath;
    }
}

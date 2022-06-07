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
use DateInterval;
use DatePeriod;
use DateTime;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use League\Csv\Reader;
use League\Csv\Statement;

use ZipArchive;

class ODkHTSDataAggregator
{
    private $reportSections = array();
    private $siteType = null;
    private $startDate = null;
    private $endDate = null;


    public function __construct()
    {
        $this->reportSections["agreement_rate"] = 1;
    }

    public function getSubmissions($orgUnitIds, $siteTypes, $startDate, $endDate)
    {
        $currentDate = new DateTime('now');

        $this->startDate = empty($startDate) ?  $currentDate->modify('-3 months')->format("Y-m-d") : $startDate;
        $this->endDate = empty($endDate) ? date("Y-m-d") : $endDate;

        // for each org unit, get the submissions
        $formSubmissions = array();
        ///////////
        for ($x = 0; $x < count($orgUnitIds); $x++) {
            try {
                $odkUtils = new ODKUtils();
                $orgMeta = $odkUtils->getOrgsByLevel($orgUnitIds[$x]['org_unit_id']);
                $orgToProcess = $orgMeta[0];
                $level = $orgMeta[1];
                [$orgUnit,  $orgUnitName] = $odkUtils->getOrgUnitHierachyNames($orgToProcess, $level);
                $orgUnit['org_unit_id'] = $orgUnitIds[$x]['id'];

                $records = $this->getFormRecords($orgUnitIds[$x]) ?? [];

                if(isset($startDate) && isset($endDate)) {
                    $records = array_filter($records, function ($record) use ($startDate, $endDate) {
                        $date = new DateTime($record['start']);
                        return $date >= new DateTime($startDate) && $date <= new DateTime($endDate);
                    });
                }
                
                if (array_key_exists($orgUnit['org_unit_id'], $formSubmissions)) {
                    // $records = $formSubmissions[$orgUnit['org_unit_id']];
                    $records = $formSubmissions[$orgUnitIds[$x]['org_unit_id']];
                } else {
                    // $records = $this->getFormRecords($orgUnit);
                    $formSubmissions[$orgUnit['org_unit_id']] = $records;
                }
            } catch (Exception $ex) {
                Log::error($ex);
            }
        }
        ///////////
        return $formSubmissions;
    }


    public function getData($orgUnitIds, $siteTypes, $startDate, $endDate)
    {

        $currentDate = new DateTime('now');

        $this->startDate = empty($startDate) ?  $currentDate->modify('-3 months')->format("Y-m-d") : $startDate;
        $this->endDate = empty($endDate) ? date("Y-m-d") : $endDate;

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
            [$recordsReadData, $payld] = $this->getDataLoopOrgs($orgUnitIds, $recordsReadData);
            $payload = array();
            $payload[] = $payld;
        }
        // Log::info("totals ======>>");
        // Log::info($payload);
        $payload = $this->aggregateAgreementRates($payload);

        return $payload;
    }

    private function aggregateAgreementRates($payload)
    {

        $orgUnitArray['overall_concordance_totals'] = [];
        foreach ($payload as $payldkey => $payld) {
            foreach ($payld as $orgUnitKey => $orgUnitArray) { //per organisation unit
                try {
                    foreach ($orgUnitArray['overall_agreement_rate'] as $monthlyDate => $monthlySites) { //summations for each org per month
                        $scores = array();
                        $scores['>98'] = 0;
                        $scores['95-98'] = 0;
                        $scores['<95'] = 0;

                        $signedSites = array();
                        $signedSites['signed'] = 0;
                        $signedSites['not_signed'] = 0;
                        $monthlySites['supervisory_signature'] =  $signedSites;

                        $algorithmFollowedSites = array();
                        $algorithmFollowedSites['followed'] = 0;
                        $algorithmFollowedSites['not_followed'] = 0;
                        $monthlySites['algorithm_followed'] =  $algorithmFollowedSites;

                        $htsRegister = array();
                        $htsRegister['ehts'] = 0;
                        $htsRegister['hardcopy'] = 0;
                        $monthlySites['hts_type'] =   $htsRegister;

                        $completnesScores = ['completness' => 0];
                        $consistencyScores = ['consistent' => 0];
                        $invalidRateScores = ['invalid_results_rate' => 0];

                        $invalidScores['invalids'] = 0;
                        $invalidScores['totalTests'] = 0;

                        $scores['total_sites'] = 0;
                        $monthlySites['totals'] = $scores;
                        $monthlySites['sitenames'] = [
                            '>98' => [],
                            '95-98' => [],
                            '<95' => [],
                        ];
                        $monthlySites['concordance-totals'] = 0;

                        $monthlySites['concordance_t1_reactive'] = 0;
                        $monthlySites['concordance_t2_reactive'] = 0;

                        foreach ($monthlySites as $sitename => $site) { //sites per month -- sites in a month
                            try {
                                $agreement = ($site['t2_reactive'] + $site['t1_non_reactive']) / ($site['t1_reactive'] + $site['t1_non_reactive']);
                                $monthlySites['totals']['total_sites'] += 1;
                                $agreementRate = $agreement * 100;

                                $monthlySites['concordance_t1_reactive'] += $site['t1_reactive'];
                                $monthlySites['concordance_t2_reactive'] += $site['t2_reactive'];

                                // check if this site has data completenss.
                                if (array_key_exists('completeness', $site) && !array_key_exists('incompleteness', $site)) {
                                    $completnesScores['completness'] += 1;
                                }

                                //check for data consistncy
                                if ($site['t1_non_reactive'] == $site['t1_non_reactive_totals']) {
                                    $consistencyScores['consistent'] += 1;
                                }

                                $invalidScores['totalTests'] += $site['t1_totals_tests'];
                                $invalidScores['invalids'] += $site['t1_invalids'];

                                if ($agreementRate > 98) {
                                    $monthlySites['totals']['>98'] += 1;
                                    $monthlySites['sitenames']['>98'][] = $sitename;
                                } else if ($agreementRate >= 95 && $agreementRate <= 98) {
                                    $monthlySites['totals']['95-98'] += 1;
                                    $monthlySites['sitenames']['95-98'][] = $sitename;
                                } else if ($agreementRate < 95) {
                                    $monthlySites['totals']['<95'] += 1;
                                    $monthlySites['sitenames']['<95'][] = $sitename;
                                }

                                //supervisory signatures aggregation

                                if (in_array(1, $site['supervisory_signature']) && in_array(0, $site['supervisory_signature'])) {
                                    $monthlySites['supervisory_signature']['not_signed'] += 1;
                                }
                                if (in_array(1, $site['supervisory_signature']) && !in_array(0, $site['supervisory_signature'])) {
                                    $monthlySites['supervisory_signature']['signed'] += 1;
                                }
                                if (!in_array(1, $site['supervisory_signature']) && in_array(0, $site['supervisory_signature'])) {
                                    $monthlySites['supervisory_signature']['not_signed'] += 1;
                                }

                                //algortihm followed counts
                                if (in_array(1, $site['algorithm_followed']) && in_array(0, $site['algorithm_followed'])) {
                                    $monthlySites['algorithm_followed']['not_followed'] += 1;
                                }
                                if (in_array(1, $site['algorithm_followed']) && !in_array(0, $site['algorithm_followed'])) {
                                    $monthlySites['algorithm_followed']['followed'] += 1;
                                }
                                if (!in_array(1, $site['algorithm_followed']) && in_array(0, $site['algorithm_followed'])) {
                                    $monthlySites['algorithm_followed']['not_followed'] += 1;
                                }
                                //end
                                //if site uses ehts or hardcopy
                                $monthlySites['hts_type']['ehts'] += $site['register']['ehts'];
                                $monthlySites['hts_type']['hardcopy'] += $site['register']['hardcopy'];
                            } catch (Exception $ex) {
                                //  Log::error($ex);
                            }
                        }
                        $totalConcordance = 0;
                        try {
                            $totalConcordance = ($monthlySites['concordance_t2_reactive'] * 100) / $monthlySites['concordance_t1_reactive'];
                            $totalConcordance = number_format((float)$totalConcordance, 1, '.', '');
                        } catch (Exception $ex) {
                        }

                        $orgUnitArray['overall_agreement_rate'][$monthlyDate] = []; // do not include per site scores in payload
                        $orgUnitArray['overall_agreement_rate'][$monthlyDate]['totals'] = $monthlySites['totals'];
                        $orgUnitArray['overall_agreement_rate'][$monthlyDate]['sitenames'] = $monthlySites['sitenames'];
                        $orgUnitArray['overall_concordance_totals'][$monthlyDate] = $totalConcordance;
                        $orgUnitArray['completeness'][$monthlyDate] = $completnesScores['completness'];
                        $orgUnitArray['consistency'][$monthlyDate] = $consistencyScores['consistent'];
                        $orgUnitArray['supervisory_signature'][$monthlyDate] = $monthlySites['supervisory_signature'];
                        $orgUnitArray['algorithm_followed'][$monthlyDate] = $monthlySites['algorithm_followed'];
                        $orgUnitArray['hts_type'][$monthlyDate] = $monthlySites['hts_type'];

                        //invalid rates
                        $invlidRate = 0;
                        try {
                            $invlidRate = ($invalidScores['invalids'] * 100) /  $invalidScores['totalTests'];
                            $invlidRate = number_format((float)$invlidRate, 1, '.', '');
                        } catch (Exception $ex) {
                        }
                        $orgUnitArray['invalid_rates'][$monthlyDate] = number_format((float)$invlidRate, 1, '.', '');
                    }
                } catch (Exception $ex) {
                    Log::error($ex);
                }

                $payld[$orgUnitKey] = $orgUnitArray;
            }
            $payload[$payldkey] = $payld;
        }
        return $payload;
    }

    //get scores for each organisation unit from rquest parameters
    private function getDataLoopOrgs($orgUnitIds, $recordsReadData)
    {
        $payload = array();
        for ($x = 0; $x < count($orgUnitIds); $x++) {
            try {
                $odkUtils = new ODKUtils();
                $orgMeta = $odkUtils->getOrgsByLevel($orgUnitIds[$x]);
                $orgToProcess = $orgMeta[0];
                $level = $orgMeta[1];

                [$orgUnit,  $orgUnitName] = $odkUtils->getOrgUnitHierachyNames($orgToProcess, $level);

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

                $results["overall_agreement_rate"] = $this->getOverallAgreementsRate($orgUnit, $records); //get per site sums/scores

                $payload[$orgUnitIds[$x]] = $results;
            } catch (Exception $ex) {
                Log::error($ex);
            }
        }
        return [$recordsReadData, $payload];
    }

    private function sumValues($record, $monthScoreMap, $rowsPerMonthAndScoreCounter, $section)
    {

        $dateValue = strtotime($record['registerstartdate']);

        $yr = date("Y", $dateValue);
        $mon = date("m", $dateValue);
        $siteConcatName = $record['mysites_county'] . $record['mysites_subcounty'] . $record['mysites_facility'] . $record['mysites'];

        if (!array_key_exists($siteConcatName, $monthScoreMap[$yr . '-' . $mon])) {
            // Log::info($record);
            $monthScoreMap[$yr . '-' . $mon][$siteConcatName] = array(
                't1_reactive' => 0,
                't1_non_reactive' => 0,
                't2_reactive' => 0,
                't1_non_reactive_totals' => 0,
                't1_invalids' => 0,
                't1_totals_tests' => 0,
                'supervisory_signature' => array(),
                'algorithm_followed' => array(),
                'register' => array(
                    'ehts' => 0,
                    'hardcopy' => 0
                ),

            );
        }
        $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_reactive'] += $record['Section-section0-testreactive'];
        $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_non_reactive'] += $record['Section-section0-nonreactive'];
        $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t2_reactive'] += $record['Section-section1-testreactive1'];
        $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_invalids'] += $record['Section-section0-totalinvalid'];
        $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_totals_tests'] += ($record['Section-section0-testreactive'] +
            $record['Section-section0-nonreactive'] +
            $record['Section-section0-totalinvalid']);
        try {
            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_non_reactive_totals'] += $record['Section-Section3-totals1-tnegative1'];
        } catch (Exception $ex) {
        }

        //check if this site uses eHTS of Hardcopy
        try {
            if ($record['register'] == 'eHTS') {
                $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['register']['ehts'] = 1;
            } else {
                $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['register']['hardcopy'] = 1;
            }
        } catch (Exception $ex) {
            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['register']['hardcopy'] = 1;
        }

        //check data completeness for this site Section-Section3-totals1-tnegative1
        if (
            trim(strtolower($record['Section-tezt'])) == 'provided' &&
            trim(strtolower($record['Section-lots1'])) == 'provided' &&
            trim(strtolower($record['Section-note1'])) == 'provided' &&
            trim(strtolower($record['Section-tezt1'])) == 'provided' &&
            trim(strtolower($record['Section-lots2'])) == 'provided' &&
            trim(strtolower($record['Section-note2'])) == 'provided'
        ) {
            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['completeness'] = 1;
        } else {
            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['incompleteness'] = 1;
        }

        //check if supervisor signed or not signed
        if (
            trim(strtolower($record['Section-Section4-surpervisor'])) == 1
        ) {
            array_push($monthScoreMap[$yr . '-' . $mon][$siteConcatName]['supervisory_signature'], 1);
        } else {
            array_push($monthScoreMap[$yr . '-' . $mon][$siteConcatName]['supervisory_signature'], 0);
        }
        //end

        //check if supervisor signed or not signed
        if (
            trim(strtolower($record['Section-Section4-algorithm'])) == 1
        ) {
            array_push($monthScoreMap[$yr . '-' . $mon][$siteConcatName]['algorithm_followed'], 1);
        } else {
            array_push($monthScoreMap[$yr . '-' . $mon][$siteConcatName]['algorithm_followed'], 0);
        }
        //end

        $rowsPerMonthAndScoreCounter[$yr . '-' . $mon] += 1;

        return [$monthScoreMap, $rowsPerMonthAndScoreCounter];
    }

    private function processRecord($record, $monthScoreMap, $orgUnit, $rowsPerMonthAndScoreCounter, $rowCounter, $section)
    {
        // $record, $monthScoreMap, $orgUnit, $rowsPerMonthAndScoreCounter, $score, $rowCounter, $section

        if ($orgUnit['mysites_county'] == 'kenya' || empty($orgUnit['mysites_county'])) {
            Log::info("processing kenya");
            $rowCounter = $rowCounter + 1; //no or rows processed/mathced for an org unit or units below it.

            $valueAccumulations = $this->sumValues($record, $monthScoreMap, $rowsPerMonthAndScoreCounter, $section);
            $monthScoreMap = $valueAccumulations[0];
            $rowsPerMonthAndScoreCounter = $valueAccumulations[1];
            //$score =  $this->callFunctionBysecition($section, $record);
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
                                        $rowCounter = $rowCounter + 1; //no or rows processed/mathced for an org unit or units below it.

                                        $valueAccumulations = $this->sumValues($record, $monthScoreMap, $rowsPerMonthAndScoreCounter, $section);
                                        $monthScoreMap = $valueAccumulations[0];
                                        $rowsPerMonthAndScoreCounter = $valueAccumulations[1];
                                        // $score =  $this->callFunctionBysecition($section, $record) ;
                                    }
                                } else {
                                    $rowCounter = $rowCounter + 1; //no or rows processed/mathced for an org unit or units below it.

                                    $valueAccumulations = $this->sumValues($record, $monthScoreMap, $rowsPerMonthAndScoreCounter, $section);
                                    $monthScoreMap = $valueAccumulations[0];
                                    $rowsPerMonthAndScoreCounter = $valueAccumulations[1];
                                    // $score =  $this->callFunctionBysecition($section, $record)  + $score;
                                }
                            }
                        } else {
                            $rowCounter = $rowCounter + 1; //no or rows processed/mathced for an org unit or units below it.

                            $valueAccumulations = $this->sumValues($record, $monthScoreMap, $rowsPerMonthAndScoreCounter, $section);
                            $monthScoreMap = $valueAccumulations[0];
                            $rowsPerMonthAndScoreCounter = $valueAccumulations[1];
                            //$score =  $this->callFunctionBysecition($section, $record)  + $score;
                        }
                    }
                } else {
                    $rowCounter = $rowCounter + 1; //no or rows processed/mathced for an org unit or units below it.

                    $valueAccumulations = $this->sumValues($record, $monthScoreMap, $rowsPerMonthAndScoreCounter, $section);
                    $monthScoreMap = $valueAccumulations[0];
                    $rowsPerMonthAndScoreCounter = $valueAccumulations[1];
                    //$score =  $this->callFunctionBysecition($section, $record)  + $score;
                }
            }
        }

        return [$record, $monthScoreMap, $orgUnit, $rowsPerMonthAndScoreCounter, $rowCounter, $section];
    }

    //$orgUnit assotiave array with the orunit level to process matching hts csv file columns as keys
    //$section is not used in this processing, ignore it
    private function getSummationValues($records, $orgUnit, $section)
    {
        $rowCounter = 0; //total rows passed through

        $monthScoreMap = []; //summation
        $rowsPerMonthAndScoreCounter = [];

        $startDate = date_create($this->startDate)->modify('first day of this month');

        $endDate = date_create($this->endDate)->modify('first day of next month');


        $interval = DateInterval::createFromDateString('1 month');
        $period   = new DatePeriod($startDate, $interval, $endDate);

        foreach ($period as $dt) {
            $monthScoreMap[$dt->format("Y-m")] = array();
            $monthScoreMap[$dt->format("Y-m")] = array();
            $monthScoreMap[$dt->format("Y-m")] = array();

            $rowsPerMonthAndScoreCounter[$dt->format("Y-m")] = 0;
        }

        foreach ($records as $record) {
            $shouldProcessRecord = true; //filter out period of data not to be processed in the data loop

            $recordDate = strtotime($record['registerstartdate']);
            $newRecordformat = date('Y-m-d', $recordDate);

            $userStartDate = strtotime($this->startDate);
            $newUserStartDate = date('Y-m-d', $userStartDate);

            $userEndDate = strtotime($this->endDate);
            $newUserEndDate = date('Y-m-d', $userEndDate);

            if ($newUserStartDate > $newRecordformat ||  $newRecordformat > $newUserEndDate) {

                $shouldProcessRecord = false;
            }


            if (
                (isset($this->siteType) && substr(trim(strtolower($record['mysites'])), 0, strlen($this->siteType)) != $this->siteType)
            ) {
                $shouldProcessRecord = false;
            }

            if ($shouldProcessRecord) {
                [$record, $monthScoreMap, $orgUnit, $rowsPerMonthAndScoreCounter, $rowCounter, $section] = //$section not in use, assume it
                    $this->processRecord($record, $monthScoreMap, $orgUnit, $rowsPerMonthAndScoreCounter, $rowCounter, $section);
            }
        }

        $results = array();

        $results['rowsPerMonthAndScoreCounter'] = $rowsPerMonthAndScoreCounter;
        $results['monthScoreMap'] = $monthScoreMap;
        return $results;
    }

    private function getFormRecords($orgUnit)
    {
        $levelObj = OdkOrgunit::select("level")->where('org_unit_id', $orgUnit['org_unit_id'])->first() ?? ['level' => '1'];
        $level = $levelObj->level ?? '1';
        $fileName = null;
        if ($level == 1) {
            $combinedRecords = [];
            $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
                ->where('form_id', 'like', "hts%") // for spi data
                ->get();
            foreach ($submissionOrgUnitmap as $mapping) {
                $projectId = $mapping->project_id;
                $formId = $mapping->form_id;
                $fileName = $this->getFileToProcess($projectId, $formId);
                $perCountyRecords = $this->getSingleFileRecords($fileName, $formId);
                if ($perCountyRecords) {
                    $combinedRecords = array_merge($combinedRecords, $perCountyRecords);
                }
            }
            return $combinedRecords;
        } else if ($level == 2) { // Form Submissions table maps orgid at county level to form id

            $odkUtils = new ODKUtils();
            [$projectId, $formId] = $odkUtils->getFormFormdProjectIds($orgUnit, "hts%");
            $fileName = $this->getFileToProcess($projectId, $formId);
            return $this->getSingleFileRecords($fileName, $formId);
        } else {
            $odkUtils = new ODKUtils();
            [$projectId, $formId] = $odkUtils->getFormFormdProjectIds($orgUnit, "hts%");
            $fileName = $this->getFileToProcess($projectId, $formId);
            return $this->getSingleFileRecords($fileName, $formId);
        }
    }

    private function getSingleFileRecords($file, $formId)
    {

        $url = '';
        if (Storage::exists($file)) {
            $url = Storage::path($file);
        }

        $zip = new ZipArchive;
        try {
            $zip->open($url);
            // Unzip Path
            $zip->extractTo('/tmp/');
            $zip->close();

            $csv = Reader::createFromPath('/tmp/' . $formId . '.csv', 'r');
            $csv->setHeaderOffset(0); //set the CSV header offset
            $stmt = Statement::create();
            $records = $stmt->process($csv);

            $csv = Reader::createFromPath('/tmp/' . $formId . '-pagerepeat.csv', 'r');
            $csv->setHeaderOffset(0); //set the CSV header offset
            $stmt = Statement::create();
            $recordsRepeat = $stmt->process($csv);

            $keyArray = array();

            foreach ($records as $record) {
                $keyArray[$record['KEY']] = $record;
            }

            $combinedRecords = [];
            foreach ($recordsRepeat as $record) {
                $combinedRecords[] = array_merge($keyArray[$record['PARENT_KEY']], $record);
            }

            return $combinedRecords;
        } catch (Exception $ex) {
            Log::error("could not open " . $file . ' ' . $formId);
            return [];
        }
    }

    private function callFunctionBysecition($section, $record, $overallSites = 0)
    {
        // if ($section == $this->reportSections["agreement_rate"]) {
        //     return $this->aggregatePersonnellAndTrainingScore($record);
        // }
    }

    //section 1 (agreement_rate)
    private function getOverallAgreementsRate($orgUnit, $records)
    {

        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["agreement_rate"]);
        $monthScoreMap = $summationValues['monthScoreMap'];
        $rowsPerMonthAndScoreCounter = $summationValues['rowsPerMonthAndScoreCounter'];
        return $monthScoreMap;
    }

    private function getFileToProcess($projectId, $formId)
    {
        $filePath = "submissions/" . $projectId . "_" . $formId . "_submissions.csv.zip";
        return $filePath;
    }
}

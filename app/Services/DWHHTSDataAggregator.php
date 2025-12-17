<?php

namespace App\Services;

use App\DwhHtsEncounterData;
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

class DWHHTSDataAggregator
{
    private $reportSections = array();
    private $emrs = array();
    private $siteType = null;
    private $startDate = null;
    private $endDate = null;


    public function __construct()
    {
        $this->reportSections["agreement_rate"] = 1;
        $this->emrs = DB::table('dwh_hts_encounter_data')->distinct()->pluck('emr')->toArray();
        // replace emrs null or empty with 'Unknown'
        foreach ($this->emrs as $key => $emr) {
            if (empty($emr) || $emr == '') {
                $this->emrs[$key] = 'Unknown';
            }
        }
    }

    public function getSubmissions($orgUnitIds, $siteTypes, $startDate, $endDate)
    {
        $currentDate = new DateTime('now');

        $this->startDate = empty($startDate) ?  $currentDate->modify('-4 months')->format("Y-m-d") : $startDate;
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
                        $date = new DateTime($record['test_date']);
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
        try {
            $currentDate = new DateTime('now');

            $this->startDate = empty($startDate) ?  $currentDate->modify('-4 months')->format("Y-m-d") : $startDate;
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
        } catch (Exception $ex) {
            Log::error('<DWHHTSDataAggregator->getData() Error: ' . $ex->getMessage());
            Log::error($ex);
            Log::error('</DWHHTSDataAggregator->getData()');
            return null;
        }
    }

    private function aggregateAgreementRates($payload)
    {
        try {
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
                            foreach($this->emrs as $emr) {
                                $htsRegister[$emr] = 0;
                            }
                            // $htsRegister['ehts'] = 0;
                            // $htsRegister['hardcopy'] = 0;
                            // $monthlySites['emrs'] =   $this->emrs;
                            $monthlySites['hts_type'] =   $htsRegister;

                            $completnesScores = ['completness' => 0];
                            $consistencyScores = ['consistent' => 0];
                            $invalidRateScores = ['invalid_results_rate' => 0];

                            $invalidScores['invalids'] = 0;
                            $invalidScores['inconclusives'] = 0;
                            $invalidScores['totalTests'] = 0;

                            $scores['total_sites'] = 0;
                            $scores['total_tests'] = 0;
                            $monthlySites['totals'] = $scores;
                            $monthlySites['sitenames'] = [
                                '>98' => [],
                                '95-98' => [],
                                '<95' => [],
                            ];

                            $monthlySites['concordance_t1_reactive'] = 0;
                            $monthlySites['concordance_t2_reactive'] = 0;
                            $monthlySites['concordance_t3_reactive'] = 0;

                            $monthlySites['concordance-totals'] = 0;

                            // 3-test
                            $monthlySites['positive-agreement-rate-t3_t1'] = [
                                'avg' => 0,
                                '>98' => [
                                    'totals' => 0,
                                    'sites' => [],
                                    'avg' => 0,
                                ],
                                '95-98' => [
                                    'totals' => 0,
                                    'sites' => [],
                                    'avg' => 0,
                                ],
                                '<95' => [
                                    'totals' => 0,
                                    'sites' => [],
                                    'avg' => 0,
                                ],
                            ];
                            $monthlySites['positive-agreement-rate-t3_t2'] = [
                                'avg' => 0,
                                '>98' => [
                                    'totals' => 0,
                                    'sites' => [],
                                    'avg' => 0,
                                ],
                                '95-98' => [
                                    'totals' => 0,
                                    'sites' => [],
                                    'avg' => 0,
                                ],
                                '<95' => [
                                    'totals' => 0,
                                    'sites' => [],
                                    'avg' => 0,
                                ],
                            ];
                            $monthlySites['positive-agreement-rate-t2_t1'] = [
                                'avg' => 0,
                                '>98' => [
                                    'totals' => 0,
                                    'sites' => [],
                                    'avg' => 0,
                                ],
                                '95-98' => [
                                    'totals' => 0,
                                    'sites' => [],
                                    'avg' => 0,
                                ],
                                '<95' => [
                                    'totals' => 0,
                                    'sites' => [],
                                    'avg' => 0,
                                ],
                            ];

                            foreach ($monthlySites as $indicator => $site) { //sites per month -- sites in a month
                                try {
                                    //3-test = (t3_reactive + t1_non_reactive) / (t1_reactive + t1_non_reactive)
                                    $agreement = ($site['t3_reactive'] + $site['t1_non_reactive']) / ($site['t1_reactive'] + $site['t1_non_reactive']);

                                    $monthlySites['totals']['total_sites'] += 1;
                                    $monthlySites['totals']['total_tests'] += $site['t1_totals_tests'];
                                    $agreementRate = $agreement * 100;

                                    $monthlySites['concordance_t1_reactive'] += $site['t1_reactive'];
                                    $monthlySites['concordance_t2_reactive'] += $site['t2_reactive'];
                                    $monthlySites['concordance_t3_reactive'] += $site['t3_reactive'];

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
                                    $invalidScores['inconclusives'] += $site['inconclusives'];

                                    if ($agreementRate > 98) {
                                        $monthlySites['totals']['>98'] += 1;
                                        $monthlySites['sitenames']['>98'][] = $indicator;
                                    } else if ($agreementRate >= 95 && $agreementRate <= 98) {
                                        $monthlySites['totals']['95-98'] += 1;
                                        $monthlySites['sitenames']['95-98'][] = $indicator;
                                    } else if ($agreementRate < 95) {
                                        $monthlySites['totals']['<95'] += 1;
                                        $monthlySites['sitenames']['<95'][] = $indicator;
                                    }


                                    // Log::info(json_encode($site) . " site['t3_reactive'] = " . $site['t3_reactive'] );

                                    // 3-test positive agreement rates
                                    $t3_t1_pos_agreement = $site['t3_reactive'] *100 / $site['t1_reactive'];
                                    // Log::info("t3_t1_pos_agreement: " . $t3_t1_pos_agreement);
                                    $monthlySites['positive-agreement-rate-t3_t1']['avg'] = $t3_t1_pos_agreement;
                                    if ($t3_t1_pos_agreement > 98) {
                                        $monthlySites['positive-agreement-rate-t3_t1']['>98']['totals'] += 1;
                                        $monthlySites['positive-agreement-rate-t3_t1']['>98']['sites'][] = $indicator;
                                    } else if ($t3_t1_pos_agreement >= 95 && $t3_t1_pos_agreement <= 98) {
                                        $monthlySites['positive-agreement-rate-t3_t1']['95-98']['totals'] += 1;
                                        $monthlySites['positive-agreement-rate-t3_t1']['95-98']['sites'][] = $indicator;
                                    } else if ($t3_t1_pos_agreement < 95) {
                                        $monthlySites['positive-agreement-rate-t3_t1']['<95']['totals'] += 1;
                                        $monthlySites['positive-agreement-rate-t3_t1']['<95']['sites'][] = $indicator;
                                    }
                                    $t3_t2_pos_agreement = $site['t3_reactive'] *100 / $site['t2_reactive'];
                                    // Log::info("t3_t2_pos_agreement: " . $t3_t2_pos_agreement);
                                    $monthlySites['positive-agreement-rate-t3_t2']['avg'] = $t3_t2_pos_agreement;
                                    if ($t3_t2_pos_agreement > 98) {
                                        $monthlySites['positive-agreement-rate-t3_t2']['>98']['totals'] += 1;
                                        $monthlySites['positive-agreement-rate-t3_t2']['>98']['sites'][] = $indicator;
                                    } else if ($t3_t2_pos_agreement >= 95 && $t3_t2_pos_agreement <= 98) {
                                        $monthlySites['positive-agreement-rate-t3_t2']['95-98']['totals'] += 1;
                                        $monthlySites['positive-agreement-rate-t3_t2']['95-98']['sites'][] = $indicator;
                                    } else if ($t3_t2_pos_agreement < 95) {
                                        $monthlySites['positive-agreement-rate-t3_t2']['<95']['totals'] += 1;
                                        $monthlySites['positive-agreement-rate-t3_t2']['<95']['sites'][] = $indicator;
                                    }
                                    $t2_t1_pos_agreement = $site['t2_reactive'] *100 / $site['t1_reactive'];
                                    // Log::info("t2_t1_pos_agreement: " . $t2_t1_pos_agreement);
                                    $monthlySites['positive-agreement-rate-t2_t1']['avg'] = $t2_t1_pos_agreement;
                                    if ($t2_t1_pos_agreement > 98) {
                                        $monthlySites['positive-agreement-rate-t2_t1']['>98']['totals'] += 1;
                                        $monthlySites['positive-agreement-rate-t2_t1']['>98']['sites'][] = $indicator;
                                    } else if ($t2_t1_pos_agreement >= 95 && $t2_t1_pos_agreement <= 98) {
                                        $monthlySites['positive-agreement-rate-t2_t1']['95-98']['totals'] += 1;
                                        $monthlySites['positive-agreement-rate-t2_t1']['95-98']['sites'][] = $indicator;
                                    } else if ($t2_t1_pos_agreement < 95) {
                                        $monthlySites['positive-agreement-rate-t2_t1']['<95']['totals'] += 1;
                                        $monthlySites['positive-agreement-rate-t2_t1']['<95']['sites'][] = $indicator;
                                    }

                                    // $monthlySites['overall-positive-test-agreement'] = [
                                    //     't3_t1' => $t3_t1_pos_agreement,
                                    //     't3_t2' => $t3_t2_pos_agreement,
                                    //     't2_t1' => $t2_t1_pos_agreement,
                                    // ];


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
                                    // //if site uses ehts or hardcopy
                                    // $monthlySites['hts_type']['ehts'] += $site['register']['ehts'];
                                    // $monthlySites['hts_type']['hardcopy'] += $site['register']['hardcopy'];

                                    ///
                                    if($site['emr'] == null || $site['emr'] == '') {
                                        $site['emr'] = 'Unknown';
                                    }
                                    foreach($this->emrs as $emr) {
                                        if(strtolower($site['emr']) == strtolower($emr)) {
                                            if(!array_key_exists($emr, $monthlySites['hts_type'])) {
                                                $monthlySites['hts_type'][$emr] = 0;
                                            }
                                            $monthlySites['hts_type'][$emr] += 1;
                                        }
                                    }
                                    ///
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
                            //////////
                            $orgUnitArray['positive_agreement_rate_t3_t1'][$monthlyDate] = $monthlySites['positive-agreement-rate-t3_t1'];
                            $orgUnitArray['positive_agreement_rate_t3_t2'][$monthlyDate] = $monthlySites['positive-agreement-rate-t3_t2'];
                            $orgUnitArray['positive_agreement_rate_t2_t1'][$monthlyDate] = $monthlySites['positive-agreement-rate-t2_t1'];
                            //////////
                            $orgUnitArray['completeness'][$monthlyDate] = $completnesScores['completness'];
                            $orgUnitArray['consistency'][$monthlyDate] = $consistencyScores['consistent'];
                            $orgUnitArray['supervisory_signature'][$monthlyDate] = $monthlySites['supervisory_signature'];
                            $orgUnitArray['algorithm_followed'][$monthlyDate] = $monthlySites['algorithm_followed'];
                            $orgUnitArray['hts_type'][$monthlyDate] = $monthlySites['hts_type'];

                            //inconclusives
                            // $orgUnitArray['inconclusives'][$monthlyDate] = $invalidScores['inconclusives'];
                            $inconclusiveRate = 0;
                            try{
                                $den = $monthlySites['totals']['total_tests'] ?? $invalidScores['totalTests'];
                                if($den) $inconclusiveRate = ($invalidScores['inconclusives'] * 100) / $den;
                            } catch (Exception $ex) {
                                Log::error($ex);
                            }
                            $orgUnitArray['inconclusive_rates'][$monthlyDate] = number_format((float)$inconclusiveRate, 3, '.', '');

                            //invalid rates
                            $invlidRate = 0;
                            try {
                                $den = $monthlySites['totals']['total_tests'] ?? $invalidScores['totalTests'];
                                if($den) $invlidRate = ($invalidScores['invalids'] * 100) / $den;
                                // $invlidRate = number_format((float)$invlidRate, 1, '.', '');
                            } catch (Exception $ex) {
                                Log::error($ex);
                            }
                            $orgUnitArray['invalid_rates'][$monthlyDate] = number_format((float)$invlidRate, 3, '.', '');

                        }
                    } catch (Exception $ex) {
                        Log::error($ex);
                    }

                    $payld[$orgUnitKey] = $orgUnitArray;
                }
                $payload[$payldkey] = $payld;
            }
            return $payload;
        } catch (Exception $ex) {
            Log::error('<DWHHTSDataAggregator->aggregateAgreementRates() Error: ' . $ex->getMessage());
            Log::error($ex);
            Log::error('</DWHHTSDataAggregator->aggregateAgreementRates()');
            return null;
        }
    }

    //get scores for each organisation unit from rquest parameters
    private function getDataLoopOrgs($orgUnitIds, $recordsReadData)
    {
        try {
            $payload = array();
            for ($x = 0; $x < count($orgUnitIds); $x++) {
                try {
                    $odkUtils = new ODKUtils();
                    $orgMeta = $odkUtils->getOrgsByLevel($orgUnitIds[$x]);
                    $orgToProcess = $orgMeta[0];
                    $level = $orgMeta[1];

                    [$orgUnit,  $orgUnitName] = $odkUtils->getOrgUnitHierachyNames($orgToProcess, $level);
                    // Log::info("getDataLoopOrgs: orgUnitName: $orgUnitName, orgUnit: " . json_encode($orgUnit));


                    $orgUnit['org_unit_id'] = $orgUnitIds[$x];

                    $records = null;

                    if (array_key_exists($orgUnit['org_unit_id'], $recordsReadData)) {
                        // Log::info("getDataLoopOrgs: recordsReadData: " . json_encode(array_slice($recordsReadData, 0, 3)));
                        $records = $recordsReadData[$orgUnit['org_unit_id']];
                    } else {
                        $records = $this->getFormRecords($orgUnit) ?? [];
                        // Log::info("getDataLoopOrgs: records: " . count($records) . " orgUnit: " . json_encode($orgUnit));
                        $recordsReadData[$orgUnit['org_unit_id']] = $records;
                    }
                    $results = array();
                    $results["orgName"] = $orgUnitName;
                    $results["emrs"] = $this->emrs;

                    $results["overall_agreement_rate"] = $this->getOverallAgreementsRate($orgUnit, $records); //get per site sums/scores

                    $payload[$orgUnitIds[$x]] = $results;
                } catch (Exception $ex) {
                    Log::error($ex);
                }
            }
            return [$recordsReadData, $payload];
        } catch (Exception $ex) {
            Log::error('<DWHHTSDataAggregator->getDataLoopOrgs() Error: ' . $ex->getMessage());
            Log::error($ex);
            Log::error('</DWHHTSDataAggregator->getDataLoopOrgs()');
            return null;
        }
    }

    private function sumValues($record, $monthScoreMap, $rowsPerMonthAndScoreCounter, $section)
    {

        try {
            $dateValue = strtotime($record['test_date']);

            $yr = date("Y", $dateValue);
            $mon = date("m", $dateValue);
            $siteConcatName = trim($record['county']) . trim($record['sub_county']) . '___' . trim($record['facility_code']) . "_" . trim($record['facility_name']) . '__' . trim($record['Site'] ?? $record['entry_point']);
            $siteConcatName = str_replace('/', '_', $siteConcatName);
            $siteConcatName = str_replace(' ', '_', $siteConcatName);
            $siteConcatName = strtolower($siteConcatName);
            // Log::info("siteConcatName: " . $siteConcatName);

            if (!array_key_exists($siteConcatName, $monthScoreMap[$yr . '-' . $mon])) {
                // Log::info($record);
                $monthScoreMap[$yr . '-' . $mon][$siteConcatName] = array(
                    't1_reactive' => 0,
                    't1_non_reactive' => 0,
                    't2_reactive' => 0,
                    't3_reactive' => 0,
                    't1_non_reactive_totals' => 0,
                    't1_invalids' => 0,
                    't1_totals_tests' => 0,
                    'inconclusives' => 0,
                    'supervisory_signature' => array(),
                    'algorithm_followed' => array(),
                    'register' => array(
                        // 'ehts' => 0,
                        // 'hardcopy' => 0
                    ),
                    'emr' => $record['emr'] ?? null,

                );
            }
            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_reactive'] += (trim(strtolower($record['test_result1'])) == 'positive') ? 1 : 0;

            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_non_reactive'] += (trim(strtolower($record['test_result1'])) == 'negative') ? 1 : 0;

            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t2_reactive'] += (trim(strtolower($record['test_result2'])) == 'positive') ? 1 : 0;

            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t3_reactive'] += (trim(strtolower($record['test_result3'])) == 'positive') ? 1 : 0;

            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_invalids'] += (trim(strtolower($record['test_result1'])) == 'invalid') ? 1 : 0;

            // final_inconclusive
            // $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['inconclusives'] += (strtolower(trim($record['final_test_result'])) == 'inconclusive') ? 1 : 0;
            if(strtolower(trim($record['final_test_result'])) == 'inconclusive'){
                $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['inconclusives'] += 1;
            }

            $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_totals_tests'] += (
                trim(strtolower($record['test_result1'])) == 'positive' || trim(strtolower($record['test_result1'])) == 'negative' || trim(strtolower($record['test_result1'])) == 'invalid' ? 1 : 0);
            try {
                $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['t1_non_reactive_totals'] += (trim(strtolower($record['test_result3'])) == 'negative') ? 1 : 0;
            } catch (Exception $ex) {
            }
            // Log::info($siteConcatName . json_encode($monthScoreMap[$yr . '-' . $mon][$siteConcatName]) . PHP_EOL);

            //check if this site uses eHTS of Hardcopy
            // try {
            //     if ($record['emr'] != null) {
            //         $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['register']['ehts'] = 1;
            //     } else {
            //         $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['register']['hardcopy'] = 1;
            //     }
            // } catch (Exception $ex) {
            //     $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['register']['hardcopy'] = 1;
            // }

            //check data completeness for this site
            if (

                !empty(trim($record['emr'])) &&
                !empty(trim($record['entry_point'])) &&
                !empty(trim($record['test_kit_name1'])) &&
                !empty(trim($record['test_kit_lot_number1'])) &&
                !empty(trim($record['test_kit_expiry1'])) &&
                ((trim(strtolower($record['test_result2'])) == 'positive' || trim(strtolower($record['test_result2'])) == 'invalid') ?
                    (!empty(trim($record['test_kit_name2'])) && !empty(trim($record['test_kit_lot_number2'])) && !empty(trim($record['test_kit_expiry2']))) : true
                ) &&
                ((trim(strtolower($record['test_result3'])) == 'positive' || trim(strtolower($record['test_result3'])) == 'invalid') ?
                    (!empty(trim($record['test_kit_name3'])) && !empty(trim($record['test_kit_lot_number3'])) && !empty(trim($record['test_kit_expiry3']))) : true
                ) &&
                !empty(trim($record['test_result1'])) &&
                !empty(trim($record['final_test_result']))
            ) {
                $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['completeness'] = 1;
            } else {
                $monthScoreMap[$yr . '-' . $mon][$siteConcatName]['incompleteness'] = 1;
            }

            //check if supervisor signed or not signed
                array_push($monthScoreMap[$yr . '-' . $mon][$siteConcatName]['supervisory_signature'], 1);
            //end

            //check if supervisor signed or not signed
                array_push($monthScoreMap[$yr . '-' . $mon][$siteConcatName]['algorithm_followed'], 1);
            //end

            $rowsPerMonthAndScoreCounter[$yr . '-' . $mon] += 1;

            return [$monthScoreMap, $rowsPerMonthAndScoreCounter];
        } catch (Exception $ex) {
            Log::error($ex);
            Log::error('<DWHHTSDataAggregator->sumValues() Error: ' . $ex->getMessage());
            Log::error($ex);
            Log::error('</DWHHTSDataAggregator->sumValues()');
            // return [null, null];
            return null;
        }
    }

    private function processRecord($record, $monthScoreMap, $orgUnit, $rowsPerMonthAndScoreCounter, $rowCounter, $section)
    {
        // $record, $monthScoreMap, $orgUnit, $rowsPerMonthAndScoreCounter, $score, $rowCounter, $section

        if ($orgUnit['mysites_county'] == 'kenya' || empty($orgUnit['mysites_county'])) {
            // Log::info("processing kenya");
            $rowCounter = $rowCounter + 1; //no or rows processed/mathced for an org unit or units below it.

            $valueAccumulations = $this->sumValues($record, $monthScoreMap, $rowsPerMonthAndScoreCounter, $section);
            $monthScoreMap = $valueAccumulations[0];
            $rowsPerMonthAndScoreCounter = $valueAccumulations[1];
            //$score =  $this->callFunctionBysecition($section, $record);
        } else {
            // if ($this->stringMatches(strtolower($record['county']), strtolower($orgUnit['mysites_county']))) {
            if (trim(strtolower($record['county']) == trim(strtolower($orgUnit['mysites_county'])))) {
                // Log::info("facility 1 " . $orgUnit['mysites_county']);
                if (!empty($orgUnit['mysites_sub_county'])) {
                    if($this->stringMatches(strtolower($record['sub_county']), strtolower($orgUnit['mysites_sub_county']))) {

                        if (!empty($orgUnit['mysites_facility'])) {
                            $record_mfl = trim($record['facility_code']);
                            $orgUnit_mfl = explode("_", $orgUnit['mysites_facility'])[0];
                            if ($record_mfl == $orgUnit_mfl) {
                                if (!empty($orgUnit['mysites'])) {
                                    if ($this->stringMatches(strtolower($record['Site']), strtolower($orgUnit['mysites']))) {
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
        try {
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

            if (count($records) > 0) {
                foreach ($records as $record) {
                    $shouldProcessRecord = true; //filter out period of data not to be processed in the data loop

                    $recordDate = strtotime($record['test_date']);
                    $newRecordformat = date('Y-m-d', $recordDate);

                    $userStartDate = strtotime($this->startDate);
                    $newUserStartDate = date('Y-m-d', $userStartDate);

                    $userEndDate = strtotime($this->endDate);
                    $newUserEndDate = date('Y-m-d', $userEndDate);

                    if ($newUserStartDate > $newRecordformat ||  $newRecordformat > $newUserEndDate) {

                        $shouldProcessRecord = false;
                    }


                    if (
                        (isset($this->siteType) && substr(trim(strtolower($record['Site'])), 0, strlen($this->siteType)) != $this->siteType)
                    ) {
                        $shouldProcessRecord = false;
                    }

                    if ($shouldProcessRecord) {
                        [$record, $monthScoreMap, $orgUnit, $rowsPerMonthAndScoreCounter, $rowCounter, $section] = //$section not in use, assume it
                            $this->processRecord($record, $monthScoreMap, $orgUnit, $rowsPerMonthAndScoreCounter, $rowCounter, $section);
                    }
                }
            } else {
                // throw new Exception("No records found");
                Log::error("No records found");
            }

            $results = array();

            $results['rowsPerMonthAndScoreCounter'] = $rowsPerMonthAndScoreCounter;
            $results['monthScoreMap'] = $monthScoreMap;
            return $results;
        } catch (Exception $ex) {
            Log::error('<DWHHTSDataAggregator->getSummationValues() Error: ' . $ex->getMessage());
            Log::error($ex);
            Log::error('</DWHHTSDataAggregator->getSummationValues()');
            return array();
        }
    }

    private function getFormRecords($orgUnit)
    {
        // Filter for subnational levels (county, sub_county, partner, etc.)
        $data = $this->getRawData();
        // Log::info("getFormRecords: orgunit: " . json_encode($orgUnit));
        // Log::info("getFormRecords: data0: " . gettype($data[0]));
        // Log::info("getFormRecords: data: " . json_encode(array_slice(array_filter($data, function($record){
        //     return $record['county'] == "Kiambu";
        // }), 0, 5)));

        $levelObj = OdkOrgunit::where('org_unit_id', $orgUnit['org_unit_id'])->first() ?? ['level' => '1'];
        // Log::info("getFormRecords: orgUnit: " . json_encode($orgUnit));
        // Log::info("getFormRecords: level: " . json_encode($levelObj));
        $level = $levelObj->level ?? '1';
        $ou_name = $levelObj->odk_unit_name ?? '1';
        $fileName = null;
        $combinedRecords = [];
        if ($level == 1) {
            // $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
            // ->where('form_id', 'like', "hts%") // for spi data
            // ->get();
            // foreach ($submissionOrgUnitmap as $mapping) {
            //     $projectId = $mapping->project_id;
            //     $formId = $mapping->form_id;
            //     $fileName = $this->getFileToProcess($projectId, $formId);
            //     $perCountyRecords = $this->getSingleFileRecords($fileName, $formId);
            //     if ($perCountyRecords) {
            //         $combinedRecords = array_merge($combinedRecords, $perCountyRecords);
            //     }
            // }

            /////////////
            $combinedRecords = $data;
            /////////////
        } else if ($level == 2) {
            // $odkUtils = new ODKUtils();
            // [$projectId, $formId] = $odkUtils->getFormFormdProjectIds($orgUnit, "hts%");
            // $fileName = $this->getFileToProcess($projectId, $formId);
            // return $this->getSingleFileRecords($fileName, $formId);

            /////////////
            try {
                // convert $data (object) to array
                if (is_object($data)) {
                    $data = get_object_vars($data);
                }
                $combinedRecords = array_filter($data, function ($record) use ($ou_name) {
                    // return trim(strtolower($record['county'])) == trim(strtolower($ou_name));
                    $a = strtolower($record['county']); $b = strtolower($ou_name);
                    similar_text($a, $b, $percent);
                    if ($percent >= 70) return true;
                    $lev = levenshtein($a, $b);
                    return $lev < 4;
                });
            } catch (Exception $ex) {
                Log::error("getFormRecords: level 2 error: " . $ex->getMessage());
                Log::error($ex);
                return [];
            }
            // Log::info("getFormRecords: level 2: $ou_name = " . count($combinedRecords));
            /////////////
        } else {
            // $odkUtils = new ODKUtils();
            // [$projectId, $formId] = $odkUtils->getFormFormdProjectIds($orgUnit, "hts%");
            // $fileName = $this->getFileToProcess($projectId, $formId);
            // return $this->getSingleFileRecords($fileName, $formId);

            /////////////
            $combinedRecords = array_filter($data, function ($record) use ($ou_name) {
                // return trim(strtolower($record['county'])) == trim(strtolower($ou_name));
                $a = strtolower(trim($record['facility_code'] . "_" . $record['facility_name']));
                $a = str_replace('/', '_', $a);
                $a = str_replace(' ', '_', $a);
                $b = strtolower($ou_name);
                similar_text($a, $b, $percent);
                if ($percent >= 70) return true;
                $lev = levenshtein($a, $b);
                return $lev < 4;
            });
            /////////////
            Log::info("getFormRecords: level 3+: $ou_name = " . count($combinedRecords));
        }

        return $combinedRecords;
    }

    public function getRawData($limit = null)
    {
        $data = DwhHtsEncounterData::orderBy('test_date', 'desc')
            // ->limit($limit)
            ->get();
        return $this->standardizeData($data);
    }

    private function standardizeData($records)
    {
        $siteTypes = ['CCC', 'PMTCT', 'VCT', 'OPD', 'LAB', 'PITC', 'IPD', 'VMMC', 'PSC/CCC', 'PAEDIATRIC', 'COMMUNITY_TESTING'];
        foreach ($records as $key => $row) {
            $row['Site'] = trim(strtoupper($row['entry_point']));
            if (!in_array($row['Site'], $siteTypes)) {
                if (str_contains($row['Site'], 'PMTCT')) {
                    $records[$key]['Site'] = 'PMTCT';
                } else if (str_contains($row['Site'], 'VCT')) {
                    $records[$key]['Site'] = 'VCT';
                } else if (
                    str_contains($row['Site'], 'OPD') ||
                    str_contains($row['Site'], 'OUT PATIENT') ||
                    str_contains($row['Site'], 'OUTPATIENT') ||
                    str_contains($row['Site'], 'EMERGENCY') ||
                    str_contains($row['Site'], 'NUTRITION') ||
                    str_contains($row['Site'], 'OTHER') ||
                    str_contains($row['Site'], 'GBV') ||
                    str_contains($row['Site'], 'STI CLINIC') ||
                    str_contains($row['Site'], 'TB CLINIC')
                ) {
                    $records[$key]['Site'] = 'OPD';
                } else if (str_contains($row['Site'], 'LAB')) {
                    $records[$key]['Site'] = 'LAB';
                } else if (str_contains($row['Site'], 'PITC')) {
                    $records[$key]['Site'] = 'PITC';
                } else if (
                    str_contains($row['Site'], 'IN PATIENT') ||
                    str_contains($row['Site'], 'INPATIENT') ||
                    str_contains($row['Site'], 'IPD')
                ) {
                    $records[$key]['Site'] = 'IPD';
                } else if (str_contains($row['Site'], 'VMMC')) {
                    $records[$key]['Site'] = 'VMMC';
                } else if (
                    str_contains($row['Site'], 'CCC') ||
                    str_contains($row['Site'], 'PSC')
                ) {
                    $records[$key]['Site'] = 'PSC/CCC';
                } else if (
                    str_contains($row['Site'], 'PEADIATRIC') ||
                    str_contains($row['Site'], 'PEDIATRIC') ||
                    str_contains($row['Site'], 'PAEDIATRIC')
                ) {
                    $records[$key]['Site'] = 'PEDIATRIC';
                } else if (
                    str_contains($row['Site'], 'COMMUNITY') ||
                    str_contains($row['Site'], 'MOBILE') ||
                    str_contains($row['Site'], 'HBTC')
                ) {
                    $records[$key]['Site'] = 'COMMUNITY_TESTING';
                }


                // // if $row['Site'] is not in siteTypes, look for closest match
                // $closestSite = null;
                // $minDistance = 100;
                // foreach ($siteTypes as $siteType) {
                //     $distance = levenshtein($row['Site'], $siteType);
                //     if ($distance < $minDistance) {
                //         $closestSite = $siteType;
                //         $minDistance = $distance;
                //     }
                // }
                // $records[$key]['Site'] = $closestSite;
            }
        }
        return $records;
    }

    //section 1 (agreement_rate)
    private function getOverallAgreementsRate($orgUnit, $records)
    {
        // Log::info("getOverallAgreementsRate: recordstype: " . gettype($records));
        // Log::info("getOverallAgreementsRate: records: " . json_encode(array_slice($records, 0, 3)));

        try {
            $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["agreement_rate"]);
            $monthScoreMap = $summationValues['monthScoreMap'];
            $rowsPerMonthAndScoreCounter = $summationValues['rowsPerMonthAndScoreCounter'];
            return $monthScoreMap;
        } catch (Exception $e) {
            Log::error("getOverallAgreementsRate: " . $e->getMessage());
            Log::error($e);
            return [];
        }
    }

    private function getFileToProcess($projectId, $formId)
    {
        $filePath = "submissions/" . $projectId . "_" . $formId . "_submissions.csv.zip";
        return $filePath;
    }


    public function stringMatches($a, $b, $threshold = 70) {
        similar_text(strtolower($a), strtolower($b), $percent);
        if ($percent >= $threshold) return true;

        $lev = levenshtein(strtolower($a), strtolower($b));
        return $lev < 4; // small edit distance
    }
}

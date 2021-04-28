<?php

namespace App\Services;

use Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use App\FormSubmissions;
use App\OdkProject;
use Illuminate\Support\Arr;
use League\Csv\Reader;
use League\Csv\Statement;
use PhpParser\Node\Stmt\Continue_;

class ODKDataAggregator
{
    private $reportSections = array();

    public function __construct()
    {
        $this->reportSections["personnel_training_and_certification"] = 1;
        $this->reportSections["QA_counselling"] = 2;
        $this->reportSections["physical_facility"] = 3;
        $this->reportSections["safety"] = 4;
    }


    public function getData($orgUnitId, $formType)
    {
        $orgUnit = array();
        $orgUnit['mysites_county'] = 'bungoma';
        $orgUnit['mysites_subcounty'] = 'webuye_west';
        $orgUnit['mysites_facility'] = '15965__friends_lugulu_mission_hospital';
        // $orgUnit['mysites'] = 'opd';

        $this->getPersonellTrainingAndCertification($orgUnit);
        $this->getQACounselling($orgUnit);
        $this->getPhysicalFacility($orgUnit);
        $this->getSafety($orgUnit);
    }

    private function getSummationValues($records, $orgUnit, $section)
    {
        $rowCounter = 0;
        $score = 0;
        foreach ($records as $record) {

            $record["Section-Section1-providers_undergone_training"];

            if (!empty($orgUnit['mysites_county'])) {
                if ($record['mysites_county'] == $orgUnit['mysites_county']) {
                    if (!empty($orgUnit['mysites_subcounty'])) {
                        if ($record['mysites_subcounty'] == $orgUnit['mysites_subcounty']) {
                            if (!empty($orgUnit['mysites_facility'])) {
                                if ($record['mysites_facility'] == $orgUnit['mysites_facility']) {
                                    if (!empty($orgUnit['mysites'])) {
                                        if ($record['mysites'] == $orgUnit['mysites']) {
                                            $score =  $this->callFunctionBysecition($section, $record) + $score;
                                            $rowCounter = $rowCounter + 1;
                                        }
                                    } else {
                                        $score =  $this->callFunctionBysecition($section, $record)  + $score;
                                        $rowCounter = $rowCounter + 1;
                                    }
                                }
                            } else {
                                $score =  $this->callFunctionBysecition($section, $record)  + $score;
                                $rowCounter = $rowCounter + 1;
                            }
                        }
                    } else {
                        $score =  $this->callFunctionBysecition($section, $record)  + $score;
                        $rowCounter = $rowCounter + 1;
                    }
                }
            }
        }
        $results = array();
        $results['rowCounter'] = $rowCounter;
        $results['score'] = $score;
        return $results;
    }

    private function getFormRecords()
    {
        $url = "";
        if (Storage::exists("submissions/17_spi_checklist_bungoma_submissions.csv")) {
            $url = Storage::path("submissions/17_spi_checklist_bungoma_submissions.csv");
        } else {
            return 0;
        }
        $csv = Reader::createFromPath($url, 'r');
        $csv->setHeaderOffset(0); //set the CSV header offset
        $stmt = Statement::create();
        $records = $stmt->process($csv);
        return $records;
    }

    private function callFunctionBysecition($section, $record)
    {
        if ($section == $this->reportSections["personnel_training_and_certification"]) {
            return $this->aggregatePersonnellAndTrainingScore($record);
        } else if ($section == $this->reportSections["QA_counselling"]) {
            return $this->aggregateQACounsellingScore($record);
        } else if ($section == $this->reportSections["physical_facility"]) {
            return $this->aggregatePhysicalFacilityScore($record);
        } else if ($section == $this->reportSections["safety"] = 4) {
            return $this->aggregateSafetyScore($record);
        }
    }

    //section 1 (Personnel Training & Certification)
    private function getPersonellTrainingAndCertification($orgUnit)
    {
        $records = $this->getFormRecords();
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["personnel_training_and_certification"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        print_r("raw score = " . $score . "\n");
        $score = ($score / ($rowCounter * 3)) * 100; //get denominator   
        $score = number_format((float)$score, 1, '.', ',');
        print_r("Personnel Training & Certification rowCounter = " . $rowCounter . "\n");
        print_r("Personnel Training & Certification score = " . $score . "\n");
    }

    private function aggregatePersonnellAndTrainingScore($record)
    {
        $sec1_1 = $record["Section-Section1-providers_undergone_training"];
        $sec1_2 = $record["Section-Section1-training_certificates_available"];
        $sec1_3 = $record["Section-Section1-refresher_training"];
        $score = $sec1_1 + $sec1_2 + $sec1_3;
        return $score;
    }


    //section 2 (QA in Counselling)
    private function getQACounselling($orgUnit)
    {
        $records = $this->getFormRecords();
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["QA_counselling"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        print_r("raw score = " . $score . "\n");
        $score = ($score / ($rowCounter * 6)) * 100; //get denominator   
        $score = number_format((float)$score, 1, '.', ',');
        print_r("QA in Counselling rowCounter = " . $rowCounter . "\n");
        print_r("QA in Counselling score = " . $score . "\n");
    }

    private function aggregateQACounsellingScore($record)
    {
        $sec2_1 = $record["Section-Section2-attended_support_supervision"];
        $sec2_2 = $record["Section-Section2-provider_self_assessment"];
        $sec2_3 = $record["Section-Section2-client_satisfaction_survey_done"];
        $sec2_4 = $record["Section-Section2-observed_practice"];
        $sec2_5 = $record["Section-Section2-scmlcsupport"];
        $sec2_6 = $record["Section-Section2-cmlcsupport"];
        $score = $sec2_1 + $sec2_2 + $sec2_3 + $sec2_4 + $sec2_5 + $sec2_6;

        return $score;
    }

    //section 3 (Physical Facility)
    private function getPhysicalFacility($orgUnit)
    {
        $records = $this->getFormRecords();
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["physical_facility"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        print_r("raw score = " . $score . "\n");
        $score = ($score / ($rowCounter * 6)) * 100; //get denominator   
        $score = number_format((float)$score, 1, '.', ',');
        print_r("Physical Facility rowCounter = " . $rowCounter . "\n");
        print_r("Physical Facility score = " . $score . "\n");
    }

    private function aggregatePhysicalFacilityScore($record)
    {
        $sec3_1 = $record["Section-Section3-HIV_testing_area"];
        $sec3_2 = $record["Section-Section3-sufficient_space"];
        $sec3_3 = $record["Section-Section3-confidentiality"];
        $sec3_4 = $record["Section-Section3-clean_testing_area"];
        $sec3_5 = $record["Section-Section3-sufficient_lighting"];
        $sec3_6 = $record["Section-Section3-secure_storage"];
        $score = $sec3_1 + $sec3_2 + $sec3_3 + $sec3_4 + $sec3_5 + $sec3_6;

        return $score;
    }


    //section 4 (Safety)
    private function getSafety($orgUnit)
    {
        $records = $this->getFormRecords();
        $summationValues = $this->getSummationValues($records, $orgUnit, $this->reportSections["safety"]);
        $score = $summationValues['score'];
        $rowCounter = $summationValues['rowCounter'];
        print_r("raw score = " . $score . "\n");
        $score = ($score / ($rowCounter * 6)) * 100; //get denominator   
        $score = number_format((float)$score, 1, '.', ',');
        print_r("Safety rowCounter = " . $rowCounter . "\n");
        print_r("Safety score = " . $score . "\n");
    }

    private function aggregateSafetyScore($record)
    {
        $sec4_1 = $record["Section-Section4-running_water"];
        $sec4_2 = $record["Section-Section4-soap"];
        $sec4_3 = $record["Section-Section4-wastesegregationfacility"];
        $sec4_4 = $record["Section-Section4-segregationonsite"];
        $sec4_5 = $record["Section-Section4-pep_protocols"];
        $sec4_6 = $record["Section-Section4-pep_protocols_followed"];
        $score = $sec4_1 + $sec4_2 + $sec4_3 + $sec4_4 + $sec4_5 + $sec4_6;

        return $score;
    }
}

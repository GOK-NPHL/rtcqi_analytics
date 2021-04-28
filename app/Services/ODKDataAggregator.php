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

    public function __construct()
    {
    }

    public function getData($orgUnitId, $formType)
    {
        $orgUnit = array();
        $orgUnit['mysites_county'] = 'bungoma';
        $orgUnit['mysites_subcounty'] = 'sirisia';
        $orgUnit['mysites_facility'] = '15861_friends_chwele_mission_dispensary';
        // $orgUnit['mysites'] = 'opd';

        $this->getPersonellTrainingAndCertification($orgUnit);
    }

    private function getPersonellTrainingAndCertification($orgUnit)
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
                                            $score =  $this->aggregatePersonnellAndTrainingScore($record) + $score;
                                            $rowCounter = $rowCounter + 1;
                                        }
                                    } else {
                                        $score =  $this->aggregatePersonnellAndTrainingScore($record) + $score;
                                        $rowCounter = $rowCounter + 1;
                                    }
                                }
                            } else {
                                $score =  $this->aggregatePersonnellAndTrainingScore($record) + $score;
                                $rowCounter = $rowCounter + 1;
                            }
                        }
                    } else {
                        $score =  $this->aggregatePersonnellAndTrainingScore($record) + $score;
                        $rowCounter = $rowCounter + 1;
                    }
                }
            }
        }
        print_r("raw score = " . $score . "\n");
        $score = ($score / ($rowCounter * 3)) * 100; //get denominator   
        $score = number_format((float)$score, 1, '.', ',');
        print_r("rowCounter = " . $rowCounter . "\n");
       
        print_r("score = " . $score . "\n");
    }

    private function aggregatePersonnellAndTrainingScore($record)
    {
        $sec1_1 = $record["Section-Section1-providers_undergone_training"];
        $sec1_2 = $record["Section-Section1-providers_undergone_training"];
        $sec1_3 = $record["Section-Section1-refresher_training"];
        $score = $sec1_1 + $sec1_2 + $sec1_3;
        return $score;
    }
}

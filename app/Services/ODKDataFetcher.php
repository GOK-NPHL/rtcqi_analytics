<?php

namespace App\Services;

use Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

use App\FormSubmissions;

use App\OdkProject;


class ODKDataFetcher
{

    // private $baseOdkUrl = 'https://172.16.0.82/v1/';
    private $baseOdkUrl = 'https://odk.nphl.go.ke/v1/';

    public function __construct()
    {
        echo ("construct function was initialized.\n");
    }

    public function fetchData()
    {
        $autUrl = $this->baseOdkUrl . "sessions";
        $response = Http::withOptions([
            'verify' => false, //'debug' => true
        ])->post($autUrl, [
            'email' => config('app.odk_user'),
            'password' => config('app.odk_pass'),
        ]);
        $projectList = $this->getProjectLists($response);
        $projectToFormsMap = array();
        for ($count = 0; $count < count($projectList); $count++) {
            $projectId = $projectList[$count]['id'];
            $forms = $this->getProjectForm($response, $projectId);
            if (count($forms) > 0) {
                if (count($forms) > 0)
                    $projectToFormsMap["$projectId"] = $forms;
            }
        }
        // print_r($projectToFormsMap);
        $this->getFormSubmissions($response, $projectToFormsMap);
    }

    private function getProjectLists($response)
    {
        $listUserUrl = $this->baseOdkUrl . "projects";

        $response = Http::withOptions([
            'verify' => false, //'debug' => true
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
        ])->get($listUserUrl);
        $res = $response->json();
        // print_r($res);

        foreach ($res as $key => $arrayValue) {

            $odkProject = DB::table('odk_project')
                ->where('project_id', '=', $arrayValue['id'])
                ->where('project_name', '=', $arrayValue['name'])
                ->get();
            if (count($odkProject) == 0) {
                $odkProject = new OdkProject;
                $odkProject->project_id = $arrayValue['id'];
                $odkProject->project_name = $arrayValue['name'];
                $odkProject->no_of_forms = 0;
                $odkProject->save();
            }
        }
        return $res;
    }

    private function getProjectForm($response, $projectId)
    {
        $formUrl = $this->baseOdkUrl . "projects/" . $projectId . "/forms";
        $response = Http::withOptions([
            'verify' => false, //'debug' => true
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
        ])->get($formUrl);
        $res = $response->json();
        // print_r($res);
        return $res;
    }


    private function getFormSubmissions($response, $projectToFormsMap)
    { //  print_r($projectToFormsMap);

        foreach ($projectToFormsMap as $projectId => $arrayValue) {
            $formSubmissionsUrl = $this->baseOdkUrl . "projects/" . $projectId . "/forms/#formid/submissions.csv";


            for ($counter = 0; $counter < count($arrayValue); $counter++) {
                // print_r($arrayValue[$counter]);
                $formId = $arrayValue[$counter]['xmlFormId'];
                if ($formId == "hts_register_bungoma") {
                    print_r("hts_register_bungoma\n");
                } else if ($formId == "spi_checklist_bungoma") {
                    $formSubmissionsUrl = str_replace('#formid', $formId, $formSubmissionsUrl);
                    print_r("spi_checklist_bungoma\n");
                    $this->downloadFormSubmissions($response, $formSubmissionsUrl);
                } else {

                    //print_r("form id $formId not found in list");
                }
            }

            //return $res;
        }
    }

    private function downloadFormSubmissions($response, $formSubmissionsUrl)
    {
        $this->compareSubmissionData();

        // $response = Http::withOptions([
        //     'verify' => false, 'debug' => true,
        //     'sink' => storage_path('submissions.csv')
        // ])->withHeaders([
        //     'Authorization' => 'Bearer ' . $response['token'],
        // ])->get($formSubmissionsUrl);

        // $res = $response->json();
        //print_r($res);
    }

    private function compareSubmissionData()
    {
        $formSubmissions = FormSubmissions::all();

        foreach ($formSubmissions as $formSubmission) {
            echo $formSubmission->lastest_submission_date;
        }
    }
}

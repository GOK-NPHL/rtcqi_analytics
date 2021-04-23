<?php

namespace App\Services;

use Config;
use Illuminate\Support\Facades\Http;


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
        print_r(config('app.odk_user'));
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

    //Return
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
            print_r($arrayValue);
            $formSubmissionsUrl = $this->baseOdkUrl . "projects/" . $projectId . "/forms" . $arrayValue['xmlFormId'] . "submissions.csv";
            $response = Http::withOptions([
                'verify' => false, //'debug' => true
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $response['token'],
            ])->get($formSubmissionsUrl);
            $res = $response->json();
            print_r($res);
            //return $res;
        }

        // xmlFormId
        // v1/projects/projectId/forms/xmlFormId/submissions.csv
    }
}

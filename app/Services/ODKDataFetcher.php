<?php

namespace App\Services;

use Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
            $projectName = $projectList[$count]['name'];
            $forms = $this->getProjectForm($response, $projectId);

            $currentNoOfForms = DB::table('odk_project')
                ->where('project_id', '=', $projectId)
                ->where('project_name', '=', $projectName)
                ->value('no_of_forms');

            if (count($forms) > 0) {
                if (count($forms) > 0)
                    $projectToFormsMap["$projectId"] = array();
                $projectToFormsMap["$projectId"]["forms"] = $forms;
                $projectToFormsMap["$projectId"]["cur_no"] = $currentNoOfForms;
            }
        }
        $this->getFormSubmissions($response, $projectToFormsMap);
    }

    private function updateOdkProjectDetails($value)
    {
        // foreach ($res as $key => $arrayValue) {
        $odkProject = DB::table('odk_project')
            ->where('project_id', '=', $value['id'])
            ->where('project_name', '=', $value['name'])
            ->get();
        if (count($odkProject) == 0) {
            $odkProject = new OdkProject;
            $odkProject->project_id = $value['id'];
            $odkProject->project_name = $value['name'];
            $odkProject->no_of_forms = 0;
            $odkProject->save();
        }
        // }
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
        return $res;
    }


    private function getFormSubmissions($response, $projectToFormsMap)
    {  
        foreach ($projectToFormsMap as $projectId => $arrayValue) {

            $formSubmissionsUrl = $this->baseOdkUrl . "projects/" . $projectId . "/forms/#formid/submissions.csv";

            for ($counter = 0; $counter < count($arrayValue["forms"]); $counter++) {
                // print_r($arrayValue[$counter]);
                $formId = $arrayValue["forms"][$counter]['xmlFormId'];
                $formSubmissionsUrl = str_replace('#formid', $formId, $formSubmissionsUrl);
                if ($this->shouldDownloadSubmission($response, $projectId, $formId)) {
                    print_r("Downloading $formId form\n");
                    $this->downloadFormSubmissions($response, $projectId, $formId, $formSubmissionsUrl);
                }
            }

            //return $res;
        }
    }

    //check if there is new submissions on form
    private function shouldDownloadSubmission($response, $projectId, $formId)
    {
        $formSubmissionsDetails =  $this->baseOdkUrl . "projects/" . $projectId . "/forms/$formId";
        $response = Http::withOptions([
            'verify' => false, //'debug' => true
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
            'X-Extended-Metadata' => 'true',
        ])->get($formSubmissionsDetails);
        $res = $response->json();

        $submission = $this->getFormSubmission($projectId, $formId);
        $lastSubmissionDt = strtotime($res["lastSubmission"]);
        $lastSubmissionDate = date('Y-m-d h:i:s', $lastSubmissionDt);
        if (!$submission) {
            $submission = new FormSubmissions;
            $submission->project_id = $projectId;
            $submission->form_id = $formId;
            $submission->lastest_submission_date = $lastSubmissionDate;
            $submission->no_of_submissions =  $res["submissions"];
            $submission->org_id =  1;
            $submission->save();
            if($res["submissions"]>0){
                return true;
            }else{
                return false;
            }
            
        } else if ($submission->lastest_submission_date != $lastSubmissionDate && $res["submissions"]>0) {
            $submission->lastest_submission_date = $lastSubmissionDate;
            $submission->no_of_submissions = $res["submissions"];
            $submission->save();
            return true;
        } else {
            // print_r(" No action to take \n ");
            // print_r($submission->lastest_submission_date == $lastSubmissionDate);
            // print_r("\n");
        }
        return false;
    }

    private function getFormSubmission($projectId, $formId)
    {
        $submission = FormSubmissions::where('project_id', '=', $projectId)
            ->where('form_id', '=', $formId)
            ->first();
        return $submission;
    }

    private function downloadFormSubmissions($response, $projectId, $formId, $formSubmissionsUrl)
    {
        
        try {
            Storage::delete("/app/submissions/".$projectId."_".$formId."_".'submissions.csv');
          }catch(Exception $e) {
            echo 'Message: ' .$e->getMessage();
          }
        $response = Http::withOptions([
            'verify' => false, //'debug' => true,
            'sink' => storage_path("/app/submissions/".$projectId."_".$formId."_".'submissions.csv')
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
        ])->get($formSubmissionsUrl);

        // $res = $response->json();
    }

}

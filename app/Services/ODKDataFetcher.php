<?php

namespace App\Services;

use Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

use App\FormSubmissions;
use App\OdkOrgunit;
use App\OdkProject;
use App\OrgunitLevelMap;
use Exception;
use Illuminate\Support\Facades\Log;

class ODKDataFetcher
{

    // private $baseOdkUrl = 'https://172.16.0.82/v1/';
    private $baseOdkUrl = 'https://odk.nphl.go.ke/v1/';

    public function __construct()
    {
        echo ("construct function was initialized on ". date('l jS \of F Y h:i:s A') .".\n");
        // if ODK_URL is set in environment variables, use it
        if (env('ODK_URL')) {
            $this->baseOdkUrl = env('ODK_URL');
        }
    }

    public function fetchData()
    {   Log::info("start fetching odk files");
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

        $res = Http::withOptions([
            'verify' => false, //'debug' => true
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
        ])->get($listUserUrl);
        $res = $res->json();
        return $res;
    }

    private function getProjectForm($response, $projectId)
    {
        $formUrl = $this->baseOdkUrl . "projects/" . $projectId . "/forms";
        $res = Http::withOptions([
            'verify' => false, //'debug' => true
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
        ])->get($formUrl);
        $res = $res->json();
        return $res;
    }


    private function getFormSubmissions($response, $projectToFormsMap)
    {
        foreach ($projectToFormsMap as $projectId => $arrayValue) {

            for ($counter = 0; $counter < count($arrayValue["forms"]); $counter++) {
                $formSubmissionsUrl = $this->baseOdkUrl . "projects/" . $projectId . "/forms/#formid/submissions.csv";
                // print_r($arrayValue[$counter]);
                $formId = $arrayValue["forms"][$counter]['xmlFormId'];
                $formSubmissionsUrl = str_replace('#formid', $formId, $formSubmissionsUrl);
                echo("getFormSubmissions:: running getFormSubmissions for formId ".$formId."\n");
                if ($formId != null) {
                //if($this->shouldDownloadSubmission($response, $projectId, $formId)) {
                    $shouldDl = $this->shouldDownloadSubmission($response, $projectId, $formId);
                    if ($shouldDl == true) {
                        echo("getFormSubmissions:: shouldDl = true, Downloading form submissions for form id: " . $formId . "\n");
                        $this->downloadFormSubmissions($response, $projectId, $formId, $formSubmissionsUrl);
                    }else{
                        echo("getFormSubmissions:: shouldDl = false, Skipping form submissions for form id: " . $formId . "\n");
                        $this->downloadFormSubmissions($response, $projectId, $formId, $formSubmissionsUrl);
                    }
                }else{
                    echo("getFormSubmissions:: this->shouldDownloadSubmission(response, projectId, formId) returned false\n");
                }
            }

            //return $res;
        }
    }

    //check if there is new submissions on form
    private function shouldDownloadSubmission($response, $projectId, $formId)
    {


        $formSubmissionsDetails =  $this->baseOdkUrl . "projects/" . $projectId . "/forms/$formId";
        $res = Http::withOptions([
            'verify' => false, //'debug' => true
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
            'X-Extended-Metadata' => 'true',
        ])->get($formSubmissionsDetails);
        $res = $res->json();

        $submission = $this->getFormSubmission($projectId, $formId);
        $lastSubmissionDt = strtotime($res["lastSubmission"]);
        $lastSubmissionDate = date('Y-m-d h:i:s', $lastSubmissionDt);
        if (!$submission) {
            try {
                $this->downloadFormOrgunitCascades($response, $projectId, $formId);
                $orgUnitId = $this->getOrgunitIdOfsubmmission($response, $projectId, $formId);
                if (empty($orgUnitId)){
                    echo("Org unit for form id " . $formId . " not found in organisation structure \n");
                    throw new Exception("Org unit for form id " . $formId . " not found in organisation structure");
                }
                $formSubmission = new FormSubmissions;
                $formSubmission->project_id = $projectId;
                $formSubmission->form_id = $formId;
                $formSubmission->lastest_submission_date = $lastSubmissionDate;
                $formSubmission->no_of_submissions =  $res["submissions"];
                $formSubmission->org_id =  $orgUnitId;
                echo("saving form submission for project id " . $projectId . " and form id " . $formId . "\n");
                $formSubmission->save();
                if ($res["submissions"] > 0) {
                    echo("shouldDownloadSubmission -> returning TRUE for project id " . $projectId . " and form id " . $formId . "\n");
                    return true;
                } else {
                    echo("shouldDownloadSubmission -> returning false for project id " . $projectId . " and form id " . $formId . "\n");
                    return false;
                }
            } catch (Exception $ex) {
                Log::error(" error =====>shouldDownloadSubmission() " . $ex->getMessage() . " \n");
                Log::error($ex);
                return false;
            }
        } else if ($submission->lastest_submission_date != $lastSubmissionDate && $res["submissions"] > 0) {
            echo('$submission->lastest_submission_date != $lastSubmissionDate && $res["submissions"] > 0 \n');
            $submission->lastest_submission_date = $lastSubmissionDate;
            $submission->no_of_submissions = $res["submissions"];
            echo("-saving form submission for project id " . $projectId . " and form id " . $formId . "\n");
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
        //delete previous downloade data
        Log::info("downloadFormSubmissions:: delete any previous downloads for " . $formId);
        try {
            Storage::delete("app/submissions/" . $projectId . "_" . $formId . "_" . 'submissions.csv');
        } catch (Exception $e) {
            Log::error($e);
            echo 'downloadFormSubmissions:: Error deleting previous submissions for : ' .$formId. ', Message: ' . $e->getMessage();
        }

        try {
            Storage::delete("app/submissions/" . $projectId . "_" . $formId . "_" . 'submissions.csv.zip');
        } catch (Exception $e) {
            Log::error($e);
            echo 'downloadFormSubmissions:: Error deleting previous submissions.csv.zip for : ' .$formId. ', Message: ' . $e->getMessage();
        }

        Log::info("downloadFormSubmissions:: downloading new submissions for " . $formId . ", project " . $projectId . ", from " . $formSubmissionsUrl);

        Http::withOptions([
            'verify' => false, //'debug' => true,
            'sink' => storage_path("app/submissions/" . $projectId . "_" . $formId . "_" . 'submissions.csv')
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
        ])->get($formSubmissionsUrl);

        Http::withOptions([
            'verify' => false, //'debug' => true,
            'sink' => storage_path("app/submissions/" . $projectId . "_" . $formId . "_" . 'submissions.csv.zip')
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
        ])->get($formSubmissionsUrl.".zip?attachments=false");

    }

    private function getOrgunitIdOfsubmmission($response, $projectId, $formId)
    {
        try {

            $version = $this->getFormVersion($response, $projectId, $formId);
            $definationURI = "app/submissions/" . $projectId . "_" . $formId . "_" . $version . "_" . 'defination.xls';

            $fileUri = storage_path($definationURI);
            /** Load $inputFileName to a Spreadsheet Object  **/
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($fileUri);
            $orgUnitLevel2 = OrgunitLevelMap::where('level', 2)->get();
            $sheetName = $orgUnitLevel2[0]['sheet'];
            $column = $orgUnitLevel2[0]['column'];
            $sheet = $spreadsheet->getSheetByName($sheetName);

            $data = array(1, $sheet->toArray(null, true, true, true));
            $alphabet = array(
                'A', 'B', 'C', 'D', 'E',
                'F', 'G', 'H', 'I', 'J',
                'K'
            );
            $orgUnit = OdkOrgunit::where('level', 2)->where('odk_unit_name', $data[1][3][$alphabet[$column]])->get();
            $orgUnitId = '';
            foreach ($orgUnit as $unit) {
                $orgUnitId = $unit->org_unit_id;
            }
            return $orgUnitId;
        } catch (Exception $ex) {
            Log::error($ex);
            Log::error(" error =====>getOrgunitIdOfsubmmission() " . $ex->getMessage() . " (form ". $formId .") \n");
            throw new Exception($ex->getMessage() . " " . $formId);
        }
    }

    private function getFormVersion($response, $projectId, $formId)
    {
        $formVerisonUrl = $this->baseOdkUrl . "projects/" . $projectId . "/forms/" . $formId;
        //get for version number
        $version = Http::withOptions([
            'verify' => false, //'debug' => true,
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
        ])->get($formVerisonUrl)['version'];

        if (!isset($version)) {
            throw new Exception("no form version defined");
        }
        return  $version;
    }

    private function downloadFormOrgunitCascades($response, $projectId, $formId)
    {
        $version = $this->getFormVersion($response, $projectId, $formId);
        $definationURI = "app/submissions/" . $projectId . "_" . $formId . "_" . $version . "_" . 'defination.xls';

        try {
            Storage::delete($definationURI);
        } catch (Exception $e) {
            Log::error($e);
            echo 'Message: ' . $e->getMessage();
        }

        //download new files
        $formDefinationUrl = $this->baseOdkUrl . "projects/" . $projectId . "/forms/" . $formId . "/versions/" . $version . ".xls";
        Http::withOptions([
            'verify' => false, //'debug' => true,
            'sink' => storage_path($definationURI)
        ])->withHeaders([
            'Authorization' => 'Bearer ' . $response['token'],
        ])->get($formDefinationUrl);
    }
}

<?php

namespace App\Http\Controllers;

use App\ApprovedCerts;
use App\FormSubmissions;
use App\OdkOrgunit;
use App\Services\ODKDataAggregator;
use App\Services\ODKUtils;
use App\Services\SystemAuthorities;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use League\Csv\Reader;
use League\Csv\Statement;
use setasign\Fpdi\Fpdi;

class CertificatesController extends Controller
{
    private $baseOdkUrl = 'https://odk.nphl.go.ke/v1/';
    private string $projectID;
    private string $formID;

    public function __construct()
    {
        // if ODK_URL is set in environment variables, use it
        if (config('app.odk_url')) {
            $this->baseOdkUrl = config('app.odk_url');
        } else {
            $this->baseOdkUrl = 'https://odk.nphl.go.ke/v1/';
        }
        $this->middleware('auth');

        $this->projectID = '56';
        $this->formID = 'National_HTS_Site_Certification_Checklist';
    }

    public function refreshData()
    {
        try {
            $autUrl = $this->baseOdkUrl . "sessions";
            $response = Http::withoutVerifying()->withOptions([
                // 'verify' => false, //'debug' => true
            ])->post($autUrl, [
                'email' => config('app.odk_user'),
                'password' => config('app.odk_pass'),
            ]);
            // download the csv file to storage/app/certificationassessmentdata/submissions.csv
            $ans = Http::withOptions([
                // 'verify' => false, //'debug' => true,
                'sink' => storage_path("app/certificationassessmentdata/submissions.csv")
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $response['token'],
            ])->get($this->baseOdkUrl . "projects/" . $this->projectID . "/forms/" . $this->formID . "/submissions.csv");

            // if successful, return json with message
            if ($ans->status() == 200) {
                return response()->json(['Message' => 'Successfully refreshed data']);
            } else {
                return response()->json(['Message' => 'Error refreshing data']);
            }
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Error refreshing data']);
        }
    }

    private function fetchData($certid = null)
    {
        // if year isn't passed, use first file in the folder
        $filename = "certificationassessmentdata/submissions.csv";
        if (Storage::exists($filename)) {
            $csv_dir_path = Storage::path($filename);
        } else {
            $this->refreshData();
        }
        $csv = Reader::createFromPath($csv_dir_path, 'r');
        $csv->setHeaderOffset(0); //set the CSV header offset
        $stmt = Statement::create();
        $records = $stmt->process($csv);
        $rcds = json_decode(json_encode($records), true);

        if ($certid) {
            $rcd = array_filter($rcds, function ($value) use ($certid) {
                return $value['KEY'] == $certid;
            });
            foreach ($rcd as $key => $value) {
                if ($value['KEY'] == $certid) {
                    return $value;
                }
            }
        }
        return $rcds;
    }

    private function summaries()
    {
        $data = $this->fetchData();
        return [];
    }

    private function getOrgSitesAtLevel4($countyfilter = null)
    {
        $aggregator = new ODKDataAggregator();
        $odkUtils = new ODKUtils();


        $combinedRecords = [];
        $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
            ->where('form_id', 'like', "spi%") // for spi data
            ->get();
        foreach ($submissionOrgUnitmap as $mapping) {
            $projectId = $mapping->project_id;
            $formId = $mapping->form_id;
            if ($countyfilter) {
                $filter = str_replace('_', ' ', $countyfilter);
                $orgUnit = OdkOrgunit::where('odk_unit_name', 'like', $filter . '%')->where('level', 2)->first();
                if ($orgUnit) {
                    $orgUnit = $orgUnit->toArray();
                    [$projectId, $formId] = $odkUtils->getFormFormdProjectIds($orgUnit, "spi%");
                }
            }
            $fileName = $aggregator->getFileToProcess($projectId, $formId);
            $perCountyRecords = $aggregator->getSingleFileRecordsV2($fileName);
            if ($perCountyRecords && is_array($perCountyRecords)) {
                $combinedRecords = array_merge($combinedRecords, $perCountyRecords);
            }
        }

        $unique_facility_records = [];
        foreach ($combinedRecords as $record) {
            $is_in_array = !empty(array_filter($unique_facility_records, function ($unq_facil) use ($record) {
                return $unq_facil['mysites_facility'] == $record['mysites_facility'] && $unq_facil['mysites'] == $record['mysites'];
            }));
            if (!$is_in_array) {
                $unique_facility_records[] = $record;
            }
        }
        /**
         * 'level0': 'Level 0 (<40%)',
         *  'level1': 'Level 1 (40-59%)',
         *  'level2': 'Level 2 (60-79%)',
         *  'level3': 'Level 3 (80-89%)',
         *  'level4': 'Level 4 (>90%)'
         */
        $sites_summary = [
            'total_assessed' => 0,
            'level_0' => [], // [{county:'', subcounty:'', facility:'', site:''}]
            'level_1' => [],
            'level_2' => [],
            'level_3' => [],
            'level_4' => [],
        ];
        // foreach ($combinedRecords as $record) {
        foreach ($unique_facility_records as $record) {
            $facility = $record['mysites_facility'];
            $site = $record['mysites'];

            $is_site_level_4 = $record['Section-sec91percentage'] >= 90;
            if ($is_site_level_4) {
                $sites_summary['level_4'][] = $facility . ' | ' . $site;
            }
        }

        return $sites_summary;
    }
    private function getLatestRoutineData($data)
    {
        $aggregator = new ODKDataAggregator();
        $odkUtils = new ODKUtils();
        $allData = [];
        $routineData = [];
        $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
            ->where('form_id', 'like', "spi%") // for spi data
            ->get();
        foreach ($submissionOrgUnitmap as $mapping) {
            $projectId = $mapping->project_id;
            $formId = $mapping->form_id;
            $fileName = $aggregator->getFileToProcess($projectId, $formId);
            $perCountyRecords = $aggregator->getSingleFileRecordsV2($fileName);
            if ($perCountyRecords && is_array($perCountyRecords)) {
                $allData = array_merge($allData, $perCountyRecords);
            }
        }


        foreach ($data as $record) {
            // find the first matching record in the allData and push it to routineData
            $matchingRecord = array_values(array_filter($allData, function ($value) use ($record) {
                // use mfl and site to match
                return $value['mysites_facility'] == $record['mysites_facility'] && $value['mysites'] == $record['mysites'];
            }));
            if (count($matchingRecord) > 0) {
                $routineData[] = $matchingRecord[0];
            }
        }


        return $routineData;
    }

    private function getAssessmentLevelsSummary($data)
    {
        $sites_summary = [
            'level_0' => [], // Level 0 (<40%)
            'level_1' => [], // Level 1 (40-59%)
            'level_2' => [], // Level 2 (60-79%)
            'level_3' => [], // Level 3 (80-89%)
            'level_4' => [], // Level 4 (>90%)
        ];
        foreach ($data as $record) {
            $site_score = $record['Section-sec91percentage'];
            $county = $record['mysites_county'];
            $subcounty = $record['mysites_subcounty'];
            $facility = $record['mysites_facility'];
            $site = $record['mysites'];

            if ($site_score >= 90) {
                $sites_summary['level_4'][] = [
                    'county' => $county,
                    'subcounty' => $subcounty,
                    'facility' => $facility,
                    'site' => $site,
                ];
            } elseif ($site_score >= 80) {
                $sites_summary['level_3'][] = [
                    'county' => $county,
                    'subcounty' => $subcounty,
                    'facility' => $facility,
                    'site' => $site,
                ];
            } elseif ($site_score >= 60) {
                $sites_summary['level_2'][] = [
                    'county' => $county,
                    'subcounty' => $subcounty,
                    'facility' => $facility,
                    'site' => $site,
                ];
            } elseif ($site_score >= 40) {
                $sites_summary['level_1'][] = [
                    'county' => $county,
                    'subcounty' => $subcounty,
                    'facility' => $facility,
                    'site' => $site,
                ];
            } else {
                $sites_summary['level_0'][] = [
                    'county' => $county,
                    'subcounty' => $subcounty,
                    'facility' => $facility,
                    'site' => $site,
                ];
            }
        }
        return $sites_summary;
    }

    private function getPerfPerSection($data)
    {
        // sites
        $sites = [
            'vct',
            'pmtct',
            'lab',
            'pitc',
            'other'
        ]; // TODO
        $perf_per_section = [
            'section_0' => [], // Section-sec0percentage    // Administrative Support
            'section_1' => [], // Section-sec1percentage    // Personnel Training & Certification
            'section_2' => [], // Section-sec2percentage    // Quality Assurance in Counselling
            'section_3' => [], // Section-sec3percentage    // Physical Facility
            'section_4' => [], // Section-sec4percentage    // Safety
            'section_5' => [], // Section-sec51percentage   // Pre-testing Phase
            'section_6' => [], // Section-sec61percentage   // Testing Phase
            'section_7' => [], // Section-sec7percentage    // Post-testing Phase
            'section_8' => [], // Section-sec8percentage    // EQA
            // 'section_9' => [], // Section-sec9percentage    // Retesting
        ];

        foreach ($data as $record) {
            $perf_per_section['section_0'][] = $record['Section-sec0percentage'];
            $perf_per_section['section_1'][] = $record['Section-sec1percentage'];
            $perf_per_section['section_2'][] = $record['Section-sec2percentage'];
            $perf_per_section['section_3'][] = $record['Section-sec3percentage'];
            $perf_per_section['section_4'][] = $record['Section-sec4percentage'];
            $perf_per_section['section_5'][] = $record['Section-sec5percentage'];
            $perf_per_section['section_6'][] = $record['Section-sec6percentage'];
            $perf_per_section['section_7'][] = $record['Section-sec7percentage'];
            $perf_per_section['section_8'][] = $record['Section-sec8percentage'];
        }

        $perf_per_section['section_0'] = array_sum($perf_per_section['section_0']) / count($perf_per_section['section_0']);
        $perf_per_section['section_1'] = array_sum($perf_per_section['section_1']) / count($perf_per_section['section_1']);
        $perf_per_section['section_2'] = array_sum($perf_per_section['section_2']) / count($perf_per_section['section_2']);
        $perf_per_section['section_3'] = array_sum($perf_per_section['section_3']) / count($perf_per_section['section_3']);
        $perf_per_section['section_4'] = array_sum($perf_per_section['section_4']) / count($perf_per_section['section_4']);
        $perf_per_section['section_5'] = array_sum($perf_per_section['section_5']) / count($perf_per_section['section_5']);
        $perf_per_section['section_6'] = array_sum($perf_per_section['section_6']) / count($perf_per_section['section_6']);
        $perf_per_section['section_7'] = array_sum($perf_per_section['section_7']) / count($perf_per_section['section_7']);
        $perf_per_section['section_8'] = array_sum($perf_per_section['section_8']) / count($perf_per_section['section_8']);



        return $perf_per_section;
    }

    public function dashboard(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_certificates'])) {
            return view('reports.certification.dashboard', ['error' => 'You are not authorized to view this page.']);
            // return response()->json(['Message' => 'Not allowed to view certificates: '], 500);
        }
        $user = Auth::user();
        if (!$user) {
            return view('reports.certification.index', ['error' => 'You are not authorized to view this page.']);
        }
        $user_level = 1;
        $user_primary_org = OdkOrgunit::where('level', 1)->first();

        $user_orgs = DB::table('odkorgunit_user')
            ->join('odkorgunit', 'odkorgunit.org_unit_id', '=', 'odkorgunit_user.odk_orgunit_id')
            ->where('odkorgunit_user.user_id', $user->id)
            ->get();

        // county filter
        $filtercounty = $request->county ?? null;

        $summaries = [];
        $overall_sites_at_level_4 = $this->getOrgSitesAtLevel4($filtercounty);
        // Log::info('overall_sites_at_level_4 ' . json_encode($overall_sites_at_level_4));
        $no_overall = count($overall_sites_at_level_4['level_4']);
        $summaries['all_eligible_l4_sites'] = $no_overall;

        $data = $this->fetchData();
        if (in_array(1, array_column($user_orgs->toArray(), 'level'))) {
            $user_level = 1;
            if ($filtercounty && $filtercounty != 'All') {
                $data = array_values(array_filter($data, function ($value) use ($filtercounty) {
                    return $value['mysites_county'] == $filtercounty;
                }));
            }
        } else {
            // if level = county
            $user_primary_org = $user_orgs->first();
            if (in_array(2, array_column($user_orgs->toArray(), 'level'))) {
                $user_level = 2;
                foreach ($user_orgs as $user_org) {
                    $data = array_values(array_filter($data, function ($value) use ($user_org) {
                        return trim(strtolower(str_replace('_', ' ', $value['mysites_county']))) == trim(strtolower($user_org->odk_unit_name));
                    }));
                }
            } else if (in_array(3, array_column($user_orgs->toArray(), 'level'))) {
                $user_level = 3;
                foreach ($user_orgs as $user_org) {
                    $data = array_values(array_filter($data, function ($value) use ($user_org) {
                        return trim(strtolower(str_replace('_', ' ', $value['mysites_subcounty']))) == trim(strtolower($user_org->odk_unit_name));
                    }));
                }
            } else if (in_array(4, array_column($user_orgs->toArray(), 'level'))) {
                $user_level = 4;
                foreach ($user_orgs as $user_org) {
                    $data = array_values(array_filter($data, function ($value) use ($user_org) {
                        $record_mfl = explode("_", $value['mysites_facility'])[0];
                        $user_org_mfl = explode("_", $user_org->odk_unit_name)[0];
                        return trim(strtolower($record_mfl)) == trim(strtolower($user_org_mfl));
                    }));
                }
            }
        }
        $assessment_data = $this->getAssessmentLevelsSummary($data);
        $latest_routine_data = $this->getLatestRoutineData($data);
        $summaries['assessment_data'] = $assessment_data;
        $perf_per_section = $this->getPerfPerSection($data);
        $summaries['perf_per_section'] = $perf_per_section;
        return view('reports/certification/dashboard', compact('summaries', 'data', 'latest_routine_data', 'filtercounty', 'user_orgs', 'user_level', 'user_primary_org'));
    }

    public function dashboardAPI()
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_certificates'])) {
            return response()->json(['Message' => 'Not allowed to view certificates: '], 500);
        }
        $summaries = $this->summaries();
        return response()->json($summaries);
    }

    public function index()
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_certificates'])) {
            return view('reports.certification.index', ['error' => 'You are not authorized to view this page.']);
            // return response()->json(['Message' => 'Not allowed to view certificates: '], 500);
        }
        $user = Auth::user();
        if (!$user) {
            return view('reports.certification.index', ['error' => 'You are not authorized to view this page.']);
        }
        // select ou.* from odkorgunit ou where ou.org_unit_id = (select uou.odk_orgunit_id from odkorgunit_user uou where uou.user_id = 655)
        $user_orgs = DB::table('odkorgunit_user')
            ->join('odkorgunit', 'odkorgunit.org_unit_id', '=', 'odkorgunit_user.odk_orgunit_id')
            ->where('odkorgunit_user.user_id', $user->id)
            ->get();
        $data = $this->fetchData();
        if (count($user_orgs) > 0) {
            // check the level of the user's first org. if 1, show all certs. else, filter certs by level

            // 111111111111111111111111111111111111111111111111
            $data_filtered = [];
            foreach ($user_orgs as $user_org) {
                $user_org_level = $user_org->level;
                if ($user_org_level == 1) {
                    // show all certs
                    $data_filtered = array_merge($data_filtered, $data);
                } else {
                    if ($user_org_level == 2) {
                        $data_county = array_values(array_filter($data, function ($item) use ($user_org) {
                            return trim(strtolower(str_replace('_', ' ', $item['mysites_county']))) == trim(strtolower($user_org->odk_unit_name));
                        }));
                        // Log::info('data_county: for ' . $user_org->odk_unit_name . ' is ' . count($data_county));
                        $data_filtered = array_merge($data_filtered, $data_county);
                    } else if ($user_org_level == 3) {
                        $data_subcounty = array_values(array_filter($data, function ($item) use ($user_org) {
                            return trim(strtolower(str_replace('_', ' ', $item['mysites_subcounty']))) == trim(strtolower($user_org->odk_unit_name));
                        }));
                        $data_filtered = array_merge($data_filtered, $data_subcounty);
                    } else if ($user_org_level == 4) {
                        $data_facility = array_values(array_filter($data, function ($item) use ($user_org) {
                            $record_mfl = explode("_", $item['mysites_facility'])[0];
                            $user_org_mfl = explode("_", $user_org->odk_unit_name)[0];
                            return trim(strtolower($record_mfl)) == trim(strtolower($user_org_mfl));
                        }));
                        $data_filtered = array_merge($data_filtered, $data_facility);
                    }
                }
            }
            $data = $data_filtered;
            // 111111111111111111111111111111111111111111111111

        }
        $approved_certs = ApprovedCerts::pluck('cert_id')->toArray();
        return view('reports/certification/index', compact('data', 'approved_certs'));
    }

    public function indexAPI()
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_certificates'])) {
            return response()->json(['Message' => 'Not allowed to view certificates: '], 500);
        }
        $certificates = $this->fetchData();
        return response()->json($certificates);
    }

    public function viewCert(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_certificates'])) {
            return view('reports.certification.index', ['error' => 'You are not authorized to view this page.']);
            // return response()->json(['Message' => 'Not allowed to view certificates: '], 500);
        }

        $certid = $request->certid;
        $cert = $this->fetchData($certid);

        // use pdf template to generate pdf (storage/app/pdf_templates/rtcqi_cert_template.pdf)
        // variables to be replaced in the template are: CERT_NO, MFL_CODE, FACILITY_NAME, COUNTY_SUBCOUNTY, DATE_ISSUED

        $cert_no = strtoupper(str_replace('uuid:', '', $cert['KEY']));
        $facility = $cert['mysites_facility'];
        // mfl = first element of facility when split by "_"
        $mfl_code = explode("_", $facility)[0];
        $facility = str_replace('_', ' ', strtoupper($facility . " - " . $cert['mysites']));
        $county_subcounty = str_replace('_', ' ', strtoupper($cert['mysites_county'] . " - " . $cert['mysites_subcounty']));
        $date_issued = ApprovedCerts::where('cert_id', $certid)->first()->created_at ?? date('Y-m-d');
        // make date format YYYY-MM-DD
        $date_issued = date('Y-m-d', strtotime($date_issued));

        $pdf_template = Storage::path('pdf_templates/blank_rtcqi_cert_template.pdf');

        $pdf = new Fpdi();
        $pdf->AddPage('L');
        $pdf->setSourceFile($pdf_template);
        $template = $pdf->importPage(1);
        $pdf->useTemplate($template);

        $pdf->SetFont('Helvetica', '', 16);
        $pdf->SetTextColor(0, 0, 0);

        $pdf->SetFont('Helvetica', '', 12);
        $pdf->SetTextColor(255, 0, 0);
        $pdf->SetXY(8, 19);
        $pdf->Write(10, $cert_no);

        $pdf->SetFont('Helvetica', '', 15);
        $pdf->SetTextColor(255, 0, 0);
        $pdf->SetXY(270, 19);
        $pdf->Write(10, $mfl_code);

        $pdf->SetFont('Helvetica', 'B', 19);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetXY(92, 75);
        $pdf->Write(10, $facility);

        $pdf->SetFont('Helvetica', 'B', 16);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetXY(53, 85);
        $pdf->Write(10, $county_subcounty);

        $pdf->SetFont('Helvetica', 'B', 19);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetXY(150, 114);
        $pdf->Write(10, $date_issued);


        $pdf->Output('cert.pdf', 'D');

        return response()->download('cert.pdf');


        // return json_encode($cert);
        // return view('reports/certification/cert', compact('cert'));
    }

    public function viewSubmission(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_certificates'])) {
            return view('reports.certification.index', ['error' => 'You are not authorized to view this page.']);
        }


        $labels = [
            "mysites_county" => "County",
            "mysites_subcounty" => "Subcounty",
            "mysites_facility" => "Facility",
            "mysites" => "Site",
            "SubmissionDate" => "Submission Date",
            "start" => "Start Time",
            "note136" => "Swipe Left To move forward OR Swipe to the Right to move back  to previos page.",
            "nameoftheactivity" => "National HTS Site Certification Assessment - Ministry of Health",
            "mysites" => "Sites",
            "affiliation" => "Affilliation (Circle One)",
            "otheraffiliation" => "If other specify",
            "partner" => "Partner",
            "otherpartner" => "If other specify",
            "dateofsubmission" => "Date of Collection",
            "initialfollowup" => "Initial/Follow Up",
            "followup" => "Follow Up",
            "otherFollowup" => "If other specify",
            "Section" => "Sections",
            "foreachquestion" => "For each of the sections listed below, please check Yes or No, where applicable. Indicate “Yes” only when all elements are satisfactorily present & \"No\" when some or none of the elements is available. Provide comments for each “No” response. Indicate N/A in the comments section if you have no comment.",
            "Section0" => "Section 0.0 PROGRAM ADMINISTRATIVE SUPPORT,     (Score = 3)",
            "annualworkplan" => "i. Does the county have a quality improvement program implementation annual workplan?",
            "comments01" => "Comments",
            "scmlcsupport" => "ii. Has the sub-county health management team (scmlc/scasco/HRIO) provided administrative support supervision to the facility in the last quarter?",
            "comments03" => "Comments",
            "cmlcsupport" => "iii. Has the county health management team provided administrative support supervision to the facility in the last year?",
            "comments04" => "Comments",
            "picture0" => "Do want to take a picture?",
            "image0" => "Take Picture",

            "Section1" => "Section 1.0 TRAINING AND CERTIFICATION ON HIV SERVICES,     (Score = 3)",
            "acreditedinstitutions" => "For accredited hts training institutions visit: www.nascop.or.ke/accredited-institutions/",
            "numbertesters" => "1.0 Number of Testers in the site?",
            "comments22" => "Comments",
            "providers_undergone_training" => "1.1 Have all HTS service providers undergone the approved training program?",
            "comments1" => "Comments",
            "training_certificates_available" => "1.2 Are copies of training certificates available in the testing sites/facility for the trained personnel?",
            "comments2" => "Comments",
            "refresher_training" => "1.3 Have all service HTS providers undergone refresher training/CME in the last 24 months?",
            "comments3" => "Comments",
            "picture1" => "Do want to take a picture?",
            "image1" => "Take Picture",

            "Section2" => "Section 2.0  QUALITY ASSUARANCE IN COUNSELLING       (Score = 6)",
            "attended_support_supervision" => "2.1 Have all the HTS providers attended counselor support supervision in the last quarter?",
            "comments4" => "Comments",
            "support_by_experienced_counselor" => "2.2 Is support supervision in the last quarter done by an experienced counselor? ( One with expirience of 3 years and above)",
            "comments5" => "Comments",
            "provider_self_assessment" => "2.3 Have all the HTS providers conducted at least one provider self-assessment in the last month worked?",
            "comments6" => "Comments",
            "provider_self_assessment_review" => "2.4 Have all the documented provider self-assessments been reviewed by the supervisor?",
            "comments7" => "Comments",
            "client_satisfaction_survey_done" => "2.5 Has the facility conducted client exit interviews to establish their satisfaction on the quality of HTS services received in the previous quarter?",
            "comments8" => "Comments",
            "observed_practice" => "2.6 Have all the HTS providers had an observed practice practice by an experienced supervisor in the last quarter.",
            "comments9" => "Comments",
            "picture2" => "Do want to take a picture?",
            "image2" => "Take Picture",

            "Section3" => "Section 3.0  PHYSICAL FACILITY      (Score = 6)",
            "HIV_testing_area" => "3.1 Is there a designated area for HTS provision?",
            "comments10" => "Comments",
            "sufficient_space" => "3.2 Does the designated area have sufficient space for HTS?",
            "comments11" => "Comments",
            "confidentiality" => "3.3 Does the HTS site have facilities to accord confidentiality?",
            "comments12" => "Comments",
            "clean_testing_area" => "3.4 Is the testing area clean and organized for service provision?",
            "comments13" => "Comments",
            "sufficient_lighting" => "3.5 Is there sufficient lighting in the designated testing area?",
            "comments14" => "Comments",
            "secure_storage" => "3.6 Are there suitable facilities for secure storage of test kits?",
            "comments15" => "Comments",
            "picture3" => "Do want to take a picture?",
            "image3" => "Take Picture",

            "Section4" => "Section 4.0 : SAFETY,       (Score = 6)",
            "tap_bucket" => "4.1 Is there provision for running water (a tap or engineered bucket) for the site? Is there running water from the tap/engineered bucket",
            "comments16" => "Comments",
            "soap" => "4.2 Is soap available for hand washing or a hand sanitizer?",
            "comments17" => "Comments",
            "wastesegregationfacility" => "4.3 Are the appropriate waste segregation bins/liners available at the site?",
            "comments18" => "Comments",
            "segregationonsite" => "4.4 Is waste segregation done at the HTS site?",
            "comments19" => "Comments",
            "pep_protocols" => "4.5 Is PEP protocol available in the site?",
            "comments20" => "Comments",
            "pep_protocols_followed" => "4.6 Is PEP protocol followed in case of exposure to blood and needle stick injury, splash or other sharps injury?",
            "comments21" => "Comments",
            "picture4" => "Do want to take a picture?",
            "image4" => "Take Picture",

            "Section5" => "Section 5.0 : PRE-TESTING PHASE,          (Total Score = 13 or 14)",
            "job_aides_infectious_waste" => "5.1 Are there Job aids for disposal of infectious and non-infectious waste at the testing site?",
            "comments23" => "Comments",
            "bloodspills" => "5.2 Are there job aids for blood spills/body fluids management?",
            "comments24" => "Comments",
            "job_aides_nationalalgo" => "5.3 Is there a job aid outlining the current national HTS algorithm?",
            "comments25" => "Comments",
            "Duokit_used" => "Is Duo HIV/ Syphilis test being used?(Yes/No : No score to be awarded)?",
            "subsec5" => "Section 5.0 : PRE-TESTING PHASE CONT.",
            "Duokit_jobaide" => "5.4 Is there a job aid outlining the correct HIV/ Syphilis Duo procedure?",
            "comments26" => "Comments",
            "Determine_jobaide" => "5.5 Is there a job aid outlining the correct Determine procedure?",
            "comments27" => "Comments",
            "FirstResponce_jobaide" => "5.6 Is there a job aid outlining the correct First Response procedure?",
            "comments28" => "Comments",
            "expirationdate" => "5.7 Is kit expiry date observed before testing?",
            "comments29" => "Comments",
            "testkitskeptwell" => "5.8 Are the test kits kept as per manufacturer’s instructions?",
            "comments30" => "Comments",
            "newconsignmentQC" => "5.9 Is Quality control for test kits done on receiving a new consignment?",
            "comments31" => "Comments",
            "newkitlotQC" => "5.10 Is Quality control for test kits done before using a new kit lot?",
            "comments32" => "Comments",
            "monthlyQC" => "5.11 Is the current kit in use tested for Quality (using known +ve and -ve samples) at the beginning of every month?",
            "comments33" => "Comments",
            "qc_recorded" => "5.12 Are QC results properly recorded?",
            "comments34" => "Comments",
            "qc_reviewed" => "5.13 Are QC records routinely reviewed by the person in charge?",
            "comments35" => "Comments",
            "stepstocorrect_invalid_QC" => "5.14 Are appropriate steps taken and documented when QC results are incorrect and/or invalid?",
            "comments36" => "Comments",
            "picture5" => "Do want to take a picture?",
            "image5" => "Take Picture",

            "Section6" => "Section 6.0: TESTING PHASE,      (Total Score = 7 or 9)",
            "hts_algorithmfollowed" => "6.1 Is the HTS algorithm always followed?",
            "comments37" => "Comments",
            "duokit_algo_followed" => "6.2 Is the   HIV/ Syphilis Duo test  algorithm always followed?",
            "comments38" => "Comments",
            "samplecollection" => "6.3 Are sample collection devices (e.g., capillary tube, loop, disposable pipettes, etc.) available?",
            "comments39" => "Comments",
            "Determine_algo" => "6.4 Is the correct procedure for Determine test followed?",
            "comments40" => "Comments",
            "Duokit_procedure" => "6.5 Is the correct procedure for HIV/ Syphilis Duo test followed?",
            "comments41" => "Comments",
            "FirstResponce_algo" => "6.6 Is the correct procedure for First Response followed?",
            "comments42" => "Comments",
            "timersavailable" => "6.7 Are functional timers available for HIV rapid testing?",
            "comments43" => "Comments",
            "timersused" => "6.8 Are timers routinely used for HIV rapid testing?",
            "comments44" => "Comments",
            "resultsinterpreted" => "6.9 Are testing results correctly interpreted?",
            "comments45" => "Comments",
            "picture6" => "Do want to take a picture?",
            "image6" => "Take Picture",

            "Section7" => "Section 7.0: POST TESTING PHASE - DOCUMENTS AND RECORDS,       (Score = 8)",
            "registeravailable" => "7.1 Is there a current version of the national standardized HIV rapid testing register available and in use?",
            "comments48" => "Comments",
            "qualityelements" => "7.2 Does the HIV testing register include all the key quality elements? E.g. kit name, expiry date, kit lot number?",
            "comments49" => "Comments",
            "elementscapturedcorrectly" => "7.3 Are all the elements in the register recorded/captured correctly?  (e.g., client demographics, kit names, lot numbers, expiration dates, HTS provider name, individual and final HIV test results, etc.)?",
            "comments50" => "Comments",
            "summaryavailable" => "7.4 Is the total summary at the end of each page or month (in case of e-hts) of the register compiled accurately?",
            "comments51" => "Comments",
            "invalid_results" => "7.5 Are invalid test results properly recorded in the register?",
            "comments52" => "Comments",
            "client_docs_stored" => "7.6 Are all client documents and records securely kept throughout the phases of the testing process?",
            "comments54" => "Comments",
            "secure_doc_storage" => "7.7 Are all registers and other documents kept in a secure location when not in use?",
            "comments55" => "Comments",
            "properly_labelled" => "7.8 Are registers properly labeled and archived when full/retired?",
            "comments56" => "Comments",
            "picture7" => "Do want to take a picture?",
            "image7" => "Take Picture",

            "Section8" => "Section 8.0: EXTERNAL QUALITY ASSESSMENT (PT AND SUPERVISION),                (Score = 10)",
            "allprovidersenrolled" => "8.1 Are all the HTS providers registered into the national proficiency testing program?",
            "comments57" => "Comments",
            "providerstestPT" => "8.2 Did all the enrolled HTS providers test received PT samples for the last concluded round?",
            "comments58" => "Comments",
            "resultssubmittedonline" => "8.3 Did all enrolled HTS providers submit their results to KNEQAS for performance evaluation?",
            "comments59" => "Comments",
            "feedbackreceived" => "8.4 Are the HTS providers able to access & download their PT performance feedback reports online?",
            "comments60" => "Comments",
            "feedbackreviewed" => "8.5 Are received performance feedback reports reviewed by laboratory QA supervisor and/or the person in charge at the testing point?",
            "comments61" => "Comments",
            "feedbackreportfilled" => "8.6 Are perfomance feedback reports filed at site/facility?",
            "comments62" => "Comments",
            "providerscorrectiveaction" => "8.7 Is corrective action implemented in case of unsatisfactory performance?",
            "comments63" => "Comments",
            "technicalsupervision" => "8.8 Do service providers receive periodic technical supervisory visits?",
            "comments64" => "Comments",
            "retrainingdone" => "8.9 Is mentorship/retraining done as required during the supervisory visit?",
            "comments65" => "Comments",
            "feedbackdocumented" => "8.10 Is feedback provided during supervisory visits and documented?",
            "comments66" => "Comments",
            "picture8" => "Do want to take a picture?",
            "image8" => "Take Picture",

            "lessthan40" => "level 0 = Less than 40%  (Needs improvement in all QA implementation areas and immediate remediation)",
            "lessthan59" => "level 1 = 40% - 59%   (Needs improvement in specific QA implementation areas)",
            "lessthan79" => "level  2 = 60% - 79%   (Partially   implementation QA areas)",
            "lessthan89" => "Level 3 =   80% - 89%   (Close to  full  implementation all QA elements)",
            "lessthan100" => "Level 4 =  90% or higher  (Full  implementation all QA elements )",
            "lessthan401" => "level 0 = Less than 40%  (Needs improvement in all QA implementation areas and immediate remediation)",
            "lessthan591" => "level 1 = 40% - 59%   (Needs improvement in specific QA implementation areas)",
            "lessthan791" => "level  2 = 60% - 79%   (Partially   implementation QA areas)",
            "lessthan891" => "Level 3 =   80% - 89%   (Close to  full  implementation all QA elements)",
            "lessthan1001" => "Level 4 =  90% or higher  (Full  implementation all QA elements )",
            "Section9" => "Section 9:  Auditor’s  Summary Report for SPI-RT Assessment",
            "leadhtsprovider" => "Name of the lead HTS provide in the site",
            "auditlength" => "Approximate Length of  Audit (Minutes or Hours)",
            "sectionsummary" => "For the sections(Sections 1-8) audited, please do a summary report indicating Section Number, Details of any Non-conformity,Corrective action recommended , timeline and responsible persons .",
            "repeat" => "Section report and Comments by clicking  \"Add\" . If no report to add click \"Do Not Add\" to finalize checklist.",
            "sectionno" => "Section Number",
            "Non-conformity" => "Details of non-conformity",
            "conformity" => "Details of non-conformity",
            "CorrectionType" => "Corrective action recommended (Onsite or FollowUp)",
            "Recommentations" => "Timeline & persons responsible",
            "comments1" => "Section 9 comments (repeat)",
            "nameoftheauditor" => "Type your Name",
            "sitesuperviser" => "Site Superviser Name",
            "comments3" => "Section 9 comments",
            "datefinal" => "Date (Final)",
            "picture9" => "Do want to take a picture?",
            "image9" => "Take Picture",
            "getgprs" => "GPRS Location",
            "end" => "End Time",
            "getgprs-Longitude" => "Longitude",
            "getgprs-Latitude" => "Latitude",
            "Longitude" => "Longitude",
            "Latitude" => "Latitude",
        ];

        $exclude = [
            'note136',
            'nameoftheactivity',
            'picture1',
            'picture2',
            'picture3',
            'picture4',
            'picture5',
            'picture6',
            'picture7',
            'picture8',
            'picture9',
            'image1',
            'image2',
            'image3',
            'image4',
            'image5',
            'image6',
            'image7',
            'image8',
            'image9',
            'Section-sec0calc',
            'Section-sec0percentage',
            'Section-sec0sum',
            'Section-sec1calc',
            'Section-sec1percentage',
            'Section-sec1sum',
            'Section-sec2calc',
            'Section-sec2percentage',
            'Section-sec2sum',
            'Section-sec3calc',
            'Section-sec3percentage',
            'Section-sec3sum',
            'Section-sec4calc',
            'Section-sec4percentage',
            'Section-sec4sum',
            'Section-sec5calc',
            'Section-sec5percentage',
            'Section-sec5sum',
            'Section-sec51calc',
            'Section-sec51percentage',
            'Section-sec51sum',
            'Section-sec61calc',
            'Section-sec61percentage',
            'Section-sec61sum',
            'Section-sec6calc',
            'Section-sec6percentage',
            'Section-sec6sum',
            'Section-sec7calc',
            'Section-sec7percentage',
            'Section-sec7sum',
            'Section-sec8calc',
            'Section-sec8percentage',
            'Section-sec8sum',
            'Section-sec9calc',
            'Section-sec9percentage',
            'Section-sec9sum',
            'Section-sec91calc',
            'Section-sec91percentage',
            'Section-sec91sum',
            'Section-levels-sec9sum',
            'Section-levels-sec91sum',
            'getgprs-Accuracy',
            'Section-Section9-sectionsummary',
            'Section-levels-lessthan40',
            'Section-levels-lessthan59',
            'Section-levels-lessthan79',
            'Section-levels-lessthan89',
            'Section-levels-lessthan100',
            'Section-levels-lessthan401',
            'Section-levels-lessthan591',
            'Section-levels-lessthan791',
            'Section-levels-lessthan891',
            'Section-levels-lessthan1001',
            'Section-foreachquestion',
            'Section-Section0-picture0',
            'Section-Section0-image0',
            'Section-Section1-picture1',
            'Section-Section1-image1',
            'Section-Section2-picture2',
            'Section-Section2-image2',
            'Section-Section3-picture3',
            'Section-Section3-image3',
            'Section-Section4-picture4',
            'Section-Section4-image4',
            'Section-Section5-picture5',
            'Section-Section5-image5',
            'Section-Section6-picture6',
            'Section-Section6-image6',
            'Section-Section7-picture7',
            'Section-Section7-image7',
            'Section-Section8-picture8',
            'Section-Section8-image8',
            'Section-Section9-picture9',
            'Section-Section9-image9',
            'Section-Section1-acreditedinstitutions',

        ];

        $id = $request->id;
        $submission = $this->fetchData($id);
        return view('reports/certification/submission', compact('submission', 'labels', 'exclude'));
    }

    public function viewCertAPI(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_certificates'])) {
            return response()->json(['Message' => 'Not allowed to view certificates: '], 500);
        }

        $certid = $request->certid;
        $cert = $this->fetchData($certid);
        return response()->json($cert);
    }


    public function approve(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['approve_certificates']) && !Gate::allows(SystemAuthorities::$authorities['view_certificates'])) {
            return view('reports.certification.index', ['error' => 'You are not authorized to view this page.']);
            // return response()->json(['Message' => 'Not allowed to view certificates: '], 500);
        }

        try {
            $certid = $request->certid;
            $facility = $request->facility;
            $site = $request->site;

            // check if it's in the approved_certificates table
            $cert = ApprovedCerts::where('cert_id', $certid)->first();
            if ($cert) {
                return view('reports.certification.index', ['error' => 'This certificate has already been approved']);
            } else {
                // add to the approved_certificates table
                ApprovedCerts::create([
                    'cert_id' => $certid,
                    'facility' => $facility,
                    'site' => $site,
                    'approved_by' => Auth::user()->id
                ]);
                return redirect()->route('cert_approvals_page')->with('message', 'Certificate approved successfully');
            }
        } catch (Exception $e) {
            return view('reports.certification.index', ['error' => 'An error occurred while approving this certificate']);
        }
    }
}

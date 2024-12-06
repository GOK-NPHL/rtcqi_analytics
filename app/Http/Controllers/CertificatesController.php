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
            if($countyfilter){
                $filter = str_replace('_', ' ', $countyfilter);
                $orgUnit = OdkOrgunit::where('odk_unit_name', 'like', $filter . '%')->where('level', 2)->first();
                if($orgUnit){
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
        foreach ($combinedRecords as $record) {
            $facility = $record['mysites_facility'];
            $site = $record['mysites'];

            $is_site_level_4 = $record['Section-sec91percentage'] >= 90;
            if ($is_site_level_4) {
                $sites_summary['level_4'][] = $facility . ' | ' . $site;
                // if (isset($sites_summary[$site])) {
                //     $sites_summary[$site] += 1;
                // } else {
                //     $sites_summary[$site] = 1;
                // }
            }
        }

        return $sites_summary;
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

        foreach($data as $record){
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

        // county filter
        $filtercounty = $request->county ?? null;

        $summaries = [];
        $overall_sites_at_level_4 = $this->getOrgSitesAtLevel4($filtercounty);
        Log::info('overall_sites_at_level_4 ' . json_encode($overall_sites_at_level_4));
        $no_overall = count($overall_sites_at_level_4['level_4']);
        $summaries['all_eligible_l4_sites'] = $no_overall;

        $data = $this->fetchData();
        if ($filtercounty && $filtercounty != 'All') {
            $data = array_filter($data, function ($value) use ($filtercounty) {
                return $value['mysites_county'] == $filtercounty;
            });
        }
        $assessment_data = $this->getAssessmentLevelsSummary($data);
        $summaries['assessment_data'] = $assessment_data;
        $perf_per_section = $this->getPerfPerSection($data);
        $summaries['perf_per_section'] = $perf_per_section;
        return view('reports/certification/dashboard', compact('summaries', 'data', 'filtercounty'));
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
        if(!$user){
            return view('reports.certification.index', ['error' => 'You are not authorized to view this page.']);
        }
        // select ou.* from odkorgunit ou where ou.org_unit_id = (select uou.odk_orgunit_id from odkorgunit_user uou where uou.user_id = 655)
        $user_orgs = DB::table('odkorgunit_user')
            ->join('odkorgunit', 'odkorgunit.org_unit_id', '=', 'odkorgunit_user.odk_orgunit_id')
            ->where('odkorgunit_user.user_id', $user->id)
            ->get();
        $data = $this->fetchData();
        if(count($user_orgs) > 0){
            // check the level of the user's first org. if 1, show all certs. else, filter certs by level
            $user_org_level = $user_orgs->first()->level;
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

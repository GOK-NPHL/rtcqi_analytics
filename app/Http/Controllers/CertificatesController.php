<?php

namespace App\Http\Controllers;

use App\ApprovedCerts;
use App\Services\SystemAuthorities;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        }else{
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
            // download the csv file to storage/app/certificationassessmentdata/submissions-(YYYY).csv
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

    public function dashboard()
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_certificates'])) {
            return view('reports.certification.dashboard', ['error' => 'You are not authorized to view this page.']);
            // return response()->json(['Message' => 'Not allowed to view certificates: '], 500);
        }
        // $summaries = $this->fetchData();
        return view('reports/certification/dashboard');//, compact('summaries'));
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
        $data = $this->fetchData();
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
        
        $cert_no = strtoupper( str_replace('uuid:', '', $cert['KEY']));
        $facility = $cert['mysites_facility'];
        // mfl = first element of facility when split by "_"
        $mfl_code = explode("_", $facility)[0];
        $facility = str_replace('_', ' ', strtoupper( $facility . " - " . $cert['mysites'] ));
        $county_subcounty = str_replace('_', ' ', strtoupper( $cert['mysites_county'] . " - " . $cert['mysites_subcounty'] ));
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

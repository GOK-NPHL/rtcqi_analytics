<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ODkHTSDataAggregator;
use App\Services\SystemAuthorities;
use Exception;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class SubmissionsController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_submissions'])) {
            return response()->json(['Message' => 'Not allowed to view submissions: '], 500);
        }
        return view('reports/submissions/index');
    }

    public function getData(Request $request)
    {
        $columnsToUse = [
            'SubmissionDate', 'start', 'partner', 'otherpartner', 'mysites_county', 'mysites_subcounty', 'mysites_facility', 'mysites', 'affiliation', 'dateofsubmission', 'baselinefollowup', 'followup', 'otherFollowup', 'Section-Section1-providers_undergone_training', 'Section-Section1-comments1', 'Section-Section1-training_certificates_available', 'Section-Section1-comments2', 'Section-Section1-refresher_training', 'Section-Section1-comments3', 'Section-Section1-picture1', 'Section-sec1calc', 'Section-sec1percentage', 'Section-Section2-attended_support_supervision', 'Section-Section2-comments4', 'Section-Section2-provider_self_assessment', 'Section-Section2-comments5', 'Section-Section2-client_satisfaction_survey_done', 'Section-Section2-comments6', 'Section-Section2-observed_practice', 'Section-Section2-comments7', 'Section-Section2-scmlcsupport', 'Section-Section2-comments8', 'Section-Section2-cmlcsupport', 'Section-Section2-comments9', 'Section-sec2calc', 'Section-sec2percentage', 'Section-Section3-HIV_testing_area', 'Section-Section3-comments10', 'Section-Section3-sufficient_space', 'Section-Section3-comments11', 'Section-Section3-confidentiality', 'Section-Section3-comments12', 'Section-Section3-clean_testing_area', 'Section-Section3-comments13', 'Section-Section3-sufficient_lighting', 'Section-Section3-comments14', 'Section-Section3-secure_storage', 'Section-Section3-comments15', 'Section-sec3calc', 'Section-sec3percentage', 'Section-Section4-running_water', 'Section-Section4-comments16', 'Section-Section4-soap', 'Section-Section4-comments17', 'Section-Section4-wastesegregationfacility', 'Section-Section4-comments18', 'Section-Section4-segregationonsite', 'Section-Section4-comments19', 'Section-Section4-pep_protocols', 'Section-Section4-comments20', 'Section-Section4-pep_protocols_followed', 'Section-Section4-comments21', 'Section-sec4calc', 'Section-sec4percentage', 'Section-Section5-job_aides_infectious_waste', 'Section-Section5-comments22', 'Section-Section5-bloodspills', 'Section-Section5-comments23', 'Section-Section5-job_aides_nationalalgo', 'Section-Section5-comments24', 'Section-Duokit_used', 'Section-subsec5-Duokit_jobaide', 'Section-subsec5-comments25', 'Section-subsec5-Determine_jobaide', 'Section-subsec5-comments26', 'Section-subsec5-FirstResponce_jobaide', 'Section-subsec5-comments27', 'Section-subsec5-expirationdate', 'Section-subsec5-comments28', 'Section-subsec5-testkitskeptwell', 'Section-subsec5-comments29', 'Section-subsec5-newconsignmentQC', 'Section-subsec5-comments30', 'Section-subsec5-newkitlotQC', 'Section-subsec5-comments31', 'Section-subsec5-monthlyQC', 'Section-subsec5-comments32', 'Section-subsec5-qc_recorded', 'Section-subsec5-comments33', 'Section-subsec5-stepstocorrect_invalid_QC', 'Section-subsec5-comments34', 'Section-sec5calc', 'Section-sec5percentage', 'Section-sec51calc', 'Section-sec51percentage', 'Section-sec51sum', 'Section-Section6-hts_algorithmfollowed', 'Section-Section6-comments35', 'Section-Section6-duokit_algo_followed', 'Section-Section6-comments36', 'Section-Section6-samplecollection', 'Section-Section6-comments37', 'Section-Section6-Determine_algo', 'Section-Section6-comments38', 'Section-Section6-Duokit_procedure', 'Section-Section6-comments39', 'Section-Section6-FirstResponce_algo', 'Section-Section6-comments40', 'Section-Section6-timersavailable', 'Section-Section6-comments41', 'Section-Section6-timersused', 'Section-Section6-comments42', 'Section-Section6-resultsinterpreted', 'Section-Section6-comments43', 'Section-Section6-retesting', 'Section-Section6-comments64', 'Section-Section6-retestingrecord', 'Section-Section6-comments65', 'Section-sec6calc', 'Section-sec6percentage', 'Section-sec61calc', 'Section-sec61percentage', 'Section-Section7-Qc_records_review', 'Section-Section7-comments44', 'Section-Section7-registeravailable', 'Section-Section7-comments45', 'Section-Section7-qualityelements', 'Section-Section7-comments46', 'Section-Section7-elementscapturedcorrectly', 'Section-Section7-comments47', 'Section-Section7-summaryavailable', 'Section-Section7-comments48', 'Section-Section7-invalid_results', 'Section-Section7-comments49', 'Section-Section7-invalid_repeated', 'Section-Section7-comments50', 'Section-Section7-client_docs_stored', 'Section-Section7-comments51', 'Section-Section7-secure_doc_storage', 'Section-Section7-comments52', 'Section-Section7-properly_labelled', 'Section-Section7-comments53', 'Section-sec7calc', 'Section-sec7percentage', 'Section-Section8-allprovidersenrolled', 'Section-Section8-comments54', 'Section-Section8-providerstestPT', 'Section-Section8-comments55', 'Section-Section8-resultssubmittedonline', 'Section-Section8-comments56', 'Section-Section8-feedbackreceived', 'Section-Section8-comments57', 'Section-Section8-feedbackreviewed', 'Section-Section8-comments58', 'Section-Section8-feedbackreportfilled', 'Section-Section8-comments59', 'Section-Section8-providerscorrectiveaction', 'Section-Section8-comments60', 'Section-Section8-technicalsupervision', 'Section-Section8-comments61', 'Section-Section8-retrainingdone', 'Section-Section8-comments62', 'Section-Section8-feedbackdocumented', 'Section-Section8-comments63', 'Section-sec8calc', 'Section-sec8percentage', 'Section-sec9calc', 'Section-sec9percentage', 'Section-sec91calc', 'Section-sec91percentage', 'Section-Section9-numbertesters', 'Section-Section9-auditlength', 'Section-Section9-nameoftheauditor', 'Section-Section9-sitesuperviser', 'Section-Section9-comments3', 'Section-Section9-datefinal'
        ];
        if (!Gate::allows(SystemAuthorities::$authorities['view_submissions'])) {
            return response()->json(['Message' => 'Not allowed to view submissions: '], 500);
        }
        try {
            $odkObj = new ODkHTSDataAggregator;
            $orgUnitIds = $request->orgUnitIds;
            $siteType = $request->siteType;
            $startDate = $request->startDate;
            $endDate = $request->endDate;

            // $result = $odkObj->getData($orgUnitIds, $siteType, $startDate, $endDate);
            $result0 = $odkObj->getSubmissions($orgUnitIds, $siteType, $startDate, $endDate);
            $resultx = array_values($result0);
            $result = $resultx[0] ?? [];
            $page = $request->page ?? 1;
            $perPage = $request->perPage ?? 50;
            $total = count($result);
            $pages = ceil($total / $perPage);
            $result_page = array_slice($result, ($page - 1) * $perPage, $perPage);
            return [
                'headers' => $columnsToUse,
                'result' => $result_page ?? [],
                'total' => $total,
                'totalPages' => $pages,
                'perPage' => $perPage,
                'page' => $page,
                'orgs' => $orgUnitIds,
            ];
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Could not fetch data: ' . $ex->getMessage()], 500);
        }
    }
}

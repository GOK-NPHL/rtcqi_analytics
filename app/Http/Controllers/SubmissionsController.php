<?php

namespace App\Http\Controllers;

use App\FormSubmissions;
use App\OdkOrgunit;
use App\Partner;
use App\PartnerOrgUnits;
use App\Services\ODKDataAggregator;
use Illuminate\Http\Request;
use App\Services\ODkHTSDataAggregator;
use App\Services\ODKUtils;
use App\Services\SystemAuthorities;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use League\Csv\Reader;
use League\Csv\Statement;

class SubmissionsController extends Controller
{
    private $userOrgTimelineParams = array();
    private $siteType = null;
    private $startDate = null;
    private $endDate = null;

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
            return view('reports/submissions/index', ['error' => 'You are not authorized to view this page.']);
            // return response()->json(['Message' => 'Not allowed to view submissions: '], 500);
        }
        return view('reports/submissions/index');
    }
    public function spi()
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_submissions'])) {
            return view('reports/submissions/spi', ['error' => 'You are not authorized to view this page.']);
            // return response()->json(['Message' => 'Not allowed to view submissions: '], 500);
        }
        return view('reports/submissions/spi');
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
            // cache key format = 'method:path:uniqueid'
            $cache_unique_uid = md5($request->path() . json_encode($request->all()));
            $cacheId = strtolower($request->method()) . ':' . $request->path() .   ':' . $cache_unique_uid;
            // Log::info('Cache ID: ' . $cacheId);
            if (config('app.skip_cache')) {
            } else {
                if (Cache::has($cacheId)) {
                    Log::info('Cache hit for ' . $cacheId);
                    $data = Cache::get($cacheId);
                    return response()->json($data);
                } else {
                    Log::info('Cache miss for ' . $cacheId);
                }
            }

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
            $perPage = $request->perPage ?? 100;
            $total = count($result);
            $pages = ceil($total / $perPage);
            $result_page = array_slice($result, ($page - 1) * $perPage, $perPage);
            // Log::info('Total: ' . $total . ' Pages: ' . $pages . ' PerPage: ' . $perPage . ' Page: ' . $page);
            $result_s = [
                'headers' => $columnsToUse,
                'result' => $result_page ?? [],
                'total' => $total,
                'totalPages' => $pages,
                'perPage' => $perPage,
                'page' => $page,
                'orgs' => $orgUnitIds,
            ];
            // cache the result; expires in 2 hours
            if ($result_s && !config('app.skip_cache')) {
                $cached = Cache::put($cacheId, $result_s, now()->addHours(2));
                if (!$cached) {
                    Log::error('<SubmissionsController->getData(): Could not cache data');
                }
            }
            return response()->json($result_s);
        } catch (Exception $ex) {
            // Log::error('Could not fetch data: ' . $ex->getMessage());
            Log::error('<SubmissionsController->getData(): Could not fetch data: ' . $ex->getMessage());
            Log::error($ex);
            Log::error('</SubmissionsController->getData()');
            return response()->json(['Message' => 'Could not fetch data: ' . $ex->getMessage()], 500);
        }
    }









    public function getSPIData(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_spi_report'])) {
            return response()->json(['Message' => 'Not allowed to view spi report: '], 500);
        }
        $columnsToUse = [
            'SubmissionDate', 'start', 'note136', 'nameoftheregion', 'partner', 'otherpartner', 'mysites_county', 'mysites_subcounty', 'mysites_facility', 'mysites', 'affiliation', 'otheraffiliation', 'dateofsubmission', 'baselinefollowup', 'followup', 'otherFollowup', 'Section-foreachquestion', 'Section-Section1-providers_undergone_training', 'Section-Section1-comments1', 'Section-Section1-training_certificates_available', 'Section-Section1-comments2', 'Section-Section1-refresher_training', 'Section-Section1-comments3', 'Section-Section1-picture1', 'Section-Section1-image1', 'Section-sec1calc', 'Section-sec1percentage', 'Section-sec1sum', 'Section-Section2-attended_support_supervision', 'Section-Section2-comments4', 'Section-Section2-provider_self_assessment', 'Section-Section2-comments5', 'Section-Section2-client_satisfaction_survey_done', 'Section-Section2-comments6', 'Section-Section2-observed_practice', 'Section-Section2-comments7', 'Section-Section2-scmlcsupport', 'Section-Section2-comments8', 'Section-Section2-cmlcsupport', 'Section-Section2-comments9', 'Section-Section2-picture2', 'Section-Section2-image2', 'Section-sec2calc', 'Section-sec2percentage', 'Section-sec2sum', 'Section-Section3-HIV_testing_area', 'Section-Section3-comments10', 'Section-Section3-sufficient_space', 'Section-Section3-comments11', 'Section-Section3-confidentiality', 'Section-Section3-comments12', 'Section-Section3-clean_testing_area', 'Section-Section3-comments13', 'Section-Section3-sufficient_lighting', 'Section-Section3-comments14', 'Section-Section3-secure_storage', 'Section-Section3-comments15', 'Section-Section3-picture3', 'Section-Section3-image3', 'Section-sec3calc', 'Section-sec3percentage', 'Section-sec3sum', 'Section-Section4-running_water', 'Section-Section4-comments16', 'Section-Section4-soap', 'Section-Section4-comments17', 'Section-Section4-wastesegregationfacility', 'Section-Section4-comments18', 'Section-Section4-segregationonsite', 'Section-Section4-comments19', 'Section-Section4-pep_protocols', 'Section-Section4-comments20', 'Section-Section4-pep_protocols_followed', 'Section-Section4-comments21', 'Section-Section4-picture4', 'Section-Section4-image4', 'Section-sec4calc', 'Section-sec4percentage', 'Section-sec4sum', 'Section-Section5-job_aides_infectious_waste', 'Section-Section5-comments22', 'Section-Section5-bloodspills', 'Section-Section5-comments23', 'Section-Section5-job_aides_nationalalgo', 'Section-Section5-comments24', 'Section-Duokit_used', 'Section-subsec5-Duokit_jobaide', 'Section-subsec5-comments25', 'Section-subsec5-Determine_jobaide', 'Section-subsec5-comments26', 'Section-subsec5-FirstResponce_jobaide', 'Section-subsec5-comments27', 'Section-subsec5-expirationdate', 'Section-subsec5-comments28', 'Section-subsec5-testkitskeptwell', 'Section-subsec5-comments29', 'Section-subsec5-newconsignmentQC', 'Section-subsec5-comments30', 'Section-subsec5-newkitlotQC', 'Section-subsec5-comments31', 'Section-subsec5-monthlyQC', 'Section-subsec5-comments32', 'Section-subsec5-qc_recorded', 'Section-subsec5-comments33', 'Section-subsec5-stepstocorrect_invalid_QC', 'Section-subsec5-comments34', 'Section-subsec5-picture5', 'Section-subsec5-image5', 'Section-sec5calc', 'Section-sec5percentage', 'Section-sec51calc', 'Section-sec51percentage', 'Section-sec5sum', 'Section-sec51sum', 'Section-Section6-hts_algorithmfollowed', 'Section-Section6-comments35', 'Section-Section6-duokit_algo_followed', 'Section-Section6-comments36', 'Section-Section6-samplecollection', 'Section-Section6-comments37', 'Section-Section6-Determine_algo', 'Section-Section6-comments38', 'Section-Section6-Duokit_procedure', 'Section-Section6-comments39', 'Section-Section6-FirstResponce_algo', 'Section-Section6-comments40', 'Section-Section6-timersavailable', 'Section-Section6-comments41', 'Section-Section6-timersused', 'Section-Section6-comments42', 'Section-Section6-resultsinterpreted', 'Section-Section6-comments43', 'Section-Section6-retesting', 'Section-Section6-comments64', 'Section-Section6-retestingrecord', 'Section-Section6-comments65', 'Section-Section6-picture6', 'Section-Section6-image6', 'Section-sec6calc', 'Section-sec6percentage', 'Section-sec61calc', 'Section-sec61percentage', 'Section-sec6sum', 'Section-sec61sum', 'Section-Section7-Qc_records_review', 'Section-Section7-comments44', 'Section-Section7-registeravailable', 'Section-Section7-comments45', 'Section-Section7-qualityelements', 'Section-Section7-comments46', 'Section-Section7-elementscapturedcorrectly', 'Section-Section7-comments47', 'Section-Section7-summaryavailable', 'Section-Section7-comments48', 'Section-Section7-invalid_results', 'Section-Section7-comments49', 'Section-Section7-invalid_repeated', 'Section-Section7-comments50', 'Section-Section7-client_docs_stored', 'Section-Section7-comments51', 'Section-Section7-secure_doc_storage', 'Section-Section7-comments52', 'Section-Section7-properly_labelled', 'Section-Section7-comments53', 'Section-Section7-picture7', 'Section-Section7-image7', 'Section-sec7calc', 'Section-sec7percentage', 'Section-sec7sum', 'Section-Section8-allprovidersenrolled', 'Section-Section8-comments54', 'Section-Section8-providerstestPT', 'Section-Section8-comments55', 'Section-Section8-resultssubmittedonline', 'Section-Section8-comments56', 'Section-Section8-feedbackreceived', 'Section-Section8-comments57', 'Section-Section8-feedbackreviewed', 'Section-Section8-comments58', 'Section-Section8-feedbackreportfilled', 'Section-Section8-comments59', 'Section-Section8-providerscorrectiveaction', 'Section-Section8-comments60', 'Section-Section8-technicalsupervision', 'Section-Section8-comments61', 'Section-Section8-retrainingdone', 'Section-Section8-comments62', 'Section-Section8-feedbackdocumented', 'Section-Section8-comments63', 'Section-Section8-picture8', 'Section-Section8-image8', 'Section-sec8calc', 'Section-sec8percentage', 'Section-sec8sum', 'Section-sec9calc', 'Section-sec9percentage', 'Section-sec91calc', 'Section-sec91percentage', 'Section-levels-sec9sum', 'Section-levels-sec91sum', 'Section-levels-lessthan40', 'Section-levels-lessthan59', 'Section-levels-lessthan79', 'Section-levels-lessthan89', 'Section-levels-lessthan100', 'Section-levels-lessthan401', 'Section-levels-lessthan591', 'Section-levels-lessthan791', 'Section-levels-lessthan891', 'Section-levels-lessthan1001', 'Section-Section9-numbertesters', 'Section-Section9-auditlength', 'Section-Section9-sectionsummary', 'Section-Section9-repeat-sectionno', 'Section-Section9-repeat-Non-conformity', 'Section-Section9-repeat-CorrectionType', 'Section-Section9-repeat-Recommentations', 'Section-Section9-repeat-comments1', 'Section-Section9-nameoftheauditor', 'Section-Section9-sitesuperviser', 'Section-Section9-comments3', 'Section-Section9-datefinal', 'picture9', 'image9', 'getgprs-Latitude', 'getgprs-Longitude', 'getgprs-Altitude', 'getgprs-Accuracy', 'end', 'meta-instanceID', 'KEY', 'SubmitterID', 'SubmitterName', 'AttachmentsPresent', 'AttachmentsExpected', 'Status'
        ];
        try {
            // cache key format = 'method:path:uniqueid'
            $cache_unique_uid = md5($request->path() . json_encode($request->all()));
            $cacheId = strtolower($request->method()) . ':' . $request->path() .   ':' . $cache_unique_uid;
            // Log::info('Cache ID: ' . $cacheId);


            // if (config('app.skip_cache')) {
            // } else {
            //     if (Cache::has($cacheId)) {
            //         Log::info('Cache hit for ' . $cacheId);
            //         $data = Cache::get($cacheId);
            //         return response()->json($data);
            //     } else {
            //         Log::info('Cache miss for ' . $cacheId);
            //     }
            // }
            $odkObj0 = new ODKDataAggregator;
            $orgTimeline = $request->orgTimeline;
            $orgUnitIds = $request->orgUnitIds;
            // <partners
            $partners = $request->partners;
            $aggregate_partners = $request->aggregate_partners ?? false;
            if ($partners != null && $partners != '') {
                // foreach partner, get the orgs and overwrite the orgUnitIds
                $partnerous = [];
                $partner_sites = [];
                foreach ($partners as $partner) {
                    $ptnr = Partner::find($partner);
                    if ($ptnr != null) {
                        $ptnr_ous = PartnerOrgUnits::where('partner_id', $partner)->pluck('org_unit_id')->toArray();
                        $partnerous = array_merge($partnerous, $ptnr_ous);
                    }
                }
                // $orgUnitIds = $partner_ous;
                foreach ($partnerous as $ouid) {
                    $ou = OdkOrgunit::where('org_unit_id', $ouid)->first();
                    // 77777777
                    if ($ou) {
                        // check ou level. If level is less than 4, loop through all children till you get level 4 children and add them to the partner_sites array
                        if ($ou->level < 4) {
                            $children = $ou->children()->get();
                            // $children = OdkOrgunit::where('parent_id', $ou->org_unit_id)->get();
                            foreach ($children as $child) {
                                if ($child->level == 4) {
                                    array_push($partner_sites, $child);
                                } else {
                                    $grand_children = $child->children()->get();
                                    foreach ($grand_children as $grand_child) {
                                        if ($grand_child->level == 4) {
                                            array_push($partner_sites, $grand_child);
                                        } else {
                                            $great_grand_children = $grand_child->children()->get();
                                            foreach ($great_grand_children as $great_grand_child) {
                                                if ($great_grand_child->level == 4) {
                                                    array_push($partner_sites, $great_grand_child);
                                                } else {
                                                    $great_great_grand_children = $great_grand_child->children()->get();
                                                    foreach ($great_great_grand_children as $great_great_grand_child) {
                                                        if ($great_great_grand_child->level == 4) {
                                                            array_push($partner_sites, $great_great_grand_child);
                                                        } else {
                                                            $great_great_great_grand_children = $great_great_grand_child->children()->get();
                                                            foreach ($great_great_great_grand_children as $great_great_great_grand_child) {
                                                                if ($great_great_great_grand_child->level == 4) {
                                                                    array_push($partner_sites, $great_great_great_grand_child);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            array_push($partner_sites, $ou);
                        }
                    }
                    // 77777777
                }

                // Log::info('partner_sites: '.json_encode($partner_sites));
                // Log::info('partnerous: '.json_encode($partnerous));

                // reduce partner_sites to ids only
                $partner_sites_ids = array();
                foreach ($partner_sites as $partner_site) {
                    array_push($partner_sites_ids, $partner_site->org_unit_id);
                }
                $orgUnitIds = $partner_sites_ids;
            }
            // partners/>
            $siteType = $request->siteType;
            $startDate = $request->startDate;
            $endDate = $request->endDate;

            /////////

            $recordsReadData = [];
            $payload = [];
            if (isset($siteTypes) && !empty($siteTypes)) {
                $payload = array();
                for ($x = 0; $x < count($siteTypes); $x++) {
                    [$recordsReadData, $payld] = $this->getDataLoopOrgs( $orgUnitIds, $recordsReadData, $partners );
                    $payload[] = $payld;
                }
            } else {
                [$recordsReadData, $payload] = $this->getDataLoopOrgs( $orgUnitIds, $recordsReadData, $partners );
            }

            $resultx = array_values($payload);
            $result = $resultx[0] ?? [];
            $page = $request->page ?? 1;
            $perPage = $request->perPage ?? 100;
            $total = count($result);
            $pages = ceil($total / $perPage);
            $result_page = array_slice($result, ($page - 1) * $perPage, $perPage);
            $result_s = [
                'headers' => $columnsToUse,
                'result' => $result_page ?? [],
                'total' => $total,
                'totalPages' => $pages,
                'perPage' => $perPage,
                'page' => $page,
                'orgs' => $orgUnitIds,
            ];
            // cache the result; expires in 2 hours
            if ($result_s && !config('app.skip_cache')) {
                $cached = Cache::put($cacheId, $result_s, now()->addHours(2));
                if (!$cached) {
                    Log::error('<SpiReportController->getSPIData(): Could not cache data');
                }
            }
            return response()->json($result_s);

            /////////
        } catch (Exception $ex) {

            Log::error('<SpiReportController->getSPIData(): Could not fetch data: ' . $ex->getMessage());
            Log::error($ex);
            Log::error('</SpiReportController->getSPIData()');
            return response()->json(['Message' => 'Could not fetch data: ' . $ex->getMessage()], 500);
        }
    }










    private function getDataLoopOrgs(
        $orgUnitIds,
        $recordsReadData,
        $partners
        // , $aggregate_partners
    ) {
        $payload = array();
        for ($x = 0; $x < count($orgUnitIds); $x++) {
            try {
                $odkUtils = new ODKUtils();
                $orgMeta = $odkUtils->getOrgsByLevel($orgUnitIds[$x]);
                $orgToProcess = $orgMeta[0];
                $level = $orgMeta[1];

                [$orgUnit,  $orgUnitName] = $odkUtils->getOrgUnitHierachyNames($orgToProcess, $level);

                $orgUnit['org_unit_id'] = $orgUnitIds[$x];
                $orgUnit['partners'] = $partners ?? null;

                $records = null;

                if (array_key_exists($orgUnit['org_unit_id'], $recordsReadData)) {
                    $records = $recordsReadData[$orgUnit['org_unit_id']];
                } else {
                    $records = $this->getFormRecords($orgUnit);
                    $recordsReadData[$orgUnit['org_unit_id']] = $records;
                }
                // $facils = $this->getFacilities($orgUnit, $records);
                // Log::info('Processing records '. json_encode(array_keys($records[0])) . ' for ' . $orgUnitName);
                $facils = [];
                $sites = [];
                $facilityCount = 0;
                $siteCount = 0;
                if (isset($records) && count($records) > 0) {
                    foreach ($records as $record) {
                        $facil = $record['mysites_facility'];
                        if (!empty($facil) && $facil != '' && !in_array($facil, $facils)) {
                            $facils[] = $facil;
                        }
                    }
                }
                if (count($facils) > 0) {
                    foreach ($facils as $facil) {
                        $facil_mfl = explode("_", $facil)[0];
                        if (!empty($facil_mfl) && $facil_mfl != '') {
                            $ou = OdkOrgunit::where('odk_unit_name', 'like', $facil_mfl . '_%')->first();
                            if (!empty($ou)) {
                                $facilityCount++;
                                $ch = $ou->children()->pluck('org_unit_id');
                                $sites = array_merge($sites, $ch->toArray());
                            }
                        }
                    }
                    $sites = array_unique($sites);
                    $siteCount = count($sites);
                }
                $payload[$orgUnitIds[$x]] = $records;
            } catch (Exception $ex) {
                Log::error($ex);
            }
        }

        return [$recordsReadData, $payload];
    }




    private function getFormRecords($orgUnit)
    {
        $levelObj = OdkOrgunit::select("level")->where('org_unit_id', $orgUnit['org_unit_id'])->first();
        $level = $levelObj->level;
        $fileName = null;

        if ($level == 1) {
            $combinedRecords = [];
            $submissionOrgUnitmap = FormSubmissions::select("project_id", "form_id")
                ->where('form_id', 'like', "spi%") // for spi data
                ->get();
            foreach ($submissionOrgUnitmap as $mapping) {
                $projectId = $mapping->project_id;
                $formId = $mapping->form_id;
                $fileName = $this->getFileToProcess($projectId, $formId);
                $perCountyRecords = $this->getSingleFileRecords($fileName);
                if ($perCountyRecords) {
                    $combinedRecords = array_merge($combinedRecords, iterator_to_array($perCountyRecords, true));
                }
            }
            return $combinedRecords;
        } else if ($level == 2) { // Form Submissions table maps orgid at county level to form id

            $odkUtils = new ODKUtils();
            [$projectId, $formId] = $odkUtils->getFormFormdProjectIds($orgUnit, "spi%");

            $fileName = $this->getFileToProcess($projectId, $formId);
        } else {
            $odkUtils = new ODKUtils();
            [$projectId, $formId] = $odkUtils->getFormFormdProjectIds($orgUnit, "spi%");
            $fileName = $this->getFileToProcess($projectId, $formId);
        }

        if ($level != 1) {
            return $this->getSingleFileRecords($fileName);
        }
    }


    private function getFileToProcess($projectId, $formId)
    {
        $filePath = "submissions/" . $projectId . "_" . $formId . "_submissions.csv";
        return $filePath;
    }



    private function getSingleFileRecords($fileName)
    {
        $url = "";

        if (Storage::exists($fileName)) {
            $url = Storage::path($fileName);
        } else {
            return 0;
        }
        $csv = Reader::createFromPath($url, 'r');
        $csv->setHeaderOffset(0); //set the CSV header offset
        $stmt = Statement::create();
        $records = $stmt->process($csv);
        return $records;
    }
}

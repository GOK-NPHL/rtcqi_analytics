<?php

namespace App\Services;

use App\DwhHtsEncounterData;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DWHHTSDataFetcher
{
    // auth 2
    protected $client_id;
    protected $client_secret;
    protected $scope;
    protected $authDwhUrl;

    protected $dataDwhUrl;

    // query params
    protected $pageNumber;
    protected $pageSize;

    // TODO: filters
    protected $county;
    protected $subCounty;
    protected $testMonth;

    protected $accessToken;
    protected $tokenExpires;


    public function __construct()
    {
        $this->client_id = config('app.DWH_CLIENT_ID');
        $this->client_secret = config('app.DWH_CLIENT_SECRET');
        $this->scope = config('app.DWH_SCOPE');
        $this->authDwhUrl = 'https://auth2.kenyahmis.org:8443/connect/token';
        $this->tokenExpires = 3500;
        $this->dataDwhUrl = 'https://data.kenyahmis.org:9783/api/Dataset?code=HTS&name=HtsTests';

        $this->pageNumber = 1;
        $this->pageSize = 250;

        $this->getAccessToken();

        // TODO: create a new DwhDataPullJob (model), STATUS = 'PENDING'
    }

    private function getAccessToken()
    {
        // Log::info("DWH auth2 url: " . $this->authDwhUrl);
        // Log::info("DWH client id: " . $this->client_id);

        return Cache::remember('oauth2_access_token', $this->tokenExpires, function () {
            $response = Http::asForm()->post($this->authDwhUrl, [
                'grant_type' => 'client_credentials',
                'client_id' => $this->client_id,
                'client_secret' => $this->client_secret,
            ]);

            if ($response->failed()) {
                throw new \Exception('Failed to obtain access token: ' . $response->body());
            }

            $data = $response->json();
            Log::info("DWH auth response: " . json_encode($data));
            $this->accessToken = $data['access_token'];
            $this->tokenExpires = $data['expires_in'] - 100;
            $this->scope = $data['scope'];
            return $data['access_token'];
        });
    }

    public function fetchData($period = null)
    {
        try {
            $dataDwhUrl = $this->dataDwhUrl;
            $dataDwhUrl .= '&pageNumber=' . $this->pageNumber;
            if ($period) {
                $period = date('Y-m-01', strtotime($period));
                $dataDwhUrl .= '&startTestDate=' . $period;
                // seems to only work with a page size of 50
                $this->pageSize = 50;
            }
            $dataDwhUrl .= '&pageSize=' . $this->pageSize;
            // echo("DWHHTSDataFetcher->fetchData:: Fetching page $this->pageNumber\n");
            echo("DWHHTSDataFetcher->fetchData:: url $dataDwhUrl\n");
            $token = Cache::get('oauth2_access_token') ?? $this->accessToken;
            if (!$token) {
                Log::error("DWHHTSDataFetcher->fetchData:: DWH access token not found. Refreshing...\n");
                echo("DWHHTSDataFetcher->fetchData:: DWH access token not found. Refreshing...\n");
                $this->getAccessToken();
                $token = Cache::get('oauth2_access_token') ?? $this->accessToken;
            }
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->get($dataDwhUrl);
            if ($response->successful()) {
                $dataDwh = $response->json();
                // $this->pageNumber = $dataDwh['pageNumber'];// + 1;
                Log::info("DWHHTSDataFetcher->fetchData:: Page $this->pageNumber  / " . $dataDwh['pageCount'] . " DWH data fetched successfully\n");
                if (!is_array($dataDwh['extract']) || empty($dataDwh['extract'])) {
                    Log::error("DWHHTSDataFetcher->fetchData:: DWH data count = 0. Terminating...\n");
                    echo("DWHHTSDataFetcher->fetchData:: DWH data count = 0. Terminating...\n");
                    throw new Exception("DWH data count = 0. Terminating...\n");
                }
                // if $dataDwh['pageNumber'] is not equal to the last page number, recurse
                $this->saveDataDwh($dataDwh);
                if ($dataDwh['pageNumber'] < $dataDwh['pageCount']) {
                    $this->pageNumber = $dataDwh['pageNumber'] + 1;
                    $this->fetchData($period = null);
                } else {
                    echo("DWHHTSDataFetcher->fetchData:: ALL_PAGES DWH data fetched successfully\n");
                    // DwhDataPullJob->status = 'SUCCESS'
                }

            } else {
                // if token expired, get new token and retry
                if ($response->status() == 401) {
                    Log::error("DWH access token expired. Refreshing token.");
                    $this->getAccessToken();
                    $this->fetchData($period = null);
                }
                // DwhDataPullJob->status = 'FAILED', page = $this->pageNumber
                echo("DWH data fetch failed: " . $response->status() . "\n");
                Log::error("DWH data fetch failed");
                throw new Exception("DWH data fetch failed: " . json_encode($response->body()));
            }
        } catch (Exception $ex) {
            echo("DWHHTSDataFetcher->fetchData() failed: " . $ex->getMessage() . "\n");
            Log::error("<DWHHTSDataFetcher->fetchData()> Error fetching DWH data: " . $ex->getMessage());
            Log::error($ex);
            // throw new Exception("<DWHHTSDataFetcher->fetchData()> Error fetching DWH data: " . $ex->getMessage());
        }
    }

    public function saveDataDwh($dataPack)
    {
        try {

            $dataDwh = $dataPack['extract'] ?? [];
            echo ("Saving " . count($dataDwh) . " DWH data records: Page " . $dataPack['pageNumber'] . "\n");
            if (!is_array($dataDwh) || empty($dataDwh)) {
                echo("DWH data count = 0\n");
                Log::error("DWH data count = 0");
                throw new Exception("DWH data count = 0");
            }
            echo("Saving " . count($dataDwh) . " DWH data records\n");

            $data2Save = [];
            foreach ($dataDwh as $data) {
                $lat = $data['Latitude'] ?? null;
                $lon = $data['Longitude'] ?? null;
                if (is_string($lat)) $lat = floatval($lat);
                if (is_string($lon)) $lon = floatval($lon);
                $data2Save[] = [
                    'encounter_key'      => $data['Encounter_key'] ?? null,
                    'patient_pk_hash'    => $data['PatientPKHash'] ?? null,
                    'site_code'          => $data['SiteCode'] ?? null,
                    'county'             => $data['County'] ?? null,
                    'sub_county'         => $data['SubCounty'] ?? null,
                    'facility_name'      => $data['Facility_Name'] ?? null,
                    'facility_level'     => $data['Facility_Level'] ?? null,
                    'sdp'                => $data['SDP'] ?? null,
                    'sdp_agency'         => $data['SDP_Agency'] ?? null,
                    'latitude'           => $lat, //$data['Latitude'] ?? null,
                    'longitude'          => $lon, //$data['Longitude'] ?? null,
                    'emr'                => $data['EMR'] ?? null,
                    'test_date'          => $data['TestDate'] ?? null,
                    'test_month'          => isset($data['TestDate']) ? date('Y-m', strtotime($data['TestDate'])) : null,
                    'encounter_id'       => $data['EncounterId'] ?? null,
                    'entry_point'        => $data['EntryPoint'] ?? null,
                    'test_kit_name1'     => $data['TestKitName1'] ?? null,
                    'test_kit_lot_number1' => $data['TestKitLotNumber1'] ?? null,
                    'test_kit_expiry1'   => $data['TestKitExpiry1'] ?? null,
                    'test_result1'       => $data['TestResult1'] ?? null,
                    'test_kit_name2'     => $data['TestKitName2'] ?? null,
                    'test_kit_lot_number2' => $data['TestKitLotNumber2'] ?? null,
                    'test_kit_expiry2'   => $data['TestKitExpiry2'] ?? null,
                    'test_result2'       => $data['TestResult2'] ?? null,
                    'test_kit_name3'     => $data['TestKitName3'] ?? null,
                    'test_kit_lot_number3' => $data['TestKitLotNumber3'] ?? null,
                    'test_kit_expiry3'   => $data['TestKitExpiry3'] ?? null,
                    'test_result3'       => $data['TestResult3'] ?? null,
                    'final_test_result'  => $data['FinalTestResult'] ?? null,
                    'live_row_id'        => $data['LiveRowId'] ?? null,
                    'facility_code'      => $data['FacilityCode'] ?? null,
                    'facility_name_alt'  => $data['FacilityName'] ?? null,
                    'raw_json'           => $data,
                    'meta'               => array(),
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ];
            }

            // DB::table('dwh_hts_encounter_data')->insert($data2Save);
            foreach ($data2Save as $data) {
                try {
                    $record = new DwhHtsEncounterData();
                    $record->fill($data);
                    // Log::info($record->toArray());
                    $record->save();
                } catch (Exception $ex) {
                    Log::error($ex);
                    echo("DWH data RECORD save failed: " . $data['encounter_key'] . " => " . $ex->getMessage() . "\n");
                    throw new Exception("DWH data RECORD save failed: " . $data['encounter_key'] . " => " . $ex->getMessage());
                }
            }
            echo("DWH data saved successfully\n");
        } catch (Exception $ex) {
            Log::error($ex);
            echo("DWH data save failed: " . $ex->getMessage() . "\n");
            throw new Exception("DWH data save failed: " . $ex->getMessage());
        }
    }

    public function getAvailablePeriods()
    {
        try {
            // select distinct test_month from dwh_hts_encounter_data order by test_month desc
            $periods = DwhHtsEncounterData::select('test_month')
                ->distinct()
                ->whereNotNull('test_month')
                ->orderBy('test_month', 'desc')
                ->pluck('test_month')
                ->toArray();
            return $periods;
        } catch (Exception $ex) {
            Log::error($ex);
            echo("DWH getAvailablePeriods failed: " . $ex->getMessage() . "\n");
            throw new Exception("DWH getAvailablePeriods failed: " . $ex->getMessage());
        }
    }
}

<?php 

namespace App\Services;
use Config;
use Illuminate\Support\Facades\Http;


class ODKDataFetcher {

    // private $baseOdkUrl = 'https://172.16.0.82/v1/';
    private $baseOdkUrl = 'https://odk.nphl.go.ke/v1/';

    public function __construct() {
        echo ("construct function was initialized.\n");
    }

    public function fetchData() {
        $autUrl=$this->baseOdkUrl."sessions";
        // echo($autUrl=$this->baseOdkUrl."sessions\n");
        $response = Http::withOptions([
            'verify' => false, //'debug' => true
        ])->post($autUrl, [
            'email' => 'duncanndiithi@gmail.com',
            'password' => 'duncantowers',
        ]);

        $listUserUrl=$this->baseOdkUrl."users/current";
        
        $response = Http::withOptions([
            'verify' => false, 'debug' => true
        ])->withHeaders([
            'Authorization' => 'Bearer '.$response['token'],
        ])->get($listUserUrl);
            
        error_log($response->body());
        return $response;
    }


}

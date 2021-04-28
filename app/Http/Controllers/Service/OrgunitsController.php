<?php

namespace App\Http\Controllers\Service;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\OdkOrgunitMap;

class OrgunitsController extends Controller
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
        Log::info('This is some useful information. fff');
        return view('interface/orgunits/index');
    }

    public function getOrgunits()
    {   
        Log::info('This is some useful information.');
        

        return OdkOrgunitMap::all();
        
    }
}

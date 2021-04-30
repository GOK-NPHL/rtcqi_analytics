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
        $this->middleware('auth:sanctum');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('interface/orgunits/index');
    }

    public function getOrgunits()
    {   
        
        return OdkOrgunitMap::all();
        
    }
}

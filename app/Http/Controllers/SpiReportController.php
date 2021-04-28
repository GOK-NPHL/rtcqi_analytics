<?php

namespace App\Http\Controllers;
use App\Services\ODKDataAggregator;
use Illuminate\Http\Request;

class SpiReportController extends Controller
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
        return view('reports/spi/index');
    }

    public function getData($county,$subcounty,$facility,$site )
    {
        $odkObj = new ODKDataAggregator;
        $result=$odkObj->getData($county,$subcounty,$facility,$site);
        return $result;
    }
}

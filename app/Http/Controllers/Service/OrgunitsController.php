<?php

namespace App\Http\Controllers\Service;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\OdkOrgunit;
use Exception;


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

        return OdkOrgunit::all();
    }

    public function saveOrgunits(Request $request)
    {
        try {
            $organisationUnit = $request->orgunits;
            for ($x = 0; $x < count($organisationUnit); $x++) {
                $orgUnit = new OdkOrgunit([
                    'org_unit_id' => $organisationUnit[$x]['id'],
                    'odk_unit_name' => $organisationUnit[$x]['name'],
                    'level' => $organisationUnit[$x]['level'],
                    'parent_id' => $organisationUnit[$x]['parentId'],

                ]);
                $orgUnit->save();
            }
            return response()->json(['Message' => 'Created successfully'], 200);
        } catch (Exception $ex) {
            Log::error($ex);
            return ['Error' => '500', 'Message' => 'Could not save organisation units: ' . $ex->getMessage()];
        }
    }
}

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SpiReportController;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('odk_data/{county?}/{subcounty?}/{facility?}/{site?}', function (
    $county = null,
    $subcounty = null,
    $facility = null,
    $site = null
) {
    $orgObj = new SpiReportController();
    return $orgObj->getData($county, $subcounty, $facility, $site);
});

Route::get('/org_units', 'Service\OrgunitsController@getOrgunits');
Route::post('/save_orgunits', 'Service\OrgunitsController@saveOrgunits');
Route::put('/update_org', 'Service\OrgunitsController@updateOrg');
Route::delete('/delete_org', 'Service\OrgunitsController@deleteOrg');
Route::put('/add_sub_org', 'Service\OrgunitsController@addSubOrg');

Route::get('/roles', 'Service\RolesController@getRoles');
Route::get('/authorities', 'Service\Authorities@getAuthorities');
Route::post('/save_role', 'Service\RolesController@createRole');
Route::post('/delete_role', 'Service\RolesController@deleteRole');
Route::post('/update_role', 'Service\RolesController@updateRole');

Route::put('/save_user', 'Service\AuthController@register');




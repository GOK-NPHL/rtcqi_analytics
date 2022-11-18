<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



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

Route::post('/odk_data', 'SpiReportController@getData');
Route::post('/odk_hts_data', 'LogbookReportController@getData');

Route::get('/odk_submissions', 'SubmissionsController@getData');
Route::post('/odk_submissions', 'SubmissionsController@getData');

Route::get('/org_units', 'Service\OrgunitsController@getOrgunits');
Route::post('/save_orgunits', 'Service\OrgunitsController@saveOrgunits');
Route::put('/update_org', 'Service\OrgunitsController@updateOrg');
Route::delete('/delete_org', 'Service\OrgunitsController@deleteOrg');
Route::delete('/delete_all_orgs', 'Service\OrgunitsController@deleteAllOrgs');
Route::put('/add_sub_org', 'Service\OrgunitsController@addSubOrg');
Route::post('/update_upload_orgunits', 'Service\OrgunitsController@updateUploadOrgunits');
Route::post('/request_new_orgnit', 'Service\OrgunitsController@requestNewOrgUnit');
Route::get('/get_requested_org_units', 'Service\OrgunitsController@getRequestedOrgnits');

Route::get('/roles', 'Service\RolesController@getRoles');
Route::get('/authorities', 'Service\Authorities@getAuthorities');
Route::get('/user_authorities', 'Service\Authorities@getUserAuthorities');
Route::post('/save_role', 'Service\RolesController@createRole');
Route::post('/delete_role', 'Service\RolesController@deleteRole');
Route::post('/update_role', 'Service\RolesController@updateRole');

Route::put('/save_user', 'Service\AuthController@register');
Route::put('/update_user', 'Service\UsersController@updateUser');
Route::get('/users', 'Service\UsersController@getUsers');
Route::get('/get_user_profile', 'Service\UsersController@getUserProfile');
Route::post('/update_user_profile', 'Service\UsersController@updateUserProfile');
Route::delete('/delete_user', 'Service\UsersController@deleteUser');
Route::get('/users_details', 'Service\UsersController@getUsersDetails');

Route::get('resources/files_all',['as'=>'resources.files', 'uses'=>'ResourceFilesController@getAllFiles']);
Route::get('resources/files_public',['as'=>'resources.files_public', 'uses'=>'ResourceFilesController@getPublicFiles']);
Route::get('resources/files_private',['as'=>'resources.files_private', 'uses'=>'ResourceFilesController@getPrivateFiles']);
Route::delete('resources/files/{id}',['as'=>'resources.delete', 'uses'=>'ResourceFilesController@destroy']);
Route::get('resources/files/download/{id}',['as'=>'resources.download', 'uses'=>'ResourceFilesController@download']);
Route::post('resources/files',['as'=>'resources.store', 'uses'=>'ResourceFilesController@store']);

Route::get('partners',['as'=>'partners', 'uses'=>'PartnerController@getAllPartners']);
Route::get('partners/{id}',['as'=>'partner', 'uses'=>'PartnerController@getPartner']);
Route::get('partners/{id}/users',['as'=>'partner.users', 'uses'=>'PartnerController@getPartnerUsers']);
Route::get('partners/{id}/org_units',['as'=>'partner.orgUnits', 'uses'=>'PartnerController@getPartnerOrgUnits']);
Route::put('partners/{id}/users',['as'=>'partner.mapUsers', 'uses'=>'PartnerController@mapPartnerUsers']);
Route::put('partners/{id}/org_units',['as'=>'partner.mapOrgUnits', 'uses'=>'PartnerController@mapPartnerOrgUnits']);
Route::post('partners',['as'=>'partners.store', 'uses'=>'PartnerController@createPartner']);
Route::put('partners/{id}',['as'=>'partners.update', 'uses'=>'PartnerController@updatePartner']);
Route::delete('partners/{id}',['as'=>'partners.delete', 'uses'=>'PartnerController@deletePartner']);

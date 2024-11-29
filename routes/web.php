<?php

use App\ResourceFiles;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('auth/login', [
        'files' => ResourceFiles::where('is_public', 1)->get()
    ]);
});

Route::get('resources/download_file/{id}', 'Auth\LoginController@downloadFile')->name('download-file');

Auth::routes(['register' => false]);
//Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

Route::get('/reports/pt', 'PTReportController@index')->name('ptIndex');
Route::get('/reports/logbook', 'LogbookReportController@index')->name('logbookIndex');
Route::get('/reports/spi', 'SpiReportController@index')->name('spiIndex');
Route::get('/reports/me', 'MEReportController@index')->name('meIndex');
Route::get('/reports/summaries', 'SummariesReportController@index')->name('summariesIndex');

//Services
Route::get('/submissions', 'SubmissionsController@index')->name('submissionsIndex');
Route::get('/submissions/hts', 'SubmissionsController@index')->name('submissionsIndex');
Route::get('/submissions/spi', 'SubmissionsController@spi')->name('spiSubmissions');


// Certificates
Route::get('/certificates', 'CertificatesController@index')->name('cert_approvals_page');

Route::get('/certificates/dashboard', 'CertificatesController@dashboard')->name('certificate_dashboard');

Route::get('/certificate/view/{certid}', 'CertificatesController@viewCert')->name('view_certificate');

Route::post('/certificates/approve', 'CertificatesController@approve')->name('approve_certificate');


//Services
Route::get('/service/profile', 'Service\UsersController@userProfile')->name('profile');
Route::get('/service/roles', 'Service\RolesController@index')->name('rolesIndex');
Route::get('/service/users', 'Service\UsersController@index')->name('usersIndex');
Route::get('/service/orgunits', 'Service\OrgunitsController@index')->name('orgunitsIndex');
Route::get('/service/requested_orgunits', 'Service\OrgunitsController@requestedOrgunits')->name('requestedOrgunits');

//Files
Route::get('resources', function () {
    return redirect('/resources/files');
})->name('resourcesIndex');

Route::get('resources/files', ['as' => 'resources.files', 'uses' => 'ResourceFilesController@index']);

Route::get('partners', [
    // 'as' => 'partners',
    'uses' => 'PartnerController@index'
])->name('partnersIndex');

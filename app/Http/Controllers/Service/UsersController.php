<?php

namespace App\Http\Controllers\Service;

use App\Http\Controllers\Controller;
use App\OdkOrgunit;
use App\Services\SystemAuthorities;
use App\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class UsersController extends Controller
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
        return view('interface/users/index');
    }

    public function getUsers()
    {
        if (!Gate::allows(SystemAuthorities::$authorities['view_user'])) {
            return response()->json(['Message' => 'Not allowed to view users: '], 500);
        }
        $user = Auth::user();
        $users = User::select(
            "users.name as first_name",
            "users.id as id",
            "users.last_name as last_name",
            "users.email as email",
            "roles.name as role_name",
        )->join('roles', 'roles.id', '=', 'users.role_id')
            ->where('users.id', '<>', $user->id)
            ->get();

        $roleIds = array();
        $payload = array();
        return  $users;
    }

    public function deleteUser(Request $request)
    {
        if (!Gate::allows(SystemAuthorities::$authorities['delete_user'])) {
            return response()->json(['Message' => 'Not allowed to delete users: '], 500);
        }
        try {
            $user = User::find($request->user['id']);
            $user->OdkOrgunit()->sync([]);
            $user->delete();
            return response()->json(['Message' => 'Deleted successfully'], 200);
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Delete failed.  Error code' . $ex->getMessage()], 500);
        }
    }

    public function userProfile()
    {
        return view('interface/users/profile');
    }

    public function getUserProfile()
    {

        $user = Auth::user();
        $registeredOrgs = OdkOrgunit::select(
            "odkorgunit.odk_unit_name"
        )->join('odkorgunit_user', 'odkorgunit_user.odk_orgunit_id', '=', 'odkorgunit.org_unit_id')
            ->join('users', 'users.id', '=', 'odkorgunit_user.user_id')
            ->where('users.id', $user->id)
            ->get();

        return ["first_name" => $user->name, "last_name" => $user->last_name, "email" => $user->email, "orgunits" => $registeredOrgs];
    }
}

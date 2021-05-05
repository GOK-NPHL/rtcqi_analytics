<?php

namespace App\Http\Controllers\Service;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Role;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class RolesController extends Controller
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
        return view('interface/roles/index');
    }

    public function getRoles()
    {
        $roles = Role::select(
            "users.name as editor",
            "roles.name as role_name",
            "roles.updated_at as updated_at",
            "roles.id as role_id",
        )->join('users', 'editor_id', '=', 'users.id')->get();
        return $roles;
    }

    public function createRole(Request $request)
    {
        try {
            $user = Auth::user();
            $role = new Role(['name' => $request->name]);
            $role->editor()->associate($user);
            $role->save();
            $role->authorities()->sync($request->authoritiesSelected, false);
        } catch (Exception $ex) {

            return ['Error' => '500', 'Message' => 'Could not save role ' . $ex->getCode()];
        }
    }

    public function deleteRole(Request $request)
    {
        try {
            $role = Role::find($request->role_id);
            $role->delete();
            return response()->json(['Message' => 'Deleted successfully'], 200);
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Delete failed.  Error code' . $ex->getCode()], 500);
        }
    }
}

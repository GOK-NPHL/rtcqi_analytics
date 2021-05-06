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
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

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
            "authorities.name as authority_name",
            "authorities.id as authority_id",
            "authorities.group as authority_group"
        )->join('users', 'editor_id', '=', 'users.id')
            ->join('authority_role', 'roles.id', '=', 'authority_role.role_id')
            ->join('authorities', 'authorities.id', '=', 'authority_role.authority_id')
            ->get();
        $roleIds = array();
        $payload = array();

        foreach ($roles as $role) {
            if (in_array($role->role_id, $roleIds)) {
                $auths = $payload[$role->role_id]["authorities"];
                if (array_key_exists($role->authority_group, $auths)) {
                    $payload[$role->role_id]["authorities"][$role->authority_group][] = $role->authority_id;
                } else {
                    $payload[$role->role_id]["authorities"][$role->authority_group] = [$role->authority_id];
                }
                [$role->authority_id] = $role->authority_name;
            } else {
                $roleEntry =
                    $payload[$role->role_id] = [
                        "editor" => $role->editor,
                        "role_name" => $role->role_name,
                        "updated_at" => \Carbon\Carbon::parse($role->updated_at)->format('Y-m-d H:i:s'),
                        "role_id" => $role->role_id,
                        "authorities" => [$role->authority_group => [$role->authority_id]]

                    ];
                $roleIds[] = $role->role_id;
            }
        }
        return  $payload;
    }

    public function createRole(Request $request)
    {
        try {
            $user = Auth::user();
            $role = new Role(['name' => $request->name]);
            $role->editor()->associate($user);
            $role->save();
            $role->authorities()->sync($request->authoritiesSelected, false);
            return response()->json(['Message' => 'Created successfully'], 200);
        } catch (Exception $ex) {

            return ['Error' => '500', 'Message' => 'Could not save role ' . $ex->getMessage()];
        }
    }

    public function deleteRole(Request $request)
    {
        try {

            $role = Role::find($request->role_id);
            $userRoleRelationship = $role->users()->get();
            if (count($userRoleRelationship) != 0) {
                return response()->json(['Message' => 'Can\'t delete Role. Role is attached to users'], 500);
            } else {
                $role->authorities()->sync([]);
                $role->delete();
            }
            return response()->json(['Message' => 'Deleted successfully'], 200);
        } catch (Exception $ex) {
            return response()->json(['Message' => 'Delete failed.  Error code' . $ex->getMessage()], 500);
        }
    }

    public function updateRole(Request $request)
    {
        try {
            $user = Auth::user();
            $role = Role::find($request->role_id);
            Log::debug("role name db " . $role->name);
            Log::debug("role name req " . $request->name);
            $role->name = $request->name;
            $role->save();
            Log:
            info("role name updated");
            $role->editor()->associate($user);
            $role->save();
            $role->authorities()->sync($request->authoritiesSelected);
            return response()->json(['Message' => 'Updated successfully'], 200);
        } catch (Exception $ex) {

            return ['Error' => '500', 'Message' => 'Could not save role: ' . $ex->getMessage()];
        }
    }
}

<?php

namespace App\Http\Controllers\Service;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Role;
use App\Services\SystemAuthorities;
use App\UserAllowedRole;
use Exception;
use Illuminate\Support\Facades\Gate;

class AuthController extends Controller
{
    /**
     * API Register
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {

        if (!Gate::allows(SystemAuthorities::$authorities['add_user'])) {
            return response()->json(['Message' => 'Not allowed to add users: '], 500);
        }
        try {
            $validatedData = $request->validate([
                'name' => 'required',
                'email'    => 'unique:users|required',
                'role' => 'required',
                'password' => 'required',
            ]);

            $name = $request->name;
            $email    = $request->email;
            $password = $request->password;
            $role_id = $request->role;

            $role =  Role::find($role_id);
            $user = new User([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password)
            ]);

            $user->role()->associate($role);
            $user->save();
            $user->OdkOrgunit()->sync($request->orgunits, false); //false --> dont delete old entries 
            // user_allowed_roles
            for ($x = 0; $x < count($request->selected_viewable_roles); $x++) {;
                $userAllowedRole = new UserAllowedRole([
                    'user_id' => $user->id,
                    'role_id' => $request->selected_viewable_roles[$x],
                ]);
                $userAllowedRole->save();
            }
            return response()->json(['Message' => 'Created successfully'], 200);
        } catch (Exception $ex) {
            return ['Error' => '500', 'Message' => 'Could not save user ' . $ex->getMessage()];
        }
    }
}

<?php

namespace App\Http\Controllers\Service;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Role;

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

    }
}

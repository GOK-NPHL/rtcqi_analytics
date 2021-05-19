<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\User;
use Illuminate\Support\Facades\Hash;

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
        // $rules = [
        //     'first_name' => 'unique:users|required',
        //     'email'    => 'unique:users|required',
        //     'password' => 'required',
        // ];

        // $input = $request->only('first_name', 'email', 'password');
        // $validator = Validator::make($input, $rules);

        $validatedData = $request->validate([
            'name' => 'required',
            'email'    => 'unique:users|required',
            'password' => 'required',
        ]);

        $name = $request->name;
        $email    = $request->email;
        $password = $request->password;
        $role_id = 0;
        $user     = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role_id' => $role_id
        ]);
    }
}

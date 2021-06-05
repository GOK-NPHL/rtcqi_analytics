<?php

namespace App\Http\Controllers\Service;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Authority;
use Illuminate\Support\Facades\Auth;

class Authorities extends Controller
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


    public function getAuthorities()
    {
        return Authority::all();
    }

    public function getUserAuthorities()
    {
        $user = Auth::user();
        $roles = Authority::select(
            "authorities.name"
        )->join('authority_role', 'authorities.id', '=', 'authority_role.authority_id')
            ->join('roles', 'roles.id', '=', 'authority_role.role_id')
            ->join('users', 'users.role_id', '=', 'roles.id')
            ->where('users.id', $user->id)
            ->get();
        if (count($roles) > 0) {
            return $roles;
        } else {
            return [];
        }
    }
}

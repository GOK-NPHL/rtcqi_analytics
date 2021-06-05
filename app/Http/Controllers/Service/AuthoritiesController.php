<?php

namespace App\Http\Controllers\Service;

use App\Authority;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthoritiesController extends Controller
{
    public function getPermissions()
    { {
            $user = Auth::user();
            $roles = Authority::select(
                "authorities.name "
            )->join('authority_role', 'authorities.id', '=', 'authority_role.authority_id')
                ->join('roles', 'roles.id', '=', 'authority_role.role_id')
                ->join('users', 'role_id', '=', 'roles.id')
                ->where('users.id', $user->id)
                ->get();
            return $roles;
        }
    }
}

<?php

namespace App\Http\Controllers\Service;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Role;
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
        $roles = DB::table('roles')
            ->join('users', 'editor_id', '=', 'users.id')
            ->get();
        return $roles;
    }

    public function createRole(Request $request)
    {
        $user = Auth::user();
        $role = new Role(['name' => $request->name]);
        $role->editor()->associate($user);
        $role->save();
        $role->authorities()->sync($request->authoritiesSelected, false);
    }
}

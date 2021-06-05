<?php

namespace App\Providers;

use App\Services\SystemAuthorities;
use App\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Gate::define(SystemAuthorities::$authorities['view_orgunit'], function ($user) {
            $user = User::select(
                "users.id as id"
            )->join('roles', 'roles.id', '=', 'users.role_id')
                ->join('authority_role', 'roles.id', '=', 'authority_role.role_id')
                ->join('authorities', 'authorities.id', '=', 'authority_role.authority_id')
                ->where('authorities.name', SystemAuthorities::$authorities['view_orgunit'])
                ->get();
            Log::info("the user got");
            Log::info($user);

            if (count($user) != 0) {
                return true;
            } else {
                return false;
            }
        });
    }
}

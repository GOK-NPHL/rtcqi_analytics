<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class SystemAuthorities
{
    public static $authorities = [
        'view_pt_report' => 'view_pt_report',
        'view_orgunit' => 'view_orgunit',
        'view_log_book_report' => 'view_log_book_report',
        'edit_user' => 'edit_user',
        'edit_role' => 'edit_role',
        'edit_orgunit' => 'edit_orgunit',
        'delete_user' => 'delete_user',
        'delete_role' => 'delete_role',
        'delete_orgunit' => 'delete_orgunit',
        'add_user' => 'add_user',
        'add_role' => 'add_role',
        'add_orgunit' => 'add_orgunit',
    ];
}

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
        'submissions_section' => 'submissions_section',
        'view_submissions' => 'view_submissions',

        'view_certificates' => 'view_certificates',
        'approve_certificates' => 'approve_certificates',
        
        'resources_section' => 'resources_section',
        'view_resources' => 'view_resources',
        'manage_resources' => 'manage_resources',
        'partners_section' => 'partners_section',
        'view_partners' => 'view_partners',
        'manage_partners' => 'manage_partners',
        'edit_user' => 'edit_user',
        'view_user' => 'view_user',
        'view_role' => 'view_role',
        'edit_role' => 'edit_role',
        'edit_orgunit' => 'edit_orgunit',
        'delete_user' => 'delete_user',
        'delete_role' => 'delete_role',
        'delete_orgunit' => 'delete_orgunit',
        'add_user' => 'add_user',
        'add_role' => 'add_role',
        'add_orgunit' => 'add_orgunit',
        'view_system_settings' => 'view_system_settings',
        'view_reports' => 'view_reports',
        'view_dashboard' => 'view_dashboard',
        'data_backup' => 'data_backup',
        'view_spi_report' => 'view_spi_report',
        'upload_new_orgunit_structure' => 'upload_new_orgunit_structure',
        'view_users_missing_organisation_units' => 'view_users_missing_organisation_units',
        'view_roles_not_assigned' => 'view_roles_not_assigned',
        'can_request_new_org_unit' => 'can_request_new_org_unit',
        'view_requested_orgunits' => 'view_requested_orgunits',
    ];
}

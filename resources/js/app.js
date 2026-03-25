/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

import './bootstrap';
import '@fortawesome/fontawesome-free/css/all.min.css';

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import './components/dashboard/Dashboard';

import './components/reports/pt/PTReport';

import './components/reports/logbook/LogbookReport';

import './components/reports/spi/SpiReport';
import './components/reports/submissions/HTSSubmissions';
import './components/reports/submissions/SPISubmissions';

import './components/system/resources/Resources';
import './components/system/partners/Partners';

import './components/reports/me/MEReport';

import './components/reports/summaries/SummariesReport';


//Interface code
import './components/system/org-unit/OrgUnits';
import './components/system/org-unit/RequestedOrgUnits';
import './components/system/role/Roles';
import './components/system/users/Users';
import './components/system/users/Profile';
import './components/system/auth/axios_login';

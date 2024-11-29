@extends('layouts.rtcqi')

@section('content')
<div class="container-fluid" style="color: #333;">
    @if (isset($error))
    <div class="alert alert-danger">
        {{ $error }}
    </div>
    @else
    @if (isset($message))
    <div class="alert alert-info">
        {{ $message }}
    </div>
    @endif
    <h1>National HTS Site Certification</h1>
    <h5> {{count($data)}} records</h5>
    <div class="row">
        <div class="col-md-12">
            <div id="CertificationIndex" class="table-responsive">
                <table class="table table-condensed table-bordered" style="font-size: 14px;">
                    <thead>
                        <tr>
                            <!-- <th>ID</th> -->
                            <th>County</th>
                            <th>Subcounty</th>
                            <th>Facility</th>
                            <th>Site</th>
                            <th>Partner</th>
                            <!-- <th>Followup</th> -->
                            <th>Submitted by</th>
                            <th>Submitted on</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($data as $row)
                        <tr>
                            <!-- <td>{{ $row['KEY'] }}</td> -->
                            <td style="text-transform: capitalize;">{{ str_replace('_', ' ', $row['mysites_county']) }}</td>
                            <td style="text-transform: capitalize;">{{ str_replace('_', ' ', $row['mysites_subcounty']) }}</td>
                            <td style="text-transform: capitalize;">{{ str_replace('_', ' ', $row['mysites_facility']) }}</td>
                            <td style="text-transform: uppercase;">{{ str_replace('_', ' ', $row['mysites']) }}</td>
                            @if ($row['otherpartner'] != '')
                            <td style="text-transform: capitalize;">{{ str_replace('_', ' ', $row['otherpartner']) }}</td>
                            @else
                            <td style="text-transform: capitalize;">{{ str_replace('_', ' ', $row['partner']) }}</td>
                            @endif
                            <!-- <td>{{ str_replace('_', ' ', $row['initialfollowup']) }}</td> -->
                            <td>{{ str_replace('_', ' ', $row['SubmitterName']) }}</td>
                            <td>{{ str_replace('_', ' ', $row['dateofsubmission']) }}</td>
                            <td>
                                <!-- if the record is approved, show the view-certificate button -->
                                @if (in_array($row['KEY'], $approved_certs))
                                <a href="{{ route('view_certificate', ['certid' => $row['KEY']]) }}" class="btn btn-primary btn-sm">View Certificate</a>
                                <!-- else if the current user has approve_certificates authority, show the approval dialog/modal -->
                                @else
                                @if (Gate::allows('approve_certificates'))
                                <!-- use window.confirm() to show the modal -->
                                <button type="button" onclick="approveCertificateBox(`{{ $row['KEY'] }} | {{$row['mysites_facility']}} | {{$row['mysites']}}`)" class="btn btn-link btn-sm" style="padding: 2px 3px;">Approve certificate</button>
                                @endif
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @endif
</div>

@if (Gate::allows('approve_certificates'))
<div class="modal fade" id="modal_certapproval_dialog" tabindex="-1" role="dialog" aria-labelledby="modal_certapproval_Label" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal_certapproval_Label">Approve Certification</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to approve this certification <span id="approvalbox_facilityname"></span>?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <form id="approveCertForm" action="{{ route('approve_certificate') }}" method="post">
                    @csrf
                    <input type="hidden" name="status" value="Approved">
                    <input type="hidden" name="certid" id="certid_fld">
                    <input type="hidden" name="facility" id="facility_fld">
                    <input type="hidden" name="site" id="site_fld">
                    <button type="submit" class="btn btn-primary">Approve</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
    function approveCertificateBox(str) {
        const [id, facility, site] = str.split(' | ');
        $('#approvalbox_facilityname').html(' for <u style="text-transform: capitalize;">' + facility.replaceAll('_', ' ') + '</u>');
        $('#modal_certapproval_dialog').modal('show');
        $('#certid_fld').val(id);
        $('#facility_fld').val(facility);
        $('#site_fld').val(site);
    }
</script>
@endif
@endsection
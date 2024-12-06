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
            <h5> {{ count($data) }} records</h5>
            <div class="row">
                <input type="hidden" id="data_json" value="{{ json_encode($data) }}">
                <div class="col-md-12" id="CertificationIndex">
                    <table class="" id="assessmentDataTable" style="font-size: 13px;">
                        <thead>
                            <tr>
                                <!-- <th>ID</th> -->
                                <th>&nbsp;</th>
                                <th>County</th>
                                <th>Subcounty</th>
                                <th>Facility</th>
                                <th>Site</th>
                                <th>Partner</th>
                                <!-- <th>Followup</th> -->
                                <!-- <th>Submitted by</th> -->
                                {{-- <th>Score per section</th> --}}
                                <th>Submitted on</th>
                                <th>Overall Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($data as $row)
                                <tr>
                                    <!-- <td>{{ $row['KEY'] }}</td> -->
                                    <td class="toggleDetail" data-id="{{ $row['KEY'] }}"><span
                                            data-id="{{ $row['KEY'] }}"><i id="icon:{{ $row['KEY'] }}"
                                                data-id="{{ $row['KEY'] }}" class="fas fa-plus-square"></i></span></td>
                                    <td style="text-transform: capitalize;">
                                        {{ str_replace('_', ' ', $row['mysites_county']) }}</td>
                                    <td style="text-transform: capitalize;">
                                        {{ str_replace('_', ' ', $row['mysites_subcounty']) }}</td>
                                    <td style="text-transform: capitalize;">
                                        {{ str_replace('_', ' ', $row['mysites_facility']) }}</td>
                                    <td style="text-transform: uppercase;">{{ str_replace('_', ' ', $row['mysites']) }}
                                    </td>
                                    @if ($row['otherpartner'] != '')
                                        <td style="text-transform: capitalize;">
                                            {{ str_replace('_', ' ', $row['otherpartner']) }}</td>
                                    @else
                                        <td style="text-transform: capitalize;">
                                            {{ str_replace('_', ' ', $row['partner']) }}
                                        </td>
                                    @endif
                                    <!-- <td>{{ str_replace('_', ' ', $row['initialfollowup']) }}</td> -->
                                    <!-- <td>{{ str_replace('_', ' ', $row['SubmitterName']) }}</td> -->
                                    <td>{{ str_replace('_', ' ', $row['dateofsubmission']) }}</td>
                                    <td style="font-weight: bold;"
                                        class="{{  $row['Section-sec91percentage'] >= 90 ? 'bg-success' : '' }}">
                                        {{ round($row['Section-sec91percentage'], 2) }}%</td>
                                    <td>
                                        @if ($row['Section-sec91percentage'] >= 90)
                                            <!-- if the record is approved, show the view-certificate button -->
                                            @if (in_array($row['KEY'], $approved_certs))
                                                <a href="{{ route('view_certificate', ['certid' => $row['KEY']]) }}"
                                                    class="btn btn-primary btn-sm">View Certificate</a>
                                                <!-- else if the current user has approve_certificates authority, show the approval dialog/modal -->
                                            @else
                                                @if (Gate::allows('approve_certificates'))
                                                    <!-- use window.confirm() to show the modal -->
                                                    <button type="button"
                                                        onclick="approveCertificateBox(`{{ $row['KEY'] }} | {{ $row['mysites_facility'] }} | {{ $row['mysites'] }}`)"
                                                        class="btn btn-link btn-sm" style="padding: 2px 3px;">Approve
                                                        certificate</button>
                                                @endif
                                            @endif
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        @endif
    </div>

    @if (Gate::allows('approve_certificates'))
        <div class="modal fade" id="modal_certapproval_dialog" tabindex="-1" role="dialog"
            aria-labelledby="modal_certapproval_Label" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modal_certapproval_Label">Approve Certification</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to approve this certification <span id="approvalbox_facilityname"></span>?
                        </p>
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
                $('#approvalbox_facilityname').html(' for <u style="text-transform: capitalize;">' + facility.replaceAll('_',
                    ' ') + '</u>');
                $('#modal_certapproval_dialog').modal('show');
                $('#certid_fld').val(id);
                $('#facility_fld').val(facility);
                $('#site_fld').val(site);
            }
        </script>
    @endif
    <script>
        function format(data) {
            let rslt = [];
            rslt.push(data['Section-sec0percentage'] || "0.0");
            rslt.push(data['Section-sec1percentage'] || "0.0");
            rslt.push(data['Section-sec2percentage'] || "0.0");
            rslt.push(data['Section-sec3percentage'] || "0.0");
            rslt.push(data['Section-sec4percentage'] || "0.0");
            rslt.push(data['Section-sec51percentage'] || "0.0");
            rslt.push(data['Section-sec61percentage'] || "0.0");
            rslt.push(data['Section-sec7percentage'] || "0.0");
            rslt.push(data['Section-sec8percentage'] || "0.0");
            rslt.push(data['Section-sec9percentage'] || "0.0");
            return '<div class="rowz"><div class="col-md-6"><table class="table table-bordered" style="background-color: #f2f2f2;">' +
                '<thead>' +
                '<tr>' +
                '<th style="padding: 0 5px; text-align: center;">Section</th>' +
                '<th style="padding: 0 5px; text-align: center;">Score</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr>' +
                '<td style="padding:2px 5px; text-align: center;">Personnel Training &amp; Certification</td>' +
                '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[0]).toFixed(2) + '%</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="padding:2px 5px; text-align: center;">Physical Facility</td>' +
                '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[1]).toFixed(2) + '%</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="padding:2px 5px; text-align: center;">Safety</td>' +
                '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[2]).toFixed(2) + '%</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="padding:2px 5px; text-align: center;">Pre-Testing Phase</td>' +
                '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[3]).toFixed(2) + '%</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="padding:2px 5px; text-align: center;">Testing Phase</td>' +
                '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[4]).toFixed(2) + '%</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="padding:2px 5px; text-align: center;">Post-Testing Phase</td>' +
                '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[5]).toFixed(2) + '%</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="padding:2px 5px; text-align: center;">External Quality Assurance</td>' +
                '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[6]).toFixed(2) + '%</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="padding:2px 5px; text-align: center;">Retesting for Inconclusive & Verification of HIV SERO+ve Results</td>' +
                '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[7]).toFixed(2) + '%</td>' +
                '</tr>' +
                // '<tr>' +
                // '<td style="padding:2px 5px; text-align: center;">Sec8</td>' +
                // '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[8]).toFixed(2) + '%</td>' +
                // '</tr>' +
                // '<tr>' +
                // '<td style="padding:2px 5px; text-align: center;">Sec9</td>' +
                // '<td style="padding:2px 5px; text-align: center;">' + parseFloat(rslt[9]).toFixed(2) + '%</td>' +
                // '</tr>' +
                '</tbody>' +
                '</table></div></div>';
        }
        document.addEventListener('DOMContentLoaded', function() {
            let table = new DataTable('#assessmentDataTable', {
                pageLength: 20,
                lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]]
            });
            let data = JSON.parse(document.getElementById('data_json').value);

            // expandable row to show sec0 - sec8 scores
            table.on('click', 'td.toggleDetail', function(e) {
                // get attribute data-id
                let id = e.target.getAttribute('data-id');


                let tr = e.target.closest('tr');
                let row = table.row(tr);
                let icon = document.getElementById('icon:' + id);

                if (row.child.isShown()) {

                    // This row is already open - close it
                    if (icon) {
                        icon.classList.remove('fa-minus-square');
                        icon.classList.add('fa-plus-square');
                    }
                    row.child.hide();
                } else {
                    if (icon) {
                        icon.classList.remove('fa-plus-square');
                        icon.classList.add('fa-minus-square');
                    }
                    // Open this row
                    if (id == null) return;
                    let row_data = data?.find(x => x.KEY == id);
                    row.child(format(row_data)).show();
                }
            });

        });
    </script>
@endsection

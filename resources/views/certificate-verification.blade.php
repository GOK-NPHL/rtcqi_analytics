@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div id="certificate-verification">
        @if (isset($error))
            <div class="alert alert-danger">
                {{ $error }}
            </div>
        @else
            <div class="row">
                <div class="col-md-12">
                    <h2 class="text-center">RTCQI Certificate Verification</h2>
                    @if (!$certDetails)
                        <div class="alert alert-danger">
                            <h4 style="font-weight: bold;">Invalid Certificate</h4>
                            <p>Invalid certificate. Please check the certificate number and try again.</p>
                        </div>
                    @else
                        <?php
                            $cert = $certDetails;
                        ?>
                        <div class="alert alert-success">
                            <h4 style="font-weight: bold;">Valid Certificate</h4>
                            <p style="margin-bottom: 0;">This certificate is valid. It was issued on {{ $date_issued }}.
                            </p>
                        </div>

                        <table class="table">
                            <tr>
                                <td>Certificate Number</td>
                                {{-- <th>{{ str_replace('uuid:', '', $cert['KEY']) }}</th> --}}
                                <th>{{ $cert_no }}</th>
                            </tr>
                            <tr>
                                <td>Facility</td>
                                <th style="text-transform: capitalize;">{{ str_replace('_', ' ', $cert['mysites_facility']) }}</th>
                            </tr>
                            <tr>
                                <td>Site</td>
                                <th style="text-transform: uppercase;">{{ str_replace('_', ' ', $cert['mysites']) }}</th>
                            </tr>
                            <tr>
                                <td>County</td>
                                <th style="text-transform: capitalize;">{{ str_replace('_', ' ', $cert['mysites_county']) }}</th>
                            </tr>
                            <tr>
                                <td>Subcounty</td>
                                <th style="text-transform: capitalize;">{{ str_replace('_', ' ', $cert['mysites_subcounty']) }}</th>
                            </tr>
                            <tr>
                                <td>Partner</td>
                                <th style="text-transform: capitalize;">{{ str_replace('_', ' ', $cert['partner']) }}</th>
                            </tr>
                            <tr>
                                <td>Assessment Date</td>
                                <th>{{ \Carbon\Carbon::parse($cert['SubmissionDate'])->format('Y-m-d') }}</th>
                            </tr>
                        </table>
                        <p>For any queries, please contact the RTCQI team.</p>

                        {{-- <hr/>
                        <details>
                            <summary>View Full Data</summary>
                            <pre style="white-space: pre-wrap;">{{ json_encode($cert) }}</pre>
                        </details> --}}
                    @endif
                </div>
            </div>
        @endif
    </div>
</div>
@endsection

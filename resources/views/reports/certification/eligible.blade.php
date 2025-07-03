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
            <h1>National HTS Site Certification - Eligible Sites</h1>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h5> {{ $eligible['total'] }} sites. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Page {{ $eligible['current_page'] }} of {{ $eligible['total_pages'] }}</h5>
                <a href="{{ route('certification_eligible_dl') }}" class="btn btn-sm btn-primary" id="dlCSV">Download CSV</a>
            </div>
            <div class="row">
                {{-- <input type="hidden" id="data_json" value="{{ json_encode($eligible) }}"> --}}
                <div class="col-md-12" id="EligibleIndex">
                    <table class="table table-striped table-bordered table-hover" id="eligibleDataTable" style="font-size: 14px;">
                        <thead>
                            <tr>
                                {{-- <th>&nbsp;</th> --}}
                                <th>County</th>
                                <th>Subcounty</th>
                                <th>Facility</th>
                                <th>Site</th>
                                {{-- <th>Partner</th> --}}
                                {{-- <th>Actions</th> --}}
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($eligible['data'] as $row)
                                <tr>
                                    {{-- <td class="toggleDetail" data-id="{{ $row['KEY'] }}">
                                        <span data-id="{{ $row['KEY'] }}">
                                            <i id="icon:{{ $row['KEY'] }}" data-id="{{ $row['KEY'] }}"
                                                class="fas fa-plus-square"></i>
                                        </span>
                                    </td> --}}
                                    <td style="text-transform: capitalize;">
                                        {{ str_replace('_', ' ', $row['county']) }}</td>
                                    <td style="text-transform: capitalize;">
                                        {{ str_replace('_', ' ', $row['subcounty']) }}</td>
                                    <td style="text-transform: capitalize;">
                                        {{ str_replace('_', ' ', $row['facility']) }}</td>
                                    <td style="text-transform: uppercase;">{{ str_replace('_', ' ', $row['site']) }}
                                    </td>
                                    {{-- @if ($row['otherpartner'] != '')
                                        <td style="text-transform: capitalize;">
                                            {{ str_replace('_', ' ', $row['otherpartner']) }}</td>
                                    @else
                                        <td style="text-transform: capitalize;">
                                            {{ str_replace('_', ' ', $row['partner']) }}
                                        </td>
                                    @endif --}}
                                    {{-- <td></td> --}}
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                    {{-- pagination --}}
                    <input type="hidden" id="currentPage" value="{{ $eligible['current_page'] ?? 1 }}">
                    <div class="pagination" style="margin-top: 20px; display: flex; align-items: center; gap: 10px;">
                        <button class="btn btn-sm btn-outline-primary" id="prevPgBtn" class="prev">Previous</button>
                        <span class="page">Page {{ $eligible['current_page'] }} of {{ $eligible['total_pages'] }}</span>
                        <button class="btn btn-sm btn-outline-primary" id="nextPgBtn" class="next">Next</button>
                    </div>
                </div>
            </div>
        @endif
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            let table = new DataTable('#eeeligibleDataTable', {
                buttons: ["copy", "csv", "excel", "pdf", "print", "pageLength"],
                pageLength: 20,
                lengthMenu: [
                    [10, 20, 50, 100, -1],
                    [10, 20, 50, 100, "All"]
                ]
            });
        });

        if ({{ $eligible['current_page'] }} > 1) {
            document.getElementById('prevPgBtn').classList.remove('btn-outline-secondary');
            document.getElementById('prevPgBtn').classList.add('btn-outline-primary');
            document.getElementById('prevPgBtn').style.cursor = 'pointer';
            document.getElementById('prevPgBtn').removeAttribute('disabled');
        } else {
            document.getElementById('prevPgBtn').classList.remove('btn-outline-primary');
            document.getElementById('prevPgBtn').classList.add('btn-outline-secondary');
            document.getElementById('prevPgBtn').style.cursor = 'not-allowed';
            document.getElementById('prevPgBtn').setAttribute('disabled', true);
        }
        if ({{ $eligible['current_page'] }} < {{ $eligible['total_pages'] }}) {
            document.getElementById('nextPgBtn').classList.remove('btn-outline-secondary');
            document.getElementById('nextPgBtn').classList.add('btn-outline-primary');
            document.getElementById('nextPgBtn').style.cursor = 'pointer';
            document.getElementById('nextPgBtn').removeAttribute('disabled');
        } else {
            document.getElementById('nextPgBtn').classList.remove('btn-outline-primary');
            document.getElementById('nextPgBtn').classList.add('btn-outline-secondary');
            document.getElementById('nextPgBtn').style.cursor = 'not-allowed';
            document.getElementById('nextPgBtn').setAttribute('disabled', true);
        }

        document.getElementById('prevPgBtn').addEventListener('click', function() {
            let currentPage = document.getElementById('currentPage').value;
            if (currentPage > 1) {
                currentPage--;
                document.getElementById('currentPage').value = currentPage;
                // url?pg=currentPage--
                window.location.href = "?page=" + currentPage;
            }
        });
        document.getElementById('nextPgBtn').addEventListener('click', function() {
            let currentPage = document.getElementById('currentPage').value;
            if (currentPage < {{ $eligible['total_pages'] }}) {
                currentPage++;
                document.getElementById('currentPage').value = currentPage;
                // url?pg=currentPage++
                window.location.href = "?page=" + currentPage;
            }
        });

        document.getElementById('dlCSV').addEventListener('click', function() {
            let currentPage = document.getElementById('currentPage').value;
            window.location.href = "?download=true";
        });
    </script>
@endsection

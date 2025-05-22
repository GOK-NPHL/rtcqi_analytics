@extends('layouts.rtcqi')

@section('content')
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.8.0/html2pdf.bundle.min.js" integrity="sha512-w3u9q/DeneCSwUDjhiMNibTRh/1i/gScBVp2imNVAMCt6cUHIw6xzhzcPFIaL3Q1EbI2l+nu17q2aLJJLo4ZYg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
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
            <div class="row">
                <div class="col-md-8">
                    <a href="{{ route('cert_approvals_page') }}">&larr; Go Back</a>
                    <h1>Submission Data</h1>
                </div>
                <div class="col-md-4 text-right">
                    <button type="button" class="btn btn-primary" id="print_submission">PDF</button>
                </div>
                <div class="col-md-12" id="sub_table">
                    <table class="table table-bordered" style="background-color: #fff;">
                        <thead>
                            <tr class="text-center">
                                <th>FIELD</th>
                                <th>VALUE</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($submission as $field => $value)
                                <?php
                                $fld_ = $field;
                                $fld_tail = $fld_;
                                $fld_parts = explode('-', $field);
                                if (count($fld_parts) > 1) {
                                    $fld_tail = $fld_parts[count($fld_parts) - 1];
                                }
                                $label = $field;
                                if (isset($labels[$fld_tail])) {
                                    $label = $labels[$fld_tail];
                                }
                                ?>
                                @if (!in_array($fld_, $exclude))
                                    <tr>
                                        <td width="50%">{{ $label }}</td>
                                        <td width="50%"><strong
                                                style="text-transform: capitalize;">{{ str_replace('_', ' ', $value) }}</strong>
                                        </td>
                                    </tr>
                                @endif
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

        @endif
    </div>
    <script>
        // print submission data
        document.addEventListener('DOMContentLoaded', function() {
            // print the #sub_table
            document.getElementById('print_submission').addEventListener('click', function() {
                var tbl = document.getElementById('sub_table');
                if (tbl) {
                    html2pdf(tbl, {
                        margin: 0,
                        filename: 'submission.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                    });
                }
            });
        });
    </script>
@endsection

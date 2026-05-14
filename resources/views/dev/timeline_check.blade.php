@extends('layouts.rtcqi')

@section('content')
<div class="container-fluid">
    <div class="row justify-content-center" style="margin-top: 48px;">
        <div class="col-12 col-lg-8">

            <h4 class="mb-1">SPI Timeline Tools</h4>
            <p class="text-muted mb-4" style="font-size: 13px;">
                Inspect and correct SPI submission timeline stages in ODK Central and the local data store.
            </p>

            <div class="row">

                <div class="col-md-6 mb-4">
                    <div class="card border-left-primary shadow h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-start mb-3">
                                <i class="fas fa-search fa-2x text-primary mr-3 mt-1"></i>
                                <div>
                                    <h5 class="card-title mb-1">Facility MFL Check</h5>
                                    <p class="text-muted mb-0" style="font-size: 12px;">
                                        Inspect the full visit timeline for a single facility by MFL code.
                                        Review and selectively fix stage mismatches or soft-delete near-duplicate records.
                                    </p>
                                </div>
                            </div>
                            <a href="{{ route('devMflCheck') }}" class="btn btn-primary btn-sm">
                                Open <i class="fas fa-arrow-right ml-1"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 mb-4">
                    <div class="card border-left-warning shadow h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-start mb-3">
                                <i class="fas fa-layer-group fa-2x text-warning mr-3 mt-1"></i>
                                <div>
                                    <h5 class="card-title mb-1">County / Bulk Correction</h5>
                                    <p class="text-muted mb-0" style="font-size: 12px;">
                                        View a county-by-county summary of stage mismatches and near-duplicates.
                                        Apply bulk fixes at county, sub-county, or facility level in one action.
                                    </p>
                                </div>
                            </div>
                            <a href="{{ route('devBulkCorrection') }}" class="btn btn-warning btn-sm">
                                Open <i class="fas fa-arrow-right ml-1"></i>
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>
@endsection

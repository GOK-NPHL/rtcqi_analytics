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
    <h3> Dashboard </h3>
    <div class="row">
        <div class="col-md-6">
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title">Eligible, Targeted and Assessed Sites</h5>
                </div>
                <div class="card-body">
                    <img src="{{URL('/assessment-graphs/1.png')}}" style="width: 100%;">
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title">Sites Certification Assessment</h5>
                </div>
                <div class="card-body">
                    <img src="{{URL('/assessment-graphs/2.png')}}" style="width: 100%;">
                </div>
            </div>
        </div>
    </div>
    @endif
</div>

@endsection
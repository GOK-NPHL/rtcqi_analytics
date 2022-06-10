@extends('layouts.rtcqi')

@section('content')
    @if (isset($error))
        <div class="alert alert-danger">
            {{ $error }}
        </div>
    @else
        <div class="container-fluid">
            <input type="hidden" id="data-chart1" data-chart1="{{ asset('images/pt/pt1.png') }}">
            <input type="hidden" id="data-chart2" data-chart2="{{ asset('images/pt/pt2.png') }}">
            <input type="hidden" id="data-chart3" data-chart3="{{ asset('images/pt/pt3.png') }}">
            <input type="hidden" id="data-chart4" data-chart4="{{ asset('images/pt/pt4.png') }}">
            <input type="hidden" id="data-chart5" data-chart5="{{ asset('images/pt/pt5.png') }}">
            <input type="hidden" id="data-chart6" data-chart6="{{ asset('images/pt/pt6.png') }}">

            <div id="PTReport"></div>
        </div>
    @endif
@endsection
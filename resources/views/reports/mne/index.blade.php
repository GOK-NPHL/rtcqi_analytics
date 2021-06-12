@extends('layouts.rtcqi')

@section('content')
<div class="container-fluid">
    <input type="hidden" id="data-chart1" data-chart1="{{ asset('images/me/me1.png') }}"> 
    <input type="hidden" id="data-chart2" data-chart2="{{ asset('images/me/me2.png') }}">

    <div id="MEReport"></div>
</div>
@endsection

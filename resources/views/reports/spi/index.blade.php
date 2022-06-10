@extends('layouts.rtcqi')

@section('content')
    @if (isset($error))
        <div class="alert alert-danger">
            {{ $error }}
        </div>
    @else
        <div class="container-fluid overflow-auto">
            <input type="hidden" id="data-chart1" data-chart1="{{ asset('images/spi/spi1.png') }}">
            <input type="hidden" id="data-chart2" data-chart2="{{ asset('images/spi/spi2.png') }}">
            <input type="hidden" id="data-chart3" data-chart3="{{ asset('images/spi/spi3.png') }}">
            <input type="hidden" id="data-chart4" data-chart4="{{ asset('images/spi/spi4.png') }}">
            <input type="hidden" id="data-chart5" data-chart5="{{ asset('images/spi/spi5.png') }}">
            <input type="hidden" id="data-chart6" data-chart6="{{ asset('images/spi/spi6.png') }}">
            <input type="hidden" id="data-chart7" data-chart7="{{ asset('images/spi/spi7.png') }}">
            <input type="hidden" id="data-chart8" data-chart8="{{ asset('images/spi/spi8.png') }}">
            <div id="SpiReport"></div>
        </div>
    @endif
@endsection
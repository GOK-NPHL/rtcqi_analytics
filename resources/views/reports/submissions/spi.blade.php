@extends('layouts.rtcqi')

@section('content')
<div class="container-fluid">
    @if (isset($error))
        <div class="alert alert-danger">
            {{ $error }}
        </div>
    @else
        <div id="SPISubmissions"></div>
    @endif
</div>
@endsection

@extends('layouts.rtcqi')

@section('content')
<div class="container-fluid">
    <div class="mb-3 pt-3">
        <a href="{{ route('devTimelineCheck') }}" class="text-muted" style="font-size: 13px;">
            <i class="fas fa-arrow-left mr-1"></i> SPI Timeline Tools
        </a>
    </div>
    <div id="TimelineCheck"></div>
</div>
@endsection

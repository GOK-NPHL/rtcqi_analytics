@extends('layouts.rtcqi')
<script src="/jq/jquery-1.12.4.min.js"></script>
<script src="/jq/highcharts/12/highcharts-v12.0.2.js"></script>
<script src="/jq/highcharts/12/highcharts-more-v12.0.2.js"></script>
@section('content')
    <?php
    // if filter by county, get that single county
    if($filtercounty){
        $unique_counties = [$filtercounty];
    } else {
        $filtercounty = 'All';
        $unique_counties = array_unique(array_column(array_merge($summaries['assessment_data']['level_0'], $summaries['assessment_data']['level_1'], $summaries['assessment_data']['level_2'], $summaries['assessment_data']['level_3'], $summaries['assessment_data']['level_4']), 'county'));
    }

    $county_summary = [];
    foreach ($unique_counties as $county) {
        $county_summary[$county] = [
            'level_0' => 0,
            'level_1' => 0,
            'level_2' => 0,
            'level_3' => 0,
            'level_4' => 0,
            'total' => 0,
        ];
    }

    foreach (['level_0', 'level_1', 'level_2', 'level_3', 'level_4'] as $level) {
        if(isset($summaries['assessment_data'][$level])){
            foreach ($summaries['assessment_data'][$level] as $site) {
                $county_summary[$site['county']][$level]++;
                $county_summary[$site['county']]['total']++;
            }
        }
    }
    ?>
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
            <div class="row">
                <div class="col-md-9 pt-4">
                    <h3>Dashboard
                        @if(!!$filtercounty && $filtercounty != 'All')
                        : &nbsp;
                        <u style="text-transform: capitalize">{{ str_replace('_', ' ', $filtercounty) }} County</u>
                        <a title="Remove filter" href={{ route('certificate_dashboard') }} class="text-danger" style>&times;</a>
                    @endif
                    </h3>
                </div>
                <div class="col-md-3 text-right">
                    <form action="{{ route('certificate_dashboard') }}" method="get">
                        <div style="display: inline-block; display: flex; flex-direction: column; align-items: flex-start;">
                            <label for="county" class="w-100">Filter by county:
                                {{-- @if(!!$filtercounty && $filtercounty != 'All')
                                <span>({{ $filtercounty }})</span>
                                <a href={{ route('certificate_dashboard') }} class="text-danger">Reset</a>
                                @endif --}}
                            </label>
                            <div class="w-100" style="display: flex; flex-direction: row; align-items: center;">
                                <select class="form-control form-control-sm" name="county" id="county" style="margin: 0 5px;">
                                    <option
                                        {{ !$filtercounty || $filtercounty == 'All' ? 'selected' : '' }}
                                        value="All"
                                    >All</option>
                                    @foreach ($unique_counties as $county)
                                        <option
                                            value="{{ $county }}"
                                            {{ $filtercounty == $county ? 'selected' : '' }}
                                        >{{ ucwords(str_replace('_', ' ', $county)) }}</option>
                                    @endforeach
                                </select>
                                <button type="submit" class="btn btn-primary btn-sm">Filter</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <details>
                <summary>Data</summary>
                <pre style="white-space: pre-wrap;">
                    {{ json_encode($summaries) }}
                </pre>
            </details>
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Eligible, Targeted and Assessed Sites</h5>
                        </div>
                        <div class="card-body highcharts-light" id="eligible-assessed-sites" style="height: 500px;">
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Sites Certification Assessment</h5>
                        </div>
                        <div class="card-body highcharts-light" id="site-assessment" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Certification Assessment | Levels</h5>
                        </div>
                        <div class="card-body highcharts-light" id="cert-assessment-levels" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">County Summary</h5>
                        </div>
                        <div class="card-body highcharts-light" id="county-summary-table">
                            <table class="table table-bordered table-striped table-sm">
                                <thead>
                                    <tr>
                                        <th class="text-center" scope="col">County</th>
                                        <th class="text-center" scope="col">Level 0 Sites</th>
                                        <th class="text-center" scope="col">Level 1 Sites</th>
                                        <th class="text-center" scope="col">Level 2 Sites</th>
                                        <th class="text-center" scope="col">Level 3 Sites</th>
                                        <th class="text-center" scope="col">Level 4 Sites</th>
                                        <th class="text-center" scope="col">% of Sites at Level 4</th>
                                        <th class="text-center" scope="col">Total Sites</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($county_summary as $county => $county_data)
                                        <tr>
                                            <td style="text-transform: capitalize; font-weight: bold;">
                                                {{ str_replace('_', ' ', $county) }}</td>
                                            <td style="text-align: right;"> {{ $county_data['level_0'] }} </td>
                                            <td style="text-align: right;"> {{ $county_data['level_1'] }} </td>
                                            <td style="text-align: right;"> {{ $county_data['level_2'] }} </td>
                                            <td style="text-align: right;"> {{ $county_data['level_3'] }} </td>
                                            <td style="text-align: right;"> {{ $county_data['level_4'] }} </td>
                                            <td style="text-align: right;">
                                                {{ round(($county_data['level_4'] * 100) / $county_data['total'], 2) }}%
                                            </td>
                                            <td style="text-align: right;"> {{ $county_data['total'] }} </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Section 0: Admin Support to Sites</h5>
                        </div>
                        <div class="card-body highcharts-light" id="sec0-adminsupport" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Section 1: Personnel Training &amp; Certification</h5>
                        </div>
                        <div class="card-body highcharts-light" id="sec1-personnel-training-certification"
                            style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Section 2: Quality assuarance & Councelling </h5>
                        </div>
                        <div class="card-body highcharts-light" id="sec2-qa-counselling" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Section 3: Physical Facility</h5>
                        </div>
                        <div class="card-body highcharts-light" id="sec3-physical-facility" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Section 4: Safety</h5>
                        </div>
                        <div class="card-body highcharts-light" id="sec4-safety" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Section 5: Pre-Testing</h5>
                        </div>
                        <div class="card-body highcharts-light" id="sec5-pre-testing-phase" style="height: 700px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Section 6: Testing</h5>
                        </div>
                        <div class="card-body highcharts-light" id="sec6-testing-phase" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Section 7: Post-Testing</h5>
                        </div>
                        <div class="card-body highcharts-light" id="sec7-post-testing-phase" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Section 8: External Quality Assurance</h5>
                        </div>
                        <div class="card-body highcharts-light" id="sec8-eqa" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title">Average Performance per QA element across service provisions areas in
                                Percentage</h5>
                        </div>
                        <div class="card-body highcharts-light" id="perf-per-section" style="height: 500px;">
                        </div>
                    </div>
                </div>
            </div>
        @endif
    </div>

@endsection

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // eligible-assessed-sites (column)
        var eligibleAssessedSites = document.getElementById('eligible-assessed-sites');
        if (eligibleAssessedSites) {
            Highcharts.chart(eligibleAssessedSites, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Eligible and Assessed Sites'
                },
                xAxis: {
                    categories: ['Eligible', 'Assessed']
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        stacking: 'normal'
                    }
                },
                series: [{
                    name: '# Sites',
                    colorByPoint: true,
                    data: [
                        @json($summaries['all_eligible_l4_sites']),
                        @json(array_sum(array_map(function ($lvl) {
                                    return count($lvl);
                                }, $summaries['assessment_data'])))
                    ]
                }],
                colors: ['#5470c6', '#91cc75', '#fac858', '#d24dff', '#73c0de', '#3ba272', '#fc8452',
                    '#9a60b4', '#ea7ccc'
                ],
                credits: {
                    enabled: false
                }
            });
        }

        // site-assessment (pie)
        var siteAssessment = document.getElementById('site-assessment');
        if (siteAssessment) {
            Highcharts.chart(siteAssessment, {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Site Assessment'
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Site Assessment',
                    data: [{
                            name: 'Sites recommended for Certification',
                            y: @json(count($summaries['assessment_data']['level_4']))
                        },
                        {
                            name: 'Sites NOT recommended for Certification',
                            y: @json(count($summaries['assessment_data']['level_0']) +
                                    count($summaries['assessment_data']['level_1']) +
                                    count($summaries['assessment_data']['level_2']) +
                                    count($summaries['assessment_data']['level_3']))
                        }
                    ]
                }],
                colors: ['#32cf34', '#cc5655'],
                credits: {
                    enabled: false
                }
            });
        }

        // cert-assessment-levels (column)
        var certAssessmentLevels = document.getElementById('cert-assessment-levels');
        if (certAssessmentLevels) {
            Highcharts.chart(certAssessmentLevels, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Certification Assessment Levels'
                },
                xAxis: {
                    categories: ['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4'],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        stacking: 'normal'
                    }
                },
                series: [{
                    name: '# Sites',
                    data: [
                        @json(count($summaries['assessment_data']['level_0'])),
                        @json(count($summaries['assessment_data']['level_1'])),
                        @json(count($summaries['assessment_data']['level_2'])),
                        @json(count($summaries['assessment_data']['level_3'])),
                        @json(count($summaries['assessment_data']['level_4']))
                    ]
                }],
                colors: ['#5470c6', '#91cc75', '#fac858', '#d24dff', '#73c0de', '#3ba272', '#fc8452',
                    '#9a60b4', '#ea7ccc'
                ],
                credits: {
                    enabled: false
                }
            })
        }

        // perf-per-section (spiderweb)
        var perfPerSection = document.getElementById('perf-per-section');
        if (perfPerSection) {
            var data = @json(array_values($summaries['perf_per_section']));
            var sections = [
                'Administrative Support',
                'Personnel Training & Certification',
                'Quality Assurance in Counselling',
                'Physical Facility',
                'Safety',
                'Pre-testing Phase',
                'Testing Phase',
                'Post-testing Phase',
                'External Quality Assurance'
            ];

            Highcharts.chart(perfPerSection, {
                chart: {
                    polar: true,
                    type: 'line'
                },
                title: {
                    text: 'Average Performance per Section'
                },
                xAxis: {
                    categories: sections,
                    tickmarkPlacement: 'on',
                    lineWidth: 0
                },
                tooltip: {
                    shared: true,
                    pointFormat: '<span style="color:{series.color}">{series.name}: <b>' +
                        '${point.y:,.0f}</b><br/>'
                },
                yAxis: {
                    gridLineInterpolation: 'polygon',
                    lineWidth: 0,
                    min: 0
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y:.1f}%'
                        }
                    }
                },
                series: [{
                    name: 'Performance (%)',
                    colorByPoint: true,
                    data: data,
                    pointPlacement: 'on'
                }],
                colors: ['#5470c6', '#91cc75', '#fac858', '#d24dff', '#73c0de', '#3ba272', '#fc8452',
                    '#9a60b4', '#ea7ccc'
                ],
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            title: {
                                x: 0
                            },
                            legend: {
                                align: 'center',
                                verticalAlign: 'bottom',
                                layout: 'horizontal'
                            },
                            pane: {
                                size: '70%'
                            }
                        }
                    }]
                }
            });
        }

        // sec8-eqa (grouped-column)
        var sec8Eqa = document.getElementById('sec8-eqa');
        if (sec8Eqa) {
            Highcharts.chart(sec8Eqa, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Section 8: External Quality Assurance Responses'
                },
                xAxis: {
                    categories: [
                        'PT Registration', // Section-Section8-allprovidersenrolled
                        'PT Panel samples tested', // Section-Section8-providerstestPT
                        'PT results submitted', // Section-Section8-resultssubmittedonline
                        'Accessing PT system', // Section-Section8-feedbackreceived
                        'PT results reviewed', // Section-Section8-feedbackreviewed
                        'PT reports filed', // Section-Section8-feedbackreportfilled
                        'Corrective action implemented', // Section-Section8-providerscorrectiveaction
                        'Supervisory visits', // Section-Section8-technicalsupervision
                        'Mentorship done', // Section-Section8-retrainingdone
                        'Feedback provided' // Section-Section8-feedbackdocumented
                    ],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        // pointPadding: 0.2,
                        borderWidth: 1
                    }
                },
                series: [{
                        name: 'Yes',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-allprovidersenrolled'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-providerstestPT'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-resultssubmittedonline'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-feedbackreceived'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-feedbackreviewed'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-feedbackreportfilled'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-providerscorrectiveaction'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-technicalsupervision'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-retrainingdone'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-feedbackdocumented'] == '1';
                                    })))
                        ],
                        color: '#32cf34',
                    },
                    {
                        name: 'No',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-allprovidersenrolled'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-providerstestPT'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-resultssubmittedonline'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-feedbackreceived'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-feedbackreviewed'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-feedbackreportfilled'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-providerscorrectiveaction'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-technicalsupervision'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-retrainingdone'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section8-feedbackdocumented'] != '1';
                                    })))
                        ],
                        color: '#cc5655',
                    }
                ],
            });
        }

        // sec0-adminsupport (grouped-column)
        var sec0AdminSupport = document.getElementById('sec0-adminsupport');
        if (sec0AdminSupport) {
            Highcharts.chart(sec0AdminSupport, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Section 0: Performance of sites in Admin Support to Sites'
                },
                xAxis: {
                    categories: [
                        'RTCQI Annual Workplan', // Section-Section0-annualworkplan
                        'SCHMT support supervision', // Section-Section0-scmlcsupport
                        'CHMT support supervision' // Section-Section0-cmlcsupport
                    ],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        // pointPadding: 0.2,
                        borderWidth: 1
                    }
                },
                series: [{
                        name: 'Yes',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section0-annualworkplan'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section0-scmlcsupport'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section0-cmlcsupport'] == '1';
                                    })))
                        ],
                        color: '#32cf34',
                    },
                    {
                        name: 'No',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section0-annualworkplan'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section0-scmlcsupport'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section0-cmlcsupport'] != '1';
                                    })))
                        ],
                        color: '#cc5655',
                    }
                ],
            });
        }


        // sec1-personnel-training (grouped-column)
        var sec1PersonnelTraining = document.getElementById('sec1-personnel-training-certification');
        if (sec1PersonnelTraining) {
            Highcharts.chart(sec1PersonnelTraining, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Section 1: Performance of sites in Personnel Training & Certification'
                },
                xAxis: {
                    categories: [
                        'Training of HTS providers', // Section-Section1-providers_undergone_training
                        'Training certificates', // Section-Section1-training_certificates_available
                        'Refresher training/CME' // Section-Section1-refresher_training
                    ],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        // pointPadding: 0.2,
                        borderWidth: 1
                    }
                },
                series: [{
                        name: 'Yes',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section1-providers_undergone_training'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section1-training_certificates_available'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section1-refresher_training'] == '1';
                                    })))
                        ],
                        color: '#32cf34',
                    },
                    {
                        name: 'No',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section1-providers_undergone_training'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section1-training_certificates_available'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section1-refresher_training'] != '1';
                                    })))
                        ],
                        color: '#cc5655',
                    }
                ],
            });
        }


        // sec2-qa-counselling (grouped-column)
        var sec2QaCounselling = document.getElementById('sec2-qa-counselling');
        if (sec2QaCounselling) {
            Highcharts.chart(sec2QaCounselling, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Section 2: Performance of Sites in Quality assuarance & Councelling Requirements'
                },
                xAxis: {
                    categories: [
                        'Counsellor support supervision', // Section-Section2-attended_support_supervision
                        'Supervision by counsellor supervisor', // Section-Section2-support_by_experienced_counselor
                        'Self-assessment', // Section-Section2-provider_self_assessment
                        'Reviewed self-assessments', // Section-Section2-provider_self_assessment_review
                        'Client exit interviews', // Section-Section2-client_satisfaction_survey_done
                        'Observed practice' // Section-Section2-observed_practice
                    ],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        // pointPadding: 0.2,
                        borderWidth: 1
                    }
                },
                series: [{
                        name: 'Yes',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-attended_support_supervision'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-support_by_experienced_counselor'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-provider_self_assessment'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-client_satisfaction_survey_done'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-observed_practice'] == '1';
                                    })))
                        ],
                        color: '#32cf34',
                    },
                    {
                        name: 'No',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-attended_support_supervision'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-support_by_experienced_counselor'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-provider_self_assessment'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-client_satisfaction_survey_done'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section2-observed_practice'] != '1';
                                    })))
                        ],
                        color: '#cc5655',
                    }
                ],
            });
        }

        // sec3-physical-facility (grouped-column)
        var sec3PhysicalFacility = document.getElementById('sec3-physical-facility');
        if (sec3PhysicalFacility) {
            Highcharts.chart(sec3PhysicalFacility, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Section 3: Performance of sites in Physical Facility Requirements'
                },
                xAxis: {
                    categories: [
                        'Designated Testing area', // Section-Section3-HIV_testing_area
                        'Sufficient space', // Section-Section3-sufficient_space
                        'Facilities to accord confidentiality', // Section-Section3-confidentiality
                        'Clean and organised area', // Section-Section3-clean_testing_area
                        'Sufficient lighting', // Section-Section3-sufficient_lighting
                        'Secure storage of RTKs.' // Section-Section3-secure_storage
                    ],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        // pointPadding: 0.2,
                        borderWidth: 1
                    }
                },
                series: [{
                        name: 'Yes',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-HIV_testing_area'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-sufficient_space'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-confidentiality'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-clean_testing_area'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-sufficient_lighting'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-secure_storage'] == '1';
                                    })))
                        ],
                        color: '#32cf34',
                    },
                    {
                        name: 'No',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-HIV_testing_area'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-sufficient_space'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-confidentiality'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-clean_testing_area'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-sufficient_lighting'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section3-secure_storage'] != '1';
                                    })))
                        ],
                        color: '#cc5655',
                    }
                ],
            });
        }

        // sec4-safety (grouped-column)
        var sec4Safety = document.getElementById('sec4-safety');
        if (sec4Safety) {
            Highcharts.chart(sec4Safety, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Section 4: Performance of sites in Safety Requirements'
                },
                xAxis: {
                    categories: [
                        'Running water', // Section-Section4-tap_bucket
                        'Soap/Hand sanitizer', // Section-Section4-soap
                        'Waste bins/liners', // Section-Section4-wastesegregationfacility
                        'Waste segregation', // Section-Section4-segregationonsite
                        'PEP protocol', // Section-Section4-pep_protocols
                        'Adherance to PEP protocol', // Section-Section4-pep_protocols_followed
                    ],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        // pointPadding: 0.2,
                        borderWidth: 1
                    }
                },
                series: [{
                        name: 'Yes',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-tap_bucket'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-soap'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-wastesegregationfacility'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-segregationonsite'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-pep_protocols'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-pep_protocols_followed'] == '1';
                                    })))
                        ],
                        color: '#32cf34',
                    },
                    {
                        name: 'No',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-tap_bucket'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-soap'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-wastesegregationfacility'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-segregationonsite'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-pep_protocols'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section4-pep_protocols_followed'] != '1';
                                    })))
                        ],
                        color: '#cc5655',
                    }
                ],
            });
        }

        // sec5-pre-testing-phase (grouped-column)
        var sec5PreTestingPhase = document.getElementById('sec5-pre-testing-phase');
        if (sec5PreTestingPhase) {
            Highcharts.chart(sec5PreTestingPhase, {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: 'Section 5: Performance of sites in Pre-Testing Requirements'
                },
                xAxis: {
                    categories: [
                        'Job aide for disposal of waste', // Section-Section5-job_aides_infectious_waste
                        'Job aids for spills management', // Section-Section5-bloodspills
                        'National HTS algorithm Job Aid', // Section-Section5-job_aides_nationalalgo
                        'Are HIV/ Syphilis DUO test being used?', // Section-Duokit_used
                        'HIV/Syphilis Duo Job Aid', // Section-subsec5-Duokit_jobaide
                        'Determine Job Aid', // Section-subsec5-Determine_jobaide
                        'First Responce Job Aide', // Section-subsec5-FirstResponce_jobaide
                        'Kit expiry date observed', // Section-subsec5-expirationdate
                        'Kits stored appropriately', // Section-subsec5-testkitskeptwell
                        'New consignment - QC', // Section-subsec5-newconsignmentQC
                        'New kit lot - QC', // Section-subsec5-newkitlotQC
                        'Monthly QC', // Section-subsec5-monthlyQC
                        'QC records documentation', // Section-subsec5-qc_recorded
                        'QC records reviewed', // Section-subsec5-qc_reviewed
                        'Steps on incorrect/invalid QC results', // Section-subsec5-stepstocorrect_invalid_QC
                    ],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        // pointPadding: 0.2,
                        borderWidth: 1
                    }
                },
                series: [{
                        name: 'Yes',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section5-job_aides_infectious_waste'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section5-bloodspills'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section5-job_aides_nationalalgo'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Duokit_used'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-Duokit_jobaide'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-Determine_jobaide'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-FirstResponce_jobaide'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-expirationdate'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-testkitskeptwell'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-newconsignmentQC'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-newkitlotQC'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-monthlyQC'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-qc_recorded'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-qc_reviewed'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-stepstocorrect_invalid_QC'] == '1';
                                    })))
                        ],
                        color: '#32cf34',
                    },
                    {
                        name: 'No',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section5-job_aides_infectious_waste'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section5-bloodspills'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section5-job_aides_nationalalgo'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Duokit_used'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-Duokit_jobaide'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-Determine_jobaide'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-FirstResponce_jobaide'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-expirationdate'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-testkitskeptwell'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-newconsignmentQC'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-newkitlotQC'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-monthlyQC'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-qc_recorded'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-qc_reviewed'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-subsec5-stepstocorrect_invalid_QC'] != '1';
                                    })))
                        ],
                        color: '#cc5655',
                    }
                ],
            });
        }

        // sec6-testing-phase (grouped-column)
        var sec6TestingPhase = document.getElementById('sec6-testing-phase');
        if (sec6TestingPhase) {
            Highcharts.chart(sec6TestingPhase, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Section 6: Performance of sites in Testing Requirements'
                },
                xAxis: {
                    categories: [
                        'HTS algorithm followed', // Section-Section6-hts_algorithmfollowed
                        'HIV/Syphilis Duo algorithm followed', // Section-Section6-duokit_algo_followed
                        'Sample collection devices', // Section-Section6-samplecollection
                        'Determine procedure followed', // Section-Section6-Determine_algo
                        'HIV/Syphilis Duo procedure followed', // Section-Section6-Duokit_procedure
                        'First Response procedure followed', // Section-Section6-FirstResponce_algo
                        'Functional timers', // Section-Section6-timersavailable
                        'Use of Timers', // Section-Section6-timersused
                        'Test results correctly interpreted', // Section-Section6-resultsinterpreted
                    ],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        // pointPadding: 0.2,
                        borderWidth: 1
                    }
                },
                series: [{
                        name: 'Yes',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-hts_algorithmfollowed'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-duokit_algo_followed'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-samplecollection'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-Determine_algo'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-Duokit_procedure'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-FirstResponce_algo'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-timersavailable'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-timersused'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-resultsinterpreted'] == '1';
                                    })))
                        ],
                        color: '#32cf34',
                    },
                    {
                        name: 'No',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-hts_algorithmfollowed'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-duokit_algo_followed'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-samplecollection'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-Determine_algo'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-Duokit_procedure'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-FirstResponce_algo'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-timersavailable'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-timersused'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section6-resultsinterpreted'] != '1';
                                    })))
                        ],
                        color: '#cc5655',
                    }
                ],
            });
        }

        // sec7-post-testing-phase (grouped-column)
        var sec7PostTestingPhase = document.getElementById('sec7-post-testing-phase');
        if (sec7PostTestingPhase) {
            Highcharts.chart(sec7PostTestingPhase, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Section 7: Performance of sites in Post-Testing Requirements'
                },
                xAxis: {
                    categories: [
                        'Standardised HTS Register', // Section-Section7-registeravailable
                        'Key quality elements in the register', // Section-Section7-qualityelements
                        'Register recorded correctly', // Section-Section7-elementscapturedcorrectly
                        'Page summaries done', // Section-Section7-summaryavailable
                        'Invalid results recorded', // Section-Section7-invalid_results
                        'Client records securely kept during testing', // Section-Section7-client_docs_stored
                        'Documents kept  securely when not in use', // Section-Section7-secure_doc_storage
                        'Registers labelled and archived' // Section-Section7-properly_labelled
                    ],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Sites'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    column: {
                        // pointPadding: 0.2,
                        borderWidth: 1
                    }
                },
                series: [{
                        name: 'Yes',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-registeravailable'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-qualityelements'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-elementscapturedcorrectly'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-summaryavailable'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-invalid_results'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-client_docs_stored'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-secure_doc_storage'] == '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-properly_labelled'] == '1';
                                    })))
                        ],
                        color: '#32cf34',
                    },
                    {
                        name: 'No',
                        colorByPoint: false,
                        data: [
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-registeravailable'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-qualityelements'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-elementscapturedcorrectly'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-summaryavailable'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-invalid_results'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-client_docs_stored'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-secure_doc_storage'] != '1';
                                    }))),
                            @json(count(array_filter($data, function ($value) {
                                        return $value['Section-Section7-properly_labelled'] != '1';
                                    })))
                        ],
                        color: '#cc5655',
                    }
                ],
            });
        }





    });
</script>

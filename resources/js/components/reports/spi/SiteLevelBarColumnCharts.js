import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { v4 as uuidv4 } from 'uuid';

function SiteLevelBarColumnCharts({ serverData, siteType }) {
    let ov_data = {};
    if (serverData?.length > 0) {
        ov_data = serverData[0];
        Object.keys(ov_data['OverallSitesLevel']).forEach((key) => {
            ov_data['OverallSitesLevel'][key]['sites'] = [];
        });
    }

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-md-12">
                    <h5 className="text-dark text-uppercase mb-1" style={{ fontWeight: '600' }}>Level distribution by follow-up</h5>
                </div>
                {ov_data['OverallSitesLevel'] && Object.keys(ov_data['OverallSitesLevel']).length > 0
                    ? Object.keys(ov_data['OverallSitesLevel']).map((follow_up, index) => {
                        const follow_data = { ...ov_data['OverallSitesLevel'][follow_up] };
                        const follow_data_counter = follow_data['counter'] || 0;
                        delete follow_data['sites'];
                        delete follow_data['counter'];

                        const options = {
                            chart: { type: 'column' },
                            title: { text: '' },
                            colors: ['#ff2d00', '#ffc100', '#fff000', '#73e502', '#5ba216', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
                            exporting: { enabled: true },
                            xAxis: {
                                categories: Object.keys(follow_data).map(g => g.replace('level', 'Level ')),
                                title: { text: 'LEVEL' },
                            },
                            yAxis: {
                                min: 0, max: 100,
                                title: { text: '%', align: 'middle' },
                                labels: { overflow: 'justify' },
                            },
                            tooltip: { valueSuffix: ', Count: ' + Intl.NumberFormat().format(follow_data_counter) + ' ' },
                            plotOptions: {
                                series: {
                                    borderWidth: 0,
                                    dataLabels: { enabled: true, format: '{point.y:.1f}%' },
                                },
                            },
                            legend: { enabled: false },
                            credits: { enabled: false },
                            series: [{
                                name: 'LEVEL',
                                colorByPoint: true,
                                data: Object.keys(follow_data).map(k => ({
                                    name: k, y: parseFloat(follow_data[k]) || 0, drilldown: k,
                                })),
                            }],
                        };

                        return (
                            <div className="col-md-4" key={index}>
                                <div className="card mt-3">
                                    <div className="card-header">
                                        <h5 className="card-title text-center mb-0 text-dark" style={{ textTransform: 'capitalize' }}>
                                            {follow_up} {' (N=' + Intl.NumberFormat().format(follow_data_counter || 0) + ')'}
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="chart-container">
                                            <div className="chart has-fixed-height" id={'follow_up_' + follow_up}>
                                                <HighchartsReact highcharts={Highcharts} options={options} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                    : null}
            </div>
        </React.Fragment>
    );
}

export default SiteLevelBarColumnCharts;

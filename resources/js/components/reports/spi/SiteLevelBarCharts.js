import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedHorizontal from '../../utils/charts/StackedHorizontal'
import { v4 as uuidv4 } from 'uuid';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

class SiteLevelBarColumnCharts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            series2: [
                {
                    name: 'Level 0 (<40%)',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [24, 23, 56, 34, 32]
                }
            ],
            ovdata: {}
        };
        this.addGraphsToArray = this.addGraphsToArray.bind(this);
        this.prepareOverallLevelSiteData = this.prepareOverallLevelSiteData.bind(this);

    }

    componentDidMount() {

    }

    prepareOverallLevelSiteData(dataObject) {
        let overallSiteGraphsData = {};
        let levelsMap = {
            'level0': 'Level 0 (<40%)',
            'level1': 'Level 1 (40-59%)',
            'level2': 'Level 2 (60-79%)',
            'level3': 'Level 3 (80-89%)',
            'level4': 'Level 4 (>90%)'
        }


        let orgName = dataObject['orgName'];
        if (dataObject['OrgUniType']) orgName += ' ' + dataObject['OrgUniType'];
        orgName = orgName.toUpperCase();
        let overallSitesObject = dataObject['OverallSitesLevel'];
        let levelData = { 'level0': [], 'level1': [], 'level2': [], 'level3': [], 'level4': [] };
        let category = [];
        let letSeriesData = [];

        for (let [timeline, timeLineObjectValue] of Object.entries(overallSitesObject)) {
            if (timeline != 'sites') {
                if (!category.includes(timeline)) {
                    category.push(timeline + ' (N=' + overallSitesObject[timeline]['counter'] + ') ');
                }

                for (let [levelName, levelValue] of Object.entries(timeLineObjectValue)) {
                    if (levelName != 'counter' && levelName != 'sites') {
                        levelData[levelName].push(levelValue);
                    }
                }
            }
        }
        for (let [level, dataArray] of Object.entries(levelData)) {
            let seriesEntry = {
                name: '',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: ''
            };
            seriesEntry['data'] = dataArray;
            seriesEntry['name'] = levelsMap[level];
            letSeriesData.push(seriesEntry);
        }
        overallSiteGraphsData[orgName] = [category, letSeriesData];

        //prepare percentage of sites assessed graph data

        // return this.createOverallSiteGraphsDisplays(overallSiteGraphsData, counter);

        return <RTCard header={orgName} minHeight={this.props.minHeight}>
            <StackedHorizontal minHeight={this.props.minHeight} category={category} series={letSeriesData} />
        </RTCard>
    }


    addGraphsToArray(counter, row, columns, overLay, singChart) {
        if (counter % 2 == 0) {
            overLay.push(row);
            columns = [];
            row = <div key={uuidv4()} className="row">
                {columns}
            </div>;
        }
        columns.push(<div key={uuidv4()} className="col-sm-12">
            {singChart}
        </div>);
        counter += 1;
        return [counter, row, columns, overLay];
    }

    render() {
        let overLay = [];
        let counter = 0;
        let columns = [];
        let row = <div key={uuidv4()} className="row">
            {columns}
        </div>;
        let ov_data = {};
        if (this.props.serverData) {
            if (this.props.serverData.length > 0) {
                ov_data = this.props.serverData[0];
                Object.keys(ov_data['OverallSitesLevel']).forEach((key) => {
                    ov_data['OverallSitesLevel'][key]['sites'] = [];
                })
            }

            // if (Array.isArray(this.props.serverData)) {


            if (this.props.siteType != null && this.props.siteType.length != 0) {
                //console.log("hunt bug 1");
                //console.log(this.props.serverData);
                if (Array.isArray(this.props.serverData[0])) {
                    this.props.serverData.map((dataObjectParent) => {
                        //data returned comes in two different formtat. Should be written to standardize
                        try {
                            let singChart = this.prepareOverallLevelSiteData(dataObjectParent[0]);
                            [counter, row, columns, overLay] = this.addGraphsToArray(counter, row, columns, overLay, singChart);
                        } catch (err) {

                        }

                    });
                    if (columns.length > 0) {
                        overLay.push(row); //push remaining graphs in display
                    }
                } else {
                    this.props.serverData.map((dataObjectParent) => {

                        for (let [orgId, orgUnitDataObject] of Object.entries(dataObjectParent)) {
                            try {
                                let singChart = this.prepareOverallLevelSiteData(orgUnitDataObject);
                                [counter, row, columns, overLay] = this.addGraphsToArray(counter, row, columns, overLay, singChart);
                            } catch (err) {

                            }
                        }
                    });
                    if (columns.length > 0) {
                        overLay.push(row); //push remaining graphs in display
                    }
                }
                //console.log("hunt bug 1-");

            } else {

                for (let [key, dataObject] of Object.entries(this.props.serverData)) {
                    try {
                        let singChart = this.prepareOverallLevelSiteData(dataObject);
                        [counter, row, columns, overLay] = this.addGraphsToArray(counter, row, columns, overLay, singChart);
                    } catch (err) {

                    }
                }
                if (columns.length > 0) {
                    overLay.push(row); //push remaining graphs in display
                }

            }

        } else {
        }

        return (
            <React.Fragment>
                {/* {this.props.singleItem ? columns : overLay} */}
                {/* <pre>{JSON.stringify(ov_data, null, 2)}</pre> */}
                <div className='row'>
                    <div className='col-md-12'>
                        <h5 className='text-dark text-uppercase mb-1' style={{ fontWeight: '600' }}>Level distribution by follow-up</h5>
                    </div>
                    {ov_data['OverallSitesLevel'] && Object.keys(ov_data['OverallSitesLevel']).length > 0 ? Object.keys(ov_data['OverallSitesLevel']).map((follow_up, index) => {
                        let follow_data = ov_data['OverallSitesLevel'][follow_up];
                        let follow_data_counter = ov_data['OverallSitesLevel'][follow_up]['counter'] || 0;
                        // remove 'sites' item from the object
                        delete follow_data['sites'];
                        delete follow_data['counter'];
                        /// options
                        const options = {
                            chart: {
                                type: 'column'
                            },
                            title: {
                                text: ''
                            },
                            // colors: ['#ff0000', '#ff4000', '#ff8000', '#ffbf00', '#ffff00', '#bfff00', '#80ff00', '#40ff00', '#00ff00'],
                            colors: ['#ff2d00', '#ffc100', '#fff000', '#73e502', '#5ba216', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
                            exporting: {
                                enabled: true
                            },
                            xAxis: {
                                categories: Array.from(Object.keys(follow_data), g=>{
                                    return g.replace('level', 'Level ')
                                }) || [],
                                title: {
                                    text: 'LEVEL'
                                }
                            },
                            yAxis: {
                                min: 0,
                                max: 100,
                                title: {
                                    text: '%',
                                    align: 'middle'
                                },
                                labels: {
                                    overflow: 'justify'
                                },
                            },
                            tooltip: {
                                valueSuffix: ', Count: ' + Intl.NumberFormat().format(follow_data_counter) + ' '
                            },
                            plotOptions: {
                                series: {
                                    borderWidth: 0,
                                    dataLabels: {
                                        enabled: true,
                                        format: '{point.y:.1f}%'
                                    }
                                }
                            },
                            legend: {
                                enabled: false
                            },
                            credits: {
                                enabled: false
                            },
                            series: [{
                                name: 'LEVEL',
                                colorByPoint: true,
                                data: Array.from(Object.keys(follow_data), (k, i) => {
                                    return {
                                        name: k,
                                        y: parseFloat(follow_data[k]) || 0,
                                        drilldown: k,
                                    }
                                }) || []
                            }]
                        }
                        /// options
                        return (<div className='col-md-4' key={index}>
                            <div className='card mt-3'>
                                <div className='card-header'>
                                    <h5 className='card-title text-center mb-0 text-dark' style={{ textTransform: 'capitalize' }}>{follow_up} {' (N=' + Intl.NumberFormat().format(follow_data_counter || 0) + ')'}</h5>
                                </div>
                                <div className='card-body'>
                                    <div className='chart-container'>
                                        <div className='chart has-fixed-height' id={"follow_up_" + follow_up}>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={options}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>)
                    }) : null}
                </div>
            </React.Fragment>
        );
    }

}

export default SiteLevelBarColumnCharts;

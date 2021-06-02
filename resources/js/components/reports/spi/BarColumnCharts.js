import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedHorizontal from '../../utils/charts/StackedHorizontal'
import { v4 as uuidv4 } from 'uuid';

class BarColumnCharts extends React.Component {

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
                },
                {
                    name: 'Level 1  (50-59%)',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [55, 67, 22, 76, 67]
                },
                {
                    name: 'Level 2 (60-79%)',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [66, 32, 56, 87, 32]
                },
                {
                    name: 'Level 3 (80-89%)',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [78, 11, 34, 75, 23]
                },
                {
                    name: 'Level 4 (>90%)',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [10, 45, 56, 76, 32]
                }
            ]
        };
    }

    componentDidMount() {

    }

    render() {
        let overLay = [];
        let counter = 1;
        let columns = [];
        let row = <div key={uuidv4()} className="row">
            {columns}
        </div>


        if (this.props.serverData) {
            console.log(" no tempty");
            console.log(this.props.serverData);
            let overallSiteGraphsData = {};
            if (Array.isArray(this.props.serverData)) {
                let levelsMap = {
                    'level0': 'Level 0 (<40%)',
                    'level1': 'Level 1 (50-59%)',
                    'level2': 'Level 2 (60-79%)',
                    'level3': 'Level 3 (80-89%)',
                    'level4': 'Level 4 (>90%)'
                }

                this.props.serverData.map((dataObject) => {

                    let orgName = dataObject['orgName'];
                    if (dataObject['OrgUniType']) orgName += ' ' + dataObject['OrgUniType'];

                    let overallSitesObject = dataObject['OverallSitesLevel'];
                    let levelData = { 'level0': [], 'level1': [], 'level2': [], 'level3': [], 'level4': [] };
                    let category = [];
                    let letSeriesData = [];

                    for (let [timeline, timeLineObjectValue] of Object.entries(overallSitesObject)) {
                        if (!category.includes(timeline)) {
                            category.push(timeline);
                        }

                        for (let [levelName, levelValue] of Object.entries(timeLineObjectValue)) {

                            if (levelName != 'counter') {
                                levelData[levelName].push(levelValue);
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
                });

            }


            for (let [headerName, graphData] of Object.entries(overallSiteGraphsData)) {

                if (counter % 2 == 0) {

                    overLay.push(row);
                    columns = [];
                    row = <div key={uuidv4()} className="row">[columns]</div>;
                } else {

                    columns.push(<div key={uuidv4()} className="col-sm-6 col-xm-12">
                        <RTCard header={headerName}>
                            <StackedHorizontal category={graphData[0]} series={graphData[1]} />
                        </RTCard>
                    </div>);
                }
                counter += 1;

            }
            if (columns.length > 0) { //push remaining elements on the array

                overLay.push(row);
            }
            console.log("overLay");
            console.log(overLay);
        } else {
            console.log(" empty");
        }

        return (
            <React.Fragment>
                {overLay}
            </React.Fragment>
        );
    }

}

export default BarColumnCharts;

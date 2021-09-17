import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedVertical from '../../utils/charts/StackedVertical'
import { v4 as uuidv4 } from 'uuid';

class AgreementRateColumnCharts extends React.Component {

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
            ]
        };
        this.addGraphsToArray = this.addGraphsToArray.bind(this);
        this.prepareOverallLevelSiteData = this.prepareOverallLevelSiteData.bind(this);

    }

    componentDidMount() {

    }

    prepareOverallLevelSiteData(dataObject) {
        let overallSiteGraphsData = {};
        let levelsMap = {
            '<95': '<95%',
            '95-98': '95%-98%',
            '>98': '>98%'
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let orgName = dataObject.orgName;

        if (dataObject.orgName) orgName += ' ' + (dataObject['OrgUniType'] != undefined ? dataObject['OrgUniType'] : '');
        orgName = orgName.toUpperCase();
        let overallDataObject = dataObject.overall_agreement_rate;

        let levelData = { '<95': [], '<': [], '95-98': [], '>98': [] };
        let category = [];
        let seriesData = [];

        for (let [period, totals] of Object.entries(overallDataObject)) {
            let row = [];
            const d = new Date(period);

            let val = monthNames[d.getMonth()] + '\n' + d.getFullYear() + '\n (N=' + totals['totals']['total_sites'] + ') ';

            if (!category.includes(val)) {
                category.push(val);
            }

            for (let [name, value] of Object.entries(totals['totals'])) {
                console.log(name);
                if (name != 'total_sites') {
                    let val = ((Number(value) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);
                    if (isNaN(val)) val = 0;
                    levelData[name].push(val);
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
            seriesData.push(seriesEntry);
        }

        overallSiteGraphsData[orgName] = [category, seriesData];

        return <RTCard header={orgName} minHeight={this.props.minHeight}>
            <StackedVertical
                yAxisGap={43}
                yAxisName="% agreement rates" formatter="%" minHeight={this.props.minHeight} legend={['<95%', '95%-98%', '>98%']} category={category} series={seriesData} />
        </RTCard>
    }

    addGraphsToArray(counter, row, columns, overLay, singChart) {
        console.log("adding to chart")
        if (counter % 2 == 0) {
            overLay.push(row);
            columns = [];
            row = <div key={uuidv4()} className="row">
                {columns}
            </div>;
        }
        columns.push(<div key={uuidv4()} className="col-sm-12 col-xm-12">
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
        if (this.props.serverData) {

            if (this.props.siteType != null && this.props.siteType.length != 0) {

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

            } else {
                console.log("hunt bug 3");
                console.log(this.props.serverData);
                for (let [key, dataObject] of Object.entries(this.props.serverData[0])) {
                    try {
                        let singChart = this.prepareOverallLevelSiteData(dataObject);
                        [counter, row, columns, overLay] = this.addGraphsToArray(counter, row, columns, overLay, singChart);
                    } catch (err) {

                    }
                }
                console.log("hunt bug 3-");
                if (columns.length > 0) {
                    overLay.push(row); //push remaining graphs in display
                }
            }

        } else {

        }

        return (
            <React.Fragment>
                {this.props.singleItem ? columns : overLay}
            </React.Fragment>
        );
    }

}

export default AgreementRateColumnCharts;

import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedHorizontal from '../../utils/charts/StackedHorizontal'
import { v4 as uuidv4 } from 'uuid';

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
            'level0': 'Level 0 (<40%)',
            'level1': 'Level 1 (50-59%)',
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

            if (!category.includes(timeline)) {
                category.push(timeline + ' (N=' + overallSitesObject[timeline]['counter'] + ') ');
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
        columns.push(<div key={uuidv4()} className="col-sm-6 col-xm-12">
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

            // if (Array.isArray(this.props.serverData)) {


            if (this.props.siteType != null && this.props.siteType.length != 0) {
                console.log("hunt bug 1");
                console.log(this.props.serverData);
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
                console.log("hunt bug 1-");

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
                {this.props.singleItem ? columns : overLay}
            </React.Fragment>
        );
    }

}

export default SiteLevelBarColumnCharts;

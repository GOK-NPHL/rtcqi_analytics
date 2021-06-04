import React from 'react';
import RTCard from '../../utils/RTCard'
import AvgPerformanceSpider from '../../utils/charts/AvgPerformanceSpider'
import { v4 as uuidv4 } from 'uuid';
import './spi.css';

class OverallPerformanceRadar extends React.Component {

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
        
        let orgName = dataObject['orgName'];
        if (dataObject['OrgUniType']) {
            orgName += ' ' + dataObject['OrgUniType']
        };
        orgName = orgName.toUpperCase();

        let indicators = [
            { text: "Personnel\nTraining\n& Certification", max: 100 },
            { text: "QA in\nCounselling", max: 100 },
            { text: "Physical\nFacility", max: 100 },
            { text: 'Pre-testing\nphase', max: 100 },
            { text: 'Testing\nPhase', max: 100 },
            { text: 'Post-testing\nPhase', max: 100 },
            { text: 'External\nQuality\nAssessment', max: 100 },
            { text: 'Overall\nPerformance', max: 100 }
        ];
        let legend = [];
        let dataKeys = ["TestingPhase", "Safety", "QACounselling", "PreTestingPhase", "PostTestingPhase", "PhysicalFacility",
            "PersonellTrainingAndCertification",, "OverallPerformance"];

        let timelineData = {};
        dataKeys.map((key) => {
            let valueObj = dataObject[key];
            for (let [timeLine, data] of Object.entries(valueObj)) {
                if (!legend.includes(timeLine)) {
                    legend.push(timeLine);
                }
                if (timeLine in timelineData) {
                    timelineData[timeLine].push(data);
                } else {
                    timelineData[timeLine] = [];
                    timelineData[timeLine].push(data);
                }
            }
        });
        console.log("Reach 4");
        console.log(timelineData);
        let letSeriesData = [];

        for (let [timeline, dataArray] of Object.entries(timelineData)) {
            console.log("Reach 3");
            let seriesData = {
                value: dataArray,
                name: timeline,
                symbol: 'rect',
                symbolSize: 12,
                label: {
                    show: true,
                    formatter: function (params) {
                        return params.value;
                    }
                }
            }

            letSeriesData.push(seriesData);
        }

        console.log("Reach 5");
        console.log(letSeriesData);
         return <RTCard style={{"padding":"0px"}} header={orgName}>
            <AvgPerformanceSpider indicators={indicators} legend={legend} series={letSeriesData} />
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
                console.log("first 1");
                console.log(this.props.serverData);
                if (Array.isArray(this.props.serverData[0])) {
                    this.props.serverData.map((dataObjectParent) => {
                        //data returned comes in two different formtat. Should be written to standardize
                        let singChart = this.prepareOverallLevelSiteData(dataObjectParent[0]);
                        [counter, row, columns, overLay] = this.addGraphsToArray(counter, row, columns, overLay, singChart);
                    });
                    if (columns.length > 0) {
                        overLay.push(row); //push remaining graphs in display
                    }
                } else {
                    this.props.serverData.map((dataObjectParent) => {
                        for (let [orgId, orgUnitDataObject] of Object.entries(dataObjectParent)) {
                            let singChart = this.prepareOverallLevelSiteData(orgUnitDataObject);
                            [counter, row, columns, overLay] = this.addGraphsToArray(counter, row, columns, overLay, singChart);
                        }
                    });
                    if (columns.length > 0) {
                        overLay.push(row); //push remaining graphs in display
                    }
                }

            } else {
                console.log("last 1");
                console.log(this.props.serverData);
                for (let [key, dataObject] of Object.entries(this.props.serverData)) {
                    let singChart = this.prepareOverallLevelSiteData(dataObject);
                    [counter, row, columns, overLay] = this.addGraphsToArray(counter, row, columns, overLay, singChart);
                }
                if (columns.length > 0) {
                    overLay.push(row); //push remaining graphs in display
                }
            }

        } else {
            console.log("empty");
        }

        return (
            <React.Fragment>
                {overLay}
            </React.Fragment>
        );
    }

}

export default OverallPerformanceRadar;

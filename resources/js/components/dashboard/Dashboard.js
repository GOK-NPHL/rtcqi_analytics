import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../utils/charts/LineGraph';
import RTCard from '../utils/RTCard';
import StackedHorizontal from '../utils/charts/StackedHorizontal'
import TopLabels from './TopLabels'
import { FetchUserAuthorities, FetchOrgunits, FetchOdkData } from '../utils/Helpers';
import SiteLevelBarColumnCharts from '../reports/spi/SiteLevelBarColumnCharts';
import OverallPerformanceRadar from '../reports/spi/OverallPerformanceRadar';

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],
            orgUnitDataIds: [0],
            orgUnitTimeline: [],
            siteType: [],
            echartsMinHeight: '',

            allowedPermissions: [],
            dataset1: {
                dimensions: ['indicator', 'Baseline(Round 13)', 'Y1_Q4(round 14)', 'Y2_Q1(round 15)', 'Y2_Q2(round 16)'],

                source: [
                    { indicator: 'Providers Enrolled', 'Baseline(Round 13)': 43.3, 'Y1_Q4(round 14)': 85.8, 'Y2_Q1(round 15)': 93.7, 'Y2_Q2(round 16)': 73.7 },
                    { indicator: 'Providers With PT Results', 'Baseline(Round 13)': 83.1, 'Y1_Q4(round 14)': 73.4, 'Y2_Q1(round 15)': 55.1, 'Y2_Q2(round 16)': 78.7 },
                    { indicator: 'Providers With Satisfactory Results', 'Baseline(Round 13)': 86.4, 'Y1_Q4(round 14)': 65.2, 'Y2_Q1(round 15)': 82.5, 'Y2_Q2(round 16)': 89.7 },
                    { indicator: 'Providers That Received Corrective', 'Baseline(Round 13)': 72.4, 'Y1_Q4(round 14)': 53.9, 'Y2_Q1(round 15)': 39.1, 'Y2_Q2(round 16)': 47.7 }
                ]

            },
            series1: [
                { type: 'bar' },
                { type: 'bar' },
                { type: 'bar' },
                { type: 'bar' }
            ],
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
        }
        this.fetchOdkDataServer = this.fetchOdkDataServer.bind(this);
    }

    componentDidMount() {

        (async () => {
            let allowedPermissions = await FetchUserAuthorities();
            let returnedData = await FetchOrgunits();
            let orgs = [];
            try {
                orgs = returnedData.payload[0];
            } catch (err) {

            }
            this.setState({
                unfilteredOrgUnits: returnedData,
                orgUnits: orgs,
                odkData: {},
                orgLevel: 1,
                orgId: 1,
                allowedPermissions: allowedPermissions
            });

            let defaultOrg = -1;
            try {
                defaultOrg = [returnedData.payload[0][0]['org_unit_id']];//get first orgunit of in list of authorized orgs;
            } catch (err) {
            }

            this.fetchOdkDataServer(defaultOrg,
                this.state.orgUnitTimeline,
                this.state.siteType,
                this.state.startDate,
                this.state.endDate
            );
        })();

    }

    fetchOdkDataServer(orgUnitIds, orgTimeline, siteType, startDate, endDate) {
        if (orgUnitIds) {
            if (orgUnitIds.length != 0) {
                (async () => {
                    let returnedData = await FetchOdkData(orgUnitIds, orgTimeline, siteType, startDate, endDate);
                    if (returnedData.status == 200) {
                        this.setState({
                            odkData: returnedData.data,
                        });
                    }

                })();
            }
        }

    }

    render() {
        let dashBoardContent = '';
        if (this.state.allowedPermissions.length > 0 &&
            this.state.allowedPermissions.includes('view_dashboard')) {

            dashBoardContent = <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
                    <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-download fa-sm text-white-50"></i> Generate Report</a>
                </div>


                <TopLabels />

                <div className="row">
                    <OverallPerformanceRadar singleItem={true} minHeight={500} setMinHeight={true} serverData={this.state.odkData} siteType={this.state.siteType} />
                    <SiteLevelBarColumnCharts singleItem={true} minHeight={510} serverData={this.state.odkData} siteType={this.state.siteType} />
                </div>
            </React.Fragment>
        }
        console.log("ff")
        console.log();
        return (
            
            <React.Fragment>
                {dashBoardContent}
                {this.state.unfilteredOrgUnits?'':<p style={{"color": "red"}}>You have no orgunits attached</p>}
            </React.Fragment>
        );
    }

}

export default Dashboard;

if (document.getElementById('dashboard')) {
    ReactDOM.render(<Dashboard />, document.getElementById('dashboard'));
}
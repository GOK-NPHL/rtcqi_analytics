import React from 'react';
import ReactDOM from 'react-dom';
import StatsLabel from '../stats/StatsLabel';
import LineGraph from '../charts/LineGraph';
import RTCard from '../utils/RTCard';



class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
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
            ]
        }
    }

    render() {
        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
                    <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-download fa-sm text-white-50"></i> Generate Report</a>
                </div>


                <div className="row">

                    <div className="col-xl-3 col-md-6 mb-4">
                        <StatsLabel
                            textStyling={'text-primary'}
                            borderStyling={'border-left-primary'}
                            text={'Providers Enrolled'}
                            value={'85.5'}
                            faIcon={'fa-hands'}
                        ></StatsLabel>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                        <StatsLabel
                            textStyling={'text-success'}
                            borderStyling={'border-left-success'}
                            text={'Sites using standardized HTC register'}
                            value={'69'}
                            faIcon={'fa-book'}
                        ></StatsLabel>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                        <StatsLabel
                            textStyling={'text-info'}
                            borderStyling={'border-left-info'}
                            text={'Personnel Training & Certification'}
                            value={'91.4'}
                            faIcon={'fa-certificate'}
                        ></StatsLabel>
                    </div>


                    <div className="col-xl-3 col-md-6 mb-4">
                        <StatsLabel
                            textStyling={' text-warning'}
                            borderStyling={'border-left-warning'}
                            text={'Policy/MOH support'}
                            value={'34.6'}
                            faIcon={'fa-hands-helping'}
                        ></StatsLabel>
                    </div>

                </div>

                <div className="row">
                    <div className="col-xl-6 col-lg-6">
                        <RTCard header='Providers Statstics'>
                            <LineGraph dataset={this.state.dataset1} series={this.state.series1} />
                        </RTCard>
                    </div>
                </div>

            </React.Fragment>
        );
    }

}

export default Dashboard;

if (document.getElementById('dashboard')) {
    ReactDOM.render(<Dashboard />, document.getElementById('dashboard'));
}
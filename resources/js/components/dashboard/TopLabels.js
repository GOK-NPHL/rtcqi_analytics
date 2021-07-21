import React from 'react';
import StatsLabel from '../utils/stats/StatsLabel';

class TopLabels extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            externalQualityAssessment: 0,
            overallPerformance: 0,
            personellTrainingAndCertification: 0,
            physicalFacility: 0,
            timeLine: 'Follow2'
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {

        if (
            prevProps.serverData.length != this.props.serverData.length
        ) {
            console.log("hunt bug 2");
                console.log(this.props.serverData);
            this.setState({
                externalQualityAssessment: this.props.serverData[0]['ExternalQualityAssessment']['follow2'],
                overallPerformance: this.props.serverData[0]['OverallPerformance']['follow2'],
                personellTrainingAndCertification: this.props.serverData[0]['PersonellTrainingAndCertification']['follow2'],
                physicalFacility: this.props.serverData[0]['PhysicalFacility']['follow2']
            });
            console.log("hunt bug 2-");
        }

    }

    render() {

        return (

            <div className="row">

                <div className="col-xl-3 col-md-6 mb-4">
                    <StatsLabel
                        textStyling={'text-primary'}
                        borderStyling={'border-left-primary'}
                        text={'External Quality Assessment' +` ${this.state.timeLine}`}
                        value={this.state.externalQualityAssessment}
                        faIcon={'fa-hands'}
                    ></StatsLabel>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <StatsLabel
                        textStyling={'text-success'}
                        borderStyling={'border-left-success'}
                        text={'Overall Performance' +` ${this.state.timeLine}`}
                        value={this.state.overallPerformance}
                        faIcon={'fa-book'}
                    ></StatsLabel>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <StatsLabel
                        textStyling={'text-info'}
                        borderStyling={'border-left-info'}
                        text={'Personell Training And Certification' +` ${this.state.timeLine}`}
                        value={this.state.personellTrainingAndCertification}
                        faIcon={'fa-certificate'}
                    ></StatsLabel>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <StatsLabel
                        textStyling={' text-warning'}
                        borderStyling={'border-left-warning'}
                        text={'Physical Facility' +` ${this.state.timeLine}`}
                        value={this.state.physicalFacility}
                        faIcon={'fa-hands-helping'}
                    ></StatsLabel>
                </div>

            </div>
        );
    }
}

export default TopLabels;

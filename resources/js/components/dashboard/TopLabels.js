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
            prevProps.serverData != this.props.serverData
        ) {

            // console.log("data to parse =====>");
            // console.log(this.props.serverData);

            if (Array.isArray(this.props.serverData)) {
                // console.log("data processing =====>");
                // console.log(this.props.serverData);
                this.props.serverData.map((dataObjectParent) => {

                    this.setState({
                        externalQualityAssessment: dataObjectParent['ExternalQualityAssessment']['follow2'],
                        overallPerformance: dataObjectParent['OverallPerformance']['follow2'],
                        personellTrainingAndCertification: dataObjectParent['PersonellTrainingAndCertification']['follow2'],
                        physicalFacility: dataObjectParent['PhysicalFacility']['follow2']
                    });

                });

            } else {
                for (let [orgId, orgUnitDataObject] of Object.entries(this.props.serverData)) {

                    this.setState({
                        externalQualityAssessment: orgUnitDataObject['ExternalQualityAssessment']['follow2'],
                        overallPerformance: orgUnitDataObject['OverallPerformance']['follow2'],
                        personellTrainingAndCertification: orgUnitDataObject['PersonellTrainingAndCertification']['follow2'],
                        physicalFacility: orgUnitDataObject['PhysicalFacility']['follow2']
                    });
                }

            }


        }

    }

    render() {

        return (

            <div className="row">

                <div className="col-xl-3 col-md-6 mb-4">
                    <StatsLabel
                        textStyling={'text-primary'}
                        borderStyling={'border-left-primary'}
                        text={'External Quality Assessment' + ` ${this.state.timeLine}`}
                        value={this.state.externalQualityAssessment}
                        faIcon={'fa-hands'}
                    ></StatsLabel>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <StatsLabel
                        textStyling={'text-success'}
                        borderStyling={'border-left-success'}
                        text={'Overall Performance' + ` ${this.state.timeLine}`}
                        value={this.state.overallPerformance}
                        faIcon={'fa-book'}
                    ></StatsLabel>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <StatsLabel
                        textStyling={'text-info'}
                        borderStyling={'border-left-info'}
                        text={'Personell Training And Certification' + ` ${this.state.timeLine}`}
                        value={this.state.personellTrainingAndCertification}
                        faIcon={'fa-certificate'}
                    ></StatsLabel>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <StatsLabel
                        textStyling={' text-warning'}
                        borderStyling={'border-left-warning'}
                        text={'Physical Facility' + ` ${this.state.timeLine}`}
                        value={this.state.physicalFacility}
                        faIcon={'fa-hands-helping'}
                    ></StatsLabel>
                </div>

            </div>
        );
    }
}

export default TopLabels;

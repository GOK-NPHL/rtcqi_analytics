import React, { useState, useEffect } from 'react';
import StatsLabel from '../utils/stats/StatsLabel';

function TopLabels(props) {
    const [externalQualityAssessment, setExternalQualityAssessment] = useState(0);
    const [overallPerformance, setOverallPerformance] = useState(0);
    const [personellTrainingAndCertification, setPersonellTrainingAndCertification] = useState(0);
    const [physicalFacility, setPhysicalFacility] = useState(0);
    const [timeLine] = useState('Follow2');

    useEffect(() => {
        if (Array.isArray(props.serverData)) {
            props.serverData.map((dataObjectParent) => {
                setExternalQualityAssessment(dataObjectParent['ExternalQualityAssessment']['follow2']);
                setOverallPerformance(dataObjectParent['OverallPerformance']['follow2']);
                setPersonellTrainingAndCertification(dataObjectParent['PersonellTrainingAndCertification']['follow2']);
                setPhysicalFacility(dataObjectParent['PhysicalFacility']['follow2']);
            });
        } else {
            for (let [orgId, orgUnitDataObject] of Object.entries(props.serverData)) {
                setExternalQualityAssessment(orgUnitDataObject['ExternalQualityAssessment']['follow2']);
                setOverallPerformance(orgUnitDataObject['OverallPerformance']['follow2']);
                setPersonellTrainingAndCertification(orgUnitDataObject['PersonellTrainingAndCertification']['follow2']);
                setPhysicalFacility(orgUnitDataObject['PhysicalFacility']['follow2']);
            }
        }
    }, [props.serverData]);

    return (
        <div className="row">

            <div className="col-xl-3 col-md-6 mb-4">
                <StatsLabel
                    textStyling={'text-primary'}
                    borderStyling={'border-left-primary'}
                    text={'External Quality Assessment' + ` ${timeLine}`}
                    value={externalQualityAssessment}
                    faIcon={'fa-hands'}
                ></StatsLabel>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
                <StatsLabel
                    textStyling={'text-success'}
                    borderStyling={'border-left-success'}
                    text={'Overall Performance' + ` ${timeLine}`}
                    value={overallPerformance}
                    faIcon={'fa-book'}
                ></StatsLabel>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
                <StatsLabel
                    textStyling={'text-info'}
                    borderStyling={'border-left-info'}
                    text={'Personell Training And Certification' + ` ${timeLine}`}
                    value={personellTrainingAndCertification}
                    faIcon={'fa-certificate'}
                ></StatsLabel>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
                <StatsLabel
                    textStyling={' text-warning'}
                    borderStyling={'border-left-warning'}
                    text={'Physical Facility' + ` ${timeLine}`}
                    value={physicalFacility}
                    faIcon={'fa-hands-helping'}
                ></StatsLabel>
            </div>

        </div>
    );
}

export default TopLabels;

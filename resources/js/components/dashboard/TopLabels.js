import React from 'react';
import StatsLabel from '../stats/StatsLabel';

class TopLabels extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {

    }


    render() {
        return (

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

        );
    }
}

export default TopLabels;

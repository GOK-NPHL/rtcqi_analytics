import React from 'react';
import ReactDOM from 'react-dom';
import StatsLabel from '../stats/StatsLabel';


class Dashboard extends React.Component {
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


                </div>



            </React.Fragment>
        );
    }

}

export default Dashboard;

if (document.getElementById('dashboard')) {
    ReactDOM.render(<Dashboard />, document.getElementById('dashboard'));
}
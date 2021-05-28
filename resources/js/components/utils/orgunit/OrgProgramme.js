import React from 'react';
import ReactDOM from 'react-dom';

class OrgProgramme extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        this.onOrgProgrammeChange = this.onOrgProgrammeChange.bind(this);

    }

    onOrgProgrammeChange(date) {
        this.setState({
            startDate: date
        });
    }

    render() {
        const marginLeft = {
            // marginLeft: "16px",
        };
        return (
            <React.Fragment>
                <div style={marginLeft} className="btn-group">
                    <button type="button" className="btn btn-sm btn-outline-primary dropdown-toggle "
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Select Programme
                    </button>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">PMTCT</a>
                        <a className="dropdown-item" href="#">VCT</a>
                        <a className="dropdown-item" href="#">OPD</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#">LAB</a>
                        <a className="dropdown-item" href="#">PITC</a>
                        <a className="dropdown-item" href="#">IPD</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#">VMMC</a>
                        <a className="dropdown-item" href="#">PSC/CCC</a>
                        <a className="dropdown-item" href="#">PEDIATRIC</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#">IPD</a>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default OrgProgramme;
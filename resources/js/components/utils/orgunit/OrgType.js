import React from 'react';
import ReactDOM from 'react-dom';

class OrgType extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        this.onOrgTypeChange = this.onOrgTypeChange.bind(this);

    }

    onOrgTypeChange(date) {
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
                    <button type="button" className="btn btn-sm btn-outline-primary  dropdown-toggle"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Select Timeline
                    </button>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">Baseline</a>
                        <a className="dropdown-item" href="#">Follow-Up 1</a>
                        <a className="dropdown-item" href="#">Follow-Up 2</a>
                        <a className="dropdown-item" href="#">Follow-Up 3</a>
                        {/* <div class="dropdown-divider"></div> */}
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default OrgType;
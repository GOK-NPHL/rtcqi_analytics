import React from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';

class OrgUnitIndicator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            indicatorIndexs: []
        };
        this.orgUnitIndicatorChangeHandler = this.orgUnitIndicatorChangeHandler.bind(this);
    }


    orgUnitIndicatorChangeHandler(event, index) {

        $(event.target).find('.fa-check').toggle();
        let indicatorIndexs = [];
        indicatorIndexs.push(index);

        this.setState({ indicatorIndexs: indicatorIndexs });
        this.props.filterDisplayedIndicator(index);
    }

    render() {
        const marginLeft = {
            // marginLeft: "16px",
        };

        let indicatorSelectOptions = [];
        this.props.orgUnitIndicators.map((indicator, index) => {
            indicatorSelectOptions.push(
                <a
                    key={uuidv4()}
                    className="dropdown-item"
                    href="#"
                    data-index={index}
                    onClick={() => this.orgUnitIndicatorChangeHandler(event, index)}
                >
                    {indicator}
                    <i className="fa fa-check"
                        style={{ "display": this.state.indicatorIndexs.includes(index) ? "" : "none", "color": "green" }}
                        aria-hidden="true"></i>
                </a>);

        });
        return (
            <React.Fragment>
                <div style={marginLeft} className="btn-group">
                    <button type="button" className="btn btn-sm btn-outline-primary dropdown-toggle "
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Select Indicator
                    </button>
                    <div className="dropdown-menu">
                        {indicatorSelectOptions}
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default OrgUnitIndicator;
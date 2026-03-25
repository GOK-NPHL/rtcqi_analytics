import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function OrgUnitIndicator(props) {
    const [indicatorIndexs, setIndicatorIndexs] = useState([]);

    function orgUnitIndicatorChangeHandler(event, index) {
        $(event.target).find('.fa-check').toggle();
        let newIndicatorIndexs = [index];
        setIndicatorIndexs(newIndicatorIndexs);
        props.filterDisplayedIndicator(index);
    }

    const marginLeft = {};

    let indicatorSelectOptions = [];
    props.orgUnitIndicators.map((indicator, index) => {
        indicatorSelectOptions.push(
            <a
                key={uuidv4()}
                className="dropdown-item"
                href="#"
                data-index={index}
                onClick={(event) => orgUnitIndicatorChangeHandler(event, index)}
            >
                {indicator}
                <i className="fa fa-check"
                    style={{ "display": indicatorIndexs.includes(index) ? "" : "none", "color": "green" }}
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

export default OrgUnitIndicator;

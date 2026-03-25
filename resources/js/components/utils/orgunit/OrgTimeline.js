import React, { useState } from 'react';

function OrgTimeline(props) {
    const [timelineType, setTimelineType] = useState([]);

    function onOrgTimelineChange(event, timelineTypeId) {
        $(event.target).find('.fa-check').toggle();
        let newTimelineTypeIds = [];
        if (timelineType.length == 0) {
            newTimelineTypeIds.push(timelineTypeId);
        } else {
            let idInList = false;
            timelineType.map((id) => {
                if (id == timelineTypeId) {
                    idInList = true;
                } else {
                    newTimelineTypeIds.push(id);
                }
            });
            if (!idInList) newTimelineTypeIds.push(timelineTypeId);
        }

        setTimelineType(newTimelineTypeIds);
        props.onOrgTimelineChange(newTimelineTypeIds);
    }

    const marginLeft = {};

    return (
        <React.Fragment>
            <div style={marginLeft} className="btn-group">
                <button type="button" className="btn btn-sm btn-outline-primary  dropdown-toggle"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Select Timeline
                </button>
                <div className="dropdown-menu">
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'baseline')} href="#">
                        Baseline <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow1')} href="#">
                        Follow-Up 1 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow2')} href="#">
                        Follow-Up 2 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow3')} href="#">
                        Follow-Up 3 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow4')} href="#">
                        Follow-Up 4 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow5')} href="#">
                        Follow-Up 5 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow6')} href="#">
                        Follow-Up 6 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow7')} href="#">
                        Follow-Up 7 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow8')} href="#">
                        Follow-Up 8 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow9')} href="#">
                        Follow-Up 9 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'follow10')} href="#">
                        Follow-Up 10 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    <a className="dropdown-item" onClick={(event) => onOrgTimelineChange(event, 'otherFollowup')} href="#">
                        Other Follow-Up <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                    </a>
                    {/* <div class="dropdown-divider"></div> */}
                </div>
            </div>
        </React.Fragment>
    );
}

export default OrgTimeline;

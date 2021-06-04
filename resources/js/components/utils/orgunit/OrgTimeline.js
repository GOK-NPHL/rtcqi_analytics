import React from 'react';
import ReactDOM from 'react-dom';

class OrgTimeline extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            timelineType: []
        };
        this.onOrgTimelineChange = this.onOrgTimelineChange.bind(this);

    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.state.timelineType !== nextState.timelineType
        ) {
            return false;
        } else {
            return true;
        }
    }

    onOrgTimelineChange(event, timelineTypeId) {
        $(event.target).find('.fa-check').toggle();
        let timelineType = this.state.timelineType;
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

        this.setState({ timelineType: newTimelineTypeIds });
        this.props.onOrgTimelineChange(newTimelineTypeIds);
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
                        <a className="dropdown-item" onClick={() => this.onOrgTimelineChange(event, 'baseline')} href="#">
                            Baseline <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                        </a>
                        <a className="dropdown-item" onClick={() => this.onOrgTimelineChange(event, 'follow1')} href="#">
                            Follow-Up 1 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                        </a>
                        <a className="dropdown-item" onClick={() => this.onOrgTimelineChange(event, 'follow2')} href="#">
                            Follow-Up 2 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                        </a>
                        <a className="dropdown-item" onClick={() => this.onOrgTimelineChange(event, 'follow3')} href="#">
                            Follow-Up 3 <i className="fa fa-check" style={{ "display": "none", "color": "green" }} aria-hidden="true"></i>
                        </a>
                        {/* <div class="dropdown-divider"></div> */}
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default OrgTimeline;
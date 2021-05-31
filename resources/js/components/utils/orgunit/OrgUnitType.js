import React from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';

class OrgUnitType extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnitType: []
        };
        this.orgUnitTypeChangeHandler = this.orgUnitTypeChangeHandler.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.state.orgUnitType !== nextState.orgUnitType
        ) {
            return false;
        } else {
            return true;
        }
    }

    orgUnitTypeChangeHandler(event) {
        let orgUnitTypeId = event.target.dataset.id;
        $(event.target).find('.fa-check').toggle();
        let orgUnitType = this.state.orgUnitType;
        let newOrgTypeIds = [];
        if (orgUnitType.length == 0) {
            newOrgTypeIds.push(orgUnitTypeId);
        } else {
            let idInList = false;
            orgUnitType.map((id) => {
                if (id == orgUnitTypeId) {
                    idInList = true;
                } else {
                    newOrgTypeIds.push(id);
                }
            });
            if (!idInList) newOrgTypeIds.push(orgUnitTypeId);
        }

        this.setState({ orgUnitType: newOrgTypeIds });
        this.props.orgUnitTypeChangeHandler(newOrgTypeIds);
    }

    render() {
        const marginLeft = {
            // marginLeft: "16px",
        };
        let orgUnitTypes = ['PMTCT', 'VCT', 'OPD', 'LAB', 'PITC', 'IPD', 'VMMC', 'PSC/CCC', 'PEDIATRIC'];
        let orgTypesSelect = [];
        orgUnitTypes.map((orgType) => {
            orgTypesSelect.push(
                <a
                    key={uuidv4()}
                    className="dropdown-item"
                    href="#"
                    data-id={orgType}
                    onClick={() => this.orgUnitTypeChangeHandler(event)}
                >
                    {orgType} 
                    <i className="fa fa-check"
                        style={{ "display": this.state.orgUnitType.includes(orgType) ? "" : "none", "color": "green" }}
                        aria-hidden="true"></i>
                </a>);
        });
        return (
            <React.Fragment>
                <div style={marginLeft} className="btn-group">
                    <button type="button" className="btn btn-sm btn-outline-primary dropdown-toggle "
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Select Programme
                    </button>
                    <div className="dropdown-menu">
                        {orgTypesSelect}
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default OrgUnitType;
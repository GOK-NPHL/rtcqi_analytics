import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function OrgUnitType(props) {
    const [orgUnitType, setOrgUnitType] = useState([]);

    function orgUnitTypeChangeHandler(event) {
        let orgUnitTypeId = event.target.dataset.id;
        $(event.target).find('.fa-check').toggle();
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

        setOrgUnitType(newOrgTypeIds);
        props.orgUnitTypeChangeHandler(newOrgTypeIds);
    }

    //stops menu options from closing until user clicks outside (in the window)
    $(document).delegate(".dropdown-menu", "click", function (e) {
        e.stopPropagation();
    });

    const marginLeft = {};
    let orgUnitTypes = ['PMTCT', 'VCT', 'OPD', 'LAB', 'PITC', 'IPD', 'VMMC', 'PSC/CCC', 'PEDIATRIC'];
    let orgTypesSelect = [];
    orgUnitTypes.map((orgType) => {
        orgTypesSelect.push(
            <a
                key={uuidv4()}
                className="dropdown-item"
                href="#"
                data-id={orgType}
                onClick={(event) => {
                    orgUnitTypeChangeHandler(event);
                }}
            >
                {orgType}
                <i className="fa fa-check"
                    style={{ "display": orgUnitType.includes(orgType) ? "" : "none", "color": "green" }}
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

export default OrgUnitType;

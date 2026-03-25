import React, { useState, useEffect } from 'react';
import { DevelopOrgStructure, FetchOrgunits } from '../Helpers';
import TreeView from '../TreeView';

function OrgUnitButton(props) {
    const [selectedOrgs, setSelectedOrgs] = useState({});
    const [orgUnits, setOrgUnits] = useState(undefined);

    useEffect(() => {
        window.addEventListener('mouseup', function (event) {
            try {
                let pol = Array.prototype.slice.call(document.getElementById('spi_orgunits').getElementsByTagName("*"));
                if ((!pol.includes(event.target) && !pol.includes(event.target.parentNode)) && event.target != document.getElementById('close_orgunits')) {
                    $("#spi_orgunits").hide();
                    $("#org_unit_button").show();
                }
            } catch (err) {
                //console.log(err);
            }
        });

        (async () => {
            let httpOrgUnits = await FetchOrgunits();
            httpOrgUnits = DevelopOrgStructure(httpOrgUnits);
            setOrgUnits(httpOrgUnits);
        })();
    }, []);

    function selectOrgUnitHandler(orgunit) {
        if (orgunit.length != 0) {
            let newSelectedOrgs = { ...selectedOrgs };
            if (orgunit.id in newSelectedOrgs) {
                delete newSelectedOrgs[orgunit.id];
            } else {
                newSelectedOrgs[orgunit.id] = orgunit;
            }
            setSelectedOrgs(newSelectedOrgs);
            let orgUnitsList = [];
            for (let [key, value] of Object.entries(newSelectedOrgs)) {
                orgUnitsList.push(key);
            }
            props.orgUnitChangeHandler(orgUnitsList);
        }
    }

    return (
        <React.Fragment>

            <button
                id="org_unit_button"
                onClick={() => {
                    $("#org_unit_button").toggle();
                    $("#spi_orgunits").toggle();
                }}
                type="button"
                className="btn btn-sm btn-outline-primary">
                Organisation unit <i className="fas fa-caret-down"></i>
                {/* <i className="fa fa-filter"></i> */}
            </button>

            <div className="card hide_org_filter"
                id="spi_orgunits"
                style={{
                    "display": "none",
                    "position": "absolute",
                    "zIndex": "999",
                    "backgroundColor": "white"
                }}>
                <div className="card-body hide_org_filter" style={{ "minHeight": "100px", "minWidth": "260px" }} >
                    <div className="hide_org_filter">
                        <div className="hide_org_filter"
                            style={{
                                "overflow": "scroll",
                                "maxHeight": "320px",
                                "paddingBottom": "6px",
                                "paddingRight": "16px",
                            }} >
                            <p> Select Organisation Unit </p>
                            <TreeView addCheckBox={true} clickHandler={selectOrgUnitHandler} orgUnits={orgUnits} />
                        </div>
                        <br />
                        <div>
                            <button
                                id="close_orgunits"
                                onClick={() => {
                                    $("#org_unit_button").toggle();
                                    $("#spi_orgunits").toggle();
                                }}
                                type="button"
                                className="btn btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default OrgUnitButton;

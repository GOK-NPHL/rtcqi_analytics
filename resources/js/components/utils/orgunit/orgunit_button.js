import React from 'react';
import ReactDOM from 'react-dom';
import { DevelopOrgStructure, FetchOrgunits } from '../Helpers';
import TreeView from '../TreeView';

class OrgUnitButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedOrgs: {}
        };
        this.selectOrgUnitHandler = this.selectOrgUnitHandler.bind(this);
    }

    componentDidMount() {
        (async () => {
            let httpOrgUnits = await FetchOrgunits();
            httpOrgUnits = DevelopOrgStructure(httpOrgUnits);
            this.setState({
                orgUnits: httpOrgUnits,
            });
        })();

    }

    selectOrgUnitHandler(orgunit) {

        if (orgunit.length != 0) {
            let selectedOrgs = this.state.selectedOrgs;
            if (orgunit.id in selectedOrgs) {
                delete selectedOrgs[orgunit.id];
            } else {
                selectedOrgs[orgunit.id] = orgunit;
            }
            this.setState({
                selectedOrgs: selectedOrgs
            });
            let orgUnitsList = [];
            for (let [key, value] of Object.entries(selectedOrgs)) {
                orgUnitsList.push(key);
            }
            console.log(orgUnitsList);
            this.props.orgUnitChangeHandler(orgUnitsList);
        }

    }


    render() {
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
                    Organisation unit<i className="fa fa-filter"></i>
                </button>

                <div className="card"
                    id="spi_orgunits"
                    style={{
                        "display": "none",
                        "position": "absolute",
                        "zIndex": "999",
                        "backgroundColor": "white"
                    }}>
                    <div className="card-body" style={{ "minHeight": "100px", "minWidth":"260px" }} >
                        <div>
                            <div
                                style={{
                                    "overflow": "scroll",
                                    "maxHeight": "320px", //"minHeight": "220px",
                                    "paddingBottom": "6px",
                                    "paddingRight": "16px",
                                }} >
                                <p> Select Organisation Unit </p>
                                <TreeView addCheckBox={true} clickHandler={this.selectOrgUnitHandler} orgUnits={this.state.orgUnits} />
                            </div>
                            <br />
                            <div>
                                <button
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

}

export default OrgUnitButton;
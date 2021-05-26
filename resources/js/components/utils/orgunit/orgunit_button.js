import React from 'react';
import ReactDOM from 'react-dom';
import { DevelopOrgStructure, FetchOrgunits } from '../Helpers';
import TreeView from '../TreeView';

class OrgUnitButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date()
        };
        this.selectOrgUnitHandler = this.selectOrgUnitHandler.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
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

        let selectedOrgs = this.state.selectedOrgs;
        if (orgunit.id in selectedOrgs) {
            delete selectedOrgs[orgunit.id];
        } else {
            selectedOrgs[orgunit.id] = orgunit;
        }
        this.setState({
            selectedOrgs: selectedOrgs
        });
    }

    onDateChange(date) {
        this.setState({
            startDate: date
        });
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
                    className="btn btn-outline-primary">
                    Organisation Unit<i className="fa fa-filter"></i>
                </button>

                <div className="card" id="spi_orgunits" style={{ "display": "none" }}>
                    <div className="card-body">
                        <div>
                            <div
                                style={{
                                    "overflow": "scroll",
                                    "maxHeight": "20px", "minHeight": "300px",
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
                                    className="btn btn-outline-primary">Set Selected Orgunits</button>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default OrgUnitButton;
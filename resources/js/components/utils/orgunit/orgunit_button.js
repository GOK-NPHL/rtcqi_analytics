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

        window.addEventListener('mouseup', function (event) {
            try {
                let pol = Array.prototype.slice.call(document.getElementById('spi_orgunits').getElementsByTagName("*"));
                if ((!pol.includes(event.target) && !pol.includes(event.target.parentNode)) && event.target != document.getElementById('close_orgunits')) {
                    // pol.style.display = 'none';
                    // $("#org_unit_button").toggle();
                    $("#spi_orgunits").hide();
                    $("#org_unit_button").show();
                }
            }catch(err){
                console.log(err);
            }
           
        });
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
                    Organisation unit <i class="fas fa-caret-down"></i>
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
                                    "maxHeight": "320px", //"minHeight": "220px",
                                    "paddingBottom": "6px",
                                    "paddingRight": "16px",
                                }} >
                                <p> Select Organisation Unit </p>
                                <TreeView addCheckBox={true} clickHandler={this.selectOrgUnitHandler} orgUnits={this.state.orgUnits} />
                            </div>
                            {/* <br />
                            <div>
                                <button
                                    id="close_orgunits"
                                    onClick={() => {
                                        $("#org_unit_button").toggle();
                                        $("#spi_orgunits").toggle();
                                    }}
                                    type="button"
                                    className="btn btn-primary">Close</button>
                            </div> */}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default OrgUnitButton;
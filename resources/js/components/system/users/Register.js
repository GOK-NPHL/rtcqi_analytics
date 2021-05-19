import React from 'react';
import ReactDOM from 'react-dom';
import { FetchRoles, SaveRole, UpdateRole, DevelopOrgStructure, FetchOrgunits } from '../../utils/Helpers';
import TreeView from '../../utils/TreeView';
import DualListBox from 'react-dual-listbox';


class Register extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            selected: [],
            role: '',
            roles: {},
            selectedOrgs: {},
            permissionOptions: []
        };

        this.saveRole = this.saveRole.bind(this);
        this.authoritiesOnChange = this.authoritiesOnChange.bind(this);
        this.selectOrgUnitHandler = this.selectOrgUnitHandler.bind(this);
    }

    componentDidMount() {
        (async () => {
            let roles = await FetchRoles();
            console.log(roles);
            let httpOrgUnits = await FetchOrgunits();
            // console.log(httpOrgUnits);
            httpOrgUnits = DevelopOrgStructure(httpOrgUnits);
            this.setState({
                orgUnits: httpOrgUnits,
                roles: roles
            });
        })();
    }

    //    shouldComponentUpdate(nextProps, nextState) {
    // if (
    //     nextProps.selectedOrgs !== nextProps.selectedOrgs 
    // ) {
    //     return false;
    // } else {
    //     return true;
    // }
    // }

    authoritiesOnChange(selected) {
        this.setState({ selected: selected });
    };

    saveRole() {
        if (this.props.editMode) {
            (async () => {
                console.log(this.props.roleToEdit);
                let returnedData = await UpdateRole(this.props.roleToEdit.role_id, this.state.roleName, this.state.selected);
                this.props.fetchRoles();
                this.props.toggleDisplay();
            })();
        } else {
            (async () => {
                let returnedData = await SaveRole(this.state.roleName, this.state.selected);
                this.props.fetchRoles();
                this.props.toggleDisplay();
            })();
        }
        this.props.updateEditMode(false);
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

    render() {
        let roles = [];
        let selectedOrgs = [];
        for (const [key, value] of Object.entries(this.state.roles)) {
            roles.push(<option key={key} id={key}>{value.role_name}</option>);
        }
        let count = 1;
        for (const [key, value] of Object.entries(this.state.selectedOrgs)) {
            selectedOrgs.push(<p key={key} data-id={key}>{count}. {value.name}</p>);
            count += 1;
        }

        return (
            <React.Fragment>

                <div id="registration_form" className="card shadow mb-4">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary">Registration Form</h6>
                    </div>
                    <div className="card-body">

                        <div className="card mb-4 py-3 border-left-secondary">
                            <div className="card-body">
                                <form className="needs-validation" noValidate>
                                    <div className="form-row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="validationTooltip01">First name</label>
                                            <input type="text" className="form-control" id="validationTooltip01" required />
                                            <div className="valid-tooltip">Looks good!</div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="validationTooltip02">Last name</label>
                                            <input type="text" className="form-control" id="validationTooltip02" required />
                                            <div className="valid-tooltip">Looks good!</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="validationTooltip03">Email</label>
                                            <input type="text" className="form-control" id="validationTooltip03" required />
                                            <div className="invalid-tooltip">Please provide a valid Email. </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="validationTooltip05">Role</label>
                                            <select className="form-control" id="exampleFormControlSelect1">
                                                <option defaultValue>--Select user role--</option>
                                                {roles}
                                            </select>
                                        </div>
                                    </div>


                                    <div className="form-row">
                                        <div className="col-md-6 mb-6">
                                            <div style={{ "overflow": "scroll", "maxHeight": "300px", "minHeight": "300px", "paddingBottom": "6px", "paddingRight": "16px" }} >
                                                <p> Select Organisation Unit </p>
                                                <TreeView addCheckBox={true} clickHandler={this.selectOrgUnitHandler} orgUnits={this.state.orgUnits} />
                                            </div>
                                        </div>
                                        <div id="selectedOrgs" className="col-md-6 mb-6">
                                            <div style={{ "overflow": "scroll", "maxHeight": "300px", "minHeight": "300px", "paddingBottom": "6px", "paddingRight": "16px" }} >
                                                <p> Selected Organisation Units </p>
                                                {selectedOrgs}
                                            </div>
                                        </div>
                                    </div>

                                    <button className="btn btn-primary" type="submit">Save User</button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default Register;

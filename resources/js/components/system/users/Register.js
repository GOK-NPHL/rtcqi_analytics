import React from 'react';
import ReactDOM from 'react-dom';
import { FetchRoles, Saveuser, DevelopOrgStructure, FetchOrgunits } from '../../utils/Helpers';
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
            permissionOptions: [],
            message: '',
            first_name: '',
            last_name: '',
            email: '',
            password: ''

        };

        this.saveUser = this.saveUser.bind(this);
        this.roleOnChange = this.roleOnChange.bind(this);
        this.selectOrgUnitHandler = this.selectOrgUnitHandler.bind(this);
    }

    componentDidMount() {
        (async () => {
            let roles = await FetchRoles();
            let httpOrgUnits = await FetchOrgunits();
            if (this.props.userActionState == 'edit') {
                alert("edit");
            }
            httpOrgUnits = DevelopOrgStructure(httpOrgUnits);
            this.setState({
                orgUnits: httpOrgUnits,
                roles: roles
            });
        })();
    }

    saveUser() {

        (async () => {

            let response = await Saveuser(
                this.state.first_name,
                this.state.last_name,
                this.state.email,
                this.state.password,
                this.state.selectedOrgs,
                this.state.role
            );
            
            if (response) {

                this.setState({
                    message: response.data.Message
                });

                $('#saveUserModal').modal('toggle');
            }

        })();
    }

    shouldComponentUpdate(nextProps, nextState) {

        if (
            nextState.first_name != this.state.first_name ||
            nextState.last_name != this.state.last_name ||
            nextState.email != this.state.email ||
            nextState.password != this.state.password ||
           // nextState.selectedOrgs != this.state.selectedOrgs ||
            nextState.role != this.state.role
        ) {
            return false;
        } else {
            return true;
        }
    }

    roleOnChange(event) {
        this.setState({ role: event.target.value });
    };

    selectOrgUnitHandler(orgunit) {

        let selectedOrgs = { ...this.state.selectedOrgs };
        if (orgunit.id in selectedOrgs) {
            delete selectedOrgs[orgunit.id];
        } else {
            selectedOrgs[orgunit.id] = orgunit;
        }
        this.setState({
            selectedOrgs: selectedOrgs
        });
    }

    // render
    render() {
        let roles = [];
        let selectedOrgs = [];
        for (const [key, value] of Object.entries(this.state.roles)) {
            roles.push(<option key={key} value={key}>{value.role_name}</option>);
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
                                            <input type="text"
                                                onChange={(event) => {
                                                    this.setState({
                                                        first_name: event.target.value
                                                    });
                                                }}
                                                className="form-control"
                                                id="validationTooltip01" required />
                                            <div className="valid-tooltip">user first name</div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="validationTooltip02">Last name</label>
                                            <input
                                                onChange={(event) => {
                                                    this.setState({
                                                        last_name: event.target.value
                                                    });
                                                }}
                                                type="text"
                                                className="form-control"
                                                id="validationTooltip02" required />
                                            <div className="valid-tooltip">user last name</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="validationTooltip03">Email</label>
                                            <input
                                                onChange={(event) => {
                                                    this.setState({
                                                        email: event.target.value
                                                    });
                                                }}
                                                type="text"
                                                className="form-control"
                                                id="validationTooltip03" required />
                                            <div className="invalid-tooltip">Please provide a valid Email. </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="validationTooltip05">Role</label>
                                            <select onChange={() => this.roleOnChange(event)} className="form-control" id="exampleFormControlSelect1">
                                                <option defaultValue>--Select user role--</option>
                                                {roles}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="validationTooltip04">Password</label>
                                            <input type="text"
                                                onChange={(event) => {
                                                    this.setState({
                                                        password: event.target.value
                                                    });
                                                }}
                                                className="form-control"
                                                id="validationTooltip04"
                                                required />
                                            <div className="invalid-tooltip">Please provide a valid Email. </div>
                                        </div>
                                    </div>
                                    <br />
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

                                    <button
                                        onClick={() => this.saveUser()}
                                        style={{ "marginTop": "10px" }}
                                        className="btn btn-primary"
                                        type="submit">Save User</button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
                {/* user persist alert box */}
                <div className="modal fade" id="saveUserModal" tabIndex="-1" role="dialog" aria-labelledby="saveUserModalTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Notice!</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p id="modal-message">{this.state.message}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" 
                                onClick={
                                    () => this.props.toggleDisplay()
                                } 
                                className="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default Register;

import React from 'react';
import ReactDOM from 'react-dom';
import { FetchAuthorities, SaveRole, UpdateRole } from '../../utils/Helpers';
import DualListBox from 'react-dual-listbox';


class RoleCreate extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            selected: [],
            roleName: '',
            permissionOptions: []
        };

        this.saveRole = this.saveRole.bind(this);
        this.authoritiesOnChange = this.authoritiesOnChange.bind(this);
    }

    componentDidMount() {
        (async () => {
            let returnedData = await FetchAuthorities();
            let categories = [];
            let permissionOptions = [];
            returnedData.map((obj) => {
                if (categories.includes(obj.group)) {
                    permissionOptions.map((objStructure) => {
                        if (objStructure.label == obj.group) {
                            objStructure.options.push({ 'value': obj.id, 'label': obj.name });
                        }
                    });
                } else {
                    let selection = {};
                    let options = [];
                    selection['label'] = obj.group;
                    options.push({ 'value': obj.id, 'label': obj.name });
                    selection['options'] = options;
                    permissionOptions.push(selection);
                    categories.push(obj.group);
                }

            });
            this.setState({
                permissionOptions: permissionOptions,
            });
        })();

        if (this.props.editMode) {
            console.log(this.props.roleToEdit);
            this.setState({roleName:this.props.roleToEdit.role_name});
            let currentAuthorities = this.props.roleToEdit.authorities;
            let selected = [];
            for (const [key, value] of Object.entries(currentAuthorities)) {
                for (let i = 0; i < value.length; i++) {
                    selected.push(value[i]);
                }
            }

            console.log(selected);
            this.setState({ selected: selected });
        }

    }

    authoritiesOnChange(selected) {
        this.setState({ selected: selected });
    };

    saveRole() {
        if (this.props.editMode) {
            (async () => {
                let returnedData = await UpdateRole(this.props.roleToEdit.role_id,this.state.roleName, this.state.selected);
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



    render() {

        return (
            <React.Fragment>

                <div id="registration_form" className="card shadow mb-4">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary">Role Creation</h6>
                    </div>
                    <div className="card-body">

                        <div className="card mb-4 py-3 border-left-secondary">
                            <div className="card-body">
                                <form className="needs-validation" noValidate>
                                    <div className="form-row">
                                        <div className="col-md-12 mb-3">
                                            <label htmlFor="role_name">Role name</label>
                                            <input type="text" onChange={event => this.setState({ roleName: event.target.value })}
                                                value={this.state.roleName} className="form-control" id="role_name" required />
                                            <div className="valid-tooltip">Role name</div>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <label htmlFor="permissions">Assign permissions</label>
                                            <DualListBox
                                                canFilter
                                                options={this.state.permissionOptions}
                                                selected={this.state.selected}
                                                onChange={this.authoritiesOnChange}
                                            />
                                        </div>
                                    </div>
                                    <button onClick={this.saveRole} className="btn btn-primary" type="submit">Save Role</button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default RoleCreate;

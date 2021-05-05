import React from 'react';
import ReactDOM from 'react-dom';
import { FetchAuthorities, SaveRole } from '../../utils/Helpers';
import DualListBox from 'react-dual-listbox';


class RoleCreate extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            selected: [],
            roleName: '',
            permissionOptions: [
                {
                    label: 'Earth',
                    options: [
                        { value: 'luna', label: 'Moon' },
                    ],
                },
                {
                    label: 'Mars',
                    options: [
                        { value: 'phobos', label: 'Phobos' },
                        { value: 'deimos', label: 'Deimos' },
                    ],
                },
                {
                    label: 'Jupiter',
                    options: [
                        { value: 'io', label: 'Io' },
                        { value: 'europa', label: 'Europa' },
                        { value: 'ganymede', label: 'Ganymede' },
                        { value: 'callisto', label: 'Callisto' },
                    ],
                },
            ]
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
    }

    authoritiesOnChange(selected) {
        this.setState({ selected });
    };

    saveRole() {
        (async () => {
            let returnedData = await SaveRole(this.state.roleName, this.state.selected);
        })();
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
                                <form className="needs-validation" novalidate>
                                    <div className="form-row">
                                        <div className="col-md-12 mb-3">
                                            <label for="role_name">Role name</label>
                                            <input type="text" onChange={event => this.setState({ roleName: event.target.value })} className="form-control" id="role_name" required />
                                            <div className="valid-tooltip">Role name</div>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <label for="permissions">Assign permissions</label>
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

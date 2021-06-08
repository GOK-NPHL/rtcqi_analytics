import React from 'react';
import ReactDOM from 'react-dom';
import { FetchRoles, DeleteRole, FetchUserAuthorities } from '../../utils/Helpers';


import DropdownTreeSelect from 'react-dropdown-tree-select';
import RoleCreate from './CreateRoles';

class Roles extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            showUserTable: true,
            roles: [],
            allowedPermissions: []
        }
        this.onChange = this.onChange.bind(this);
        this.toggleDisplay = this.toggleDisplay.bind(this);
        this.fetchRoles = this.fetchRoles.bind(this);
        this.deleteRole = this.deleteRole.bind(this);
        this.editRole = this.editRole.bind(this);
        this.updateEditMode = this.updateEditMode.bind(this);

    }

    fetchRoles() {
        (async () => {
            let returnedData = await FetchRoles();
            this.setState({
                roles: returnedData,
            });

        })();

    }

    componentDidMount() {
        //fetch roles
        (async () => {
            let allowedPermissions = await FetchUserAuthorities();
            this.setState({
                allowedPermissions: allowedPermissions
            });
            //check autorization
            if (allowedPermissions.length > 0) {
                if (this.state.allowedPermissions.includes('view_role')) {
                    this.fetchRoles();
                }
            }
        })();

    }

    componentDidUpdate(prevProps) {
        if (this.state.allowedPermissions.length > 0) {
            if (this.state.allowedPermissions.includes('view_role')) {
                if (this.props.roles != prevProps.roles) {
                    this.fetchRoles();
                }
            }
        }
    }

    deleteRole(role_id) {
        if (this.state.allowedPermissions.length > 0) {
            if (this.state.allowedPermissions.includes('delete_role')) {
                (async () => {
                    let returnedData = await DeleteRole(role_id);
                    if (returnedData) {
                        this.setState({
                            responseMessage: returnedData.data.Message
                        })
                        $('#deleteRoleModal').modal('toggle');
                        this.fetchRoles();
                    }

                })();
            }
        }

    }

    editRole(roleToEdit) {
        let booll = this.state.showUserTable;
        this.setState({
            showUserTable: !booll,
            roleToEdit: roleToEdit,
            editMode: true,
        });
    }

    updateEditMode(editMode) {
        this.setState({
            editMode: editMode,
        });
    }

    onChange(currentNode, selectedNodes) {
        console.log("path::", currentNode.path);
    };

    toggleDisplay() {
        let booll = this.state.showUserTable;
        this.setState({
            showUserTable: !booll
        });
    }

    render() {
        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "5px"
        };

        // this.assignObjectPaths(data);

        const regForm = {
            color: "white",
            backgroundColor: "DodgerBlue",
            padding: "10px",
            fontFamily: "Arial"
        };
        let pageContent = '';


        var tableRows = [];

        if (Object.keys(this.state.roles).length === 0 && this.state.roles.constructor === Object) {
            tableRows.push(<tr>
                <td>1</td>
                <td colspan="4" style={{ textAlign: 'center' }}>No Roles Defined</td>
            </tr>);
        } else {
            let index = 0;
            for (const [key, value] of Object.entries(this.state.roles)) {
                index = index + 1;
                tableRows.push(<tr key={index}>
                    <td>{index}</td>
                    <td>{value.role_name}</td>
                    <td>{value.editor}</td>
                    <td>{value.updated_at}</td>
                    {
                        (this.state.allowedPermissions.length > 0) &&
                            (this.state.allowedPermissions.includes('edit_role') || this.state.allowedPermissions.includes('delete_role')) ?
                            <td>
                                {(this.state.allowedPermissions.length > 0) && this.state.allowedPermissions.includes('edit_role') ?
                                    <a onClick={() => this.editRole(value)} href="#" style={{ 'marginRight': '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                        <i className="fas fa-user-edit"></i>
                                    </a> : undefined
                                }
                                {(this.state.allowedPermissions.length > 0) && this.state.allowedPermissions.includes('delete_role') ?
                                    <a onClick={() => this.deleteRole(value.role_id)} className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                        <i className="fas fa-user-times"></i>
                                    </a> : undefined
                                }

                            </td> : undefined
                    }

                </tr>);
            }
        }

        let alertBox =
            < div className="modal fade" id="deleteRoleModal" tabIndex="-1" role="dialog" aria-labelledby="deleteRoleModalTitle" aria-hidden="true" >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Notice!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {
                                this.state.responseMessage ? this.state.responseMessage : ''
                            }
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div >

        if (this.state.showUserTable) {
            if (this.state.allowedPermissions.length > 0) {
                if (this.state.allowedPermissions.includes('view_role')) {
                    pageContent = <div id='user_table' className='row'>
                        <div className='col-sm-12 col-md-12'>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Editor</th>
                                        <th scope="col">Last Updated</th>
                                        {(this.state.allowedPermissions.length > 0) &&
                                            (this.state.allowedPermissions.includes('edit_role') || this.state.allowedPermissions.includes('delete_role')) ?
                                            <th scope="col">Action</th> : undefined}
                                    </tr>
                                </thead>
                                <tbody>

                                    {tableRows}

                                </tbody>
                            </table>
                        </div>
                    </div>;
                }
            }
        } else {
            pageContent = <RoleCreate
                fetchRoles={this.fetchRoles}
                toggleDisplay={this.toggleDisplay}
                editMode={this.state.editMode}
                roleToEdit={this.state.roleToEdit}
                updateEditMode={this.updateEditMode}
            />;
            if (this.state.allowedPermissions.length > 0) {
                if (!this.state.editMode && !this.state.allowedPermissions.includes('add_role')) {
                    pageContent = '';
                } else if (this.state.editMode && !this.state.allowedPermissions.includes('edit_role')) {
                    pageContent = '';
                }
            }
        }

        let roleCreateButton = '';
        if (this.state.allowedPermissions.length > 0) {
            if (this.state.allowedPermissions.includes('add_role')) {
                roleCreateButton = <a href="#" onClick={this.toggleDisplay} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-users fa-sm text-white-50"></i> Create Roles</a>;
            }
        }

        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Roles Management</h1>
                    {roleCreateButton}
                </div>
                {pageContent}
                {alertBox}
            </React.Fragment>
        );
    }

}

export default Roles;

if (document.getElementById('roles')) {
    ReactDOM.render(<Roles />, document.getElementById('roles'));
}
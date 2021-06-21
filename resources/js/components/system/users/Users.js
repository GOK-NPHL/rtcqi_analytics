import React from 'react';
import ReactDOM from 'react-dom';

import DropdownTreeSelect from 'react-dropdown-tree-select';
import Register from './Register';
import { FetchUsers, DeleteUser, FetchUserAuthorities } from '../../utils/Helpers';

class User extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showUserTable: true,
            users: [],
            selectedUser: null,
            allowedPermissions: [],
            userActionState: 'userList'
        }
        this.onChange = this.onChange.bind(this);
        this.toggleDisplay = this.toggleDisplay.bind(this);
        this.getUsers = this.getUsers.bind(this);
    }

    componentDidMount() {
        (async () => {
            let users = await FetchUsers();
            let allowedPermissions = await FetchUserAuthorities();
            this.setState({
                users: users,
                allowedPermissions: allowedPermissions
            });
        })();
    }

    getUsers() {
        (async () => {
            let users = await FetchUsers();
            this.setState({
                users: users,
            });
        })();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.showUserTable !== this.state.showUserTable) {
            this.getUsers();
        }
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

    // shouldComponentUpdate(nextProps, nextState) {
    //     if (this.state.nextState != nextState.selectedUser) {
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }

    deleteUser() {
        (async () => {
            let response = await DeleteUser(this.state.selectedUser);
            this.setState({
                responseMessage: response.data.Message
            });
            $('#deleteUserModal').modal('toggle');
            this.getUsers();
        })();
    }

    render() {
        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "5px"
        };

        let users = [];
        if (this.state.users.length > 0) {
            this.state.users.map((user, index) => {
                users.push(<tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.role_name}</td>
                    {
                        this.state.allowedPermissions.includes('edit_user') ||
                            this.state.allowedPermissions.includes('delete_user') ?
                            <td>
                                {
                                    this.state.allowedPermissions.includes('edit_user') ?
                                        <a
                                            onClick={
                                                () => {
                                                    this.toggleDisplay();
                                                    this.setState({
                                                        userActionState: 'edit'
                                                    });
                                                }
                                            }
                                            style={{ 'marginRight': '5px' }}
                                            className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                            <i className="fas fa-user-edit"></i>
                                        </a> : ''
                                }
                                {
                                    this.state.allowedPermissions.includes('delete_user') ?
                                        <a
                                            onClick={() => {
                                                this.setState({
                                                    selectedUser: user
                                                });
                                                $('#deleteConfirmModal').modal('toggle');
                                            }} className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                            <i className="fas fa-user-times"></i>
                                        </a> : ''
                                }
                            </td> : ''
                    }

                </tr>
                );
            });
        }

        // this.assignObjectPaths(data);

        const regForm = {
            color: "white",
            backgroundColor: "DodgerBlue",
            padding: "10px",
            fontFamily: "Arial"
        };
        let pageContent = '';

        if (this.state.showUserTable && this.state.allowedPermissions.includes('view_user')) {
            pageContent = <div id='user_table' className='row'>
                <div className='col-sm-12 col-md-12'>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Role</th>
                                {
                                    this.state.allowedPermissions.includes('edit_user') ||
                                        this.state.allowedPermissions.includes('delete_user') ?
                                        <th scope="col">Action</th> : ''
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {users}
                        </tbody>
                    </table>
                </div>
            </div>;
        } else {
            if (this.state.allowedPermissions.includes('add_user'))
                pageContent = <Register userActionState={this.state.userActionState} toggleDisplay={this.toggleDisplay} />;
        }

        let confirmationBox =
            < div className="modal fade" id="deleteConfirmModal" tabIndex="-1" role="dialog" aria-labelledby="deleteConfirmModalTitle" aria-hidden="true" >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Notice!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            Delete {
                                this.state.selectedUser ? this.state.selectedUser.first_name : ''
                            }?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button"
                                onClick={() => {
                                    this.deleteUser();
                                    $('#deleteConfirmModal').modal('toggle');
                                }}
                                className="btn btn-primary">Delete</button>
                        </div>
                    </div>
                </div>
            </div >

        let alertBox =
            < div className="modal fade" id="deleteUserModal" tabIndex="-1" role="dialog" aria-labelledby="deleteUserModalTitle" aria-hidden="true" >
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

        let createUsers = '';
        if (this.state.allowedPermissions.includes('add_user') && this.state.userActionState == 'userList') {
            createUsers = <a href="#"
                onClick={
                    () => {
                        this.toggleDisplay();
                        this.setState({
                            userActionState: 'create'
                        });
                    }
                }
                className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-user fa-sm text-white-50"></i> Create Users</a>;
        } else if (this.state.userActionState != 'userList') {
            createUsers = <a href="#"
                onClick={
                    () => {
                        this.toggleDisplay();
                        this.setState({
                            userActionState: 'userList'
                        });
                    }
                }
                className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i class="fas fa-arrow-left"></i> Back</a>;
        }


        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Users Management</h1>
                    {createUsers}

                </div>

                {pageContent}
                {confirmationBox}
                {alertBox}
            </React.Fragment >
        );
    }

}

export default User;

if (document.getElementById('users')) {
    ReactDOM.render(<User />, document.getElementById('users'));
}
import React from 'react';
import ReactDOM from 'react-dom';

import DropdownTreeSelect from 'react-dropdown-tree-select';
import Register from './Register';
import { FetchUsers } from '../../utils/Helpers';

class User extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showUserTable: true,
            users: []
        }
        this.onChange = this.onChange.bind(this);
        this.toggleDisplay = this.toggleDisplay.bind(this);
    }

    componentDidMount() {
        (async () => {
            let users = await FetchUsers();
            console.log(users);
            this.setState({
                users: users,
            });
        })();
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

        let users = [];
        if (this.state.users.length > 0) {
            this.state.users.map((user, index) => {
                users.push(<tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.role_name}</td>
                    <td>
                        <a href="#" style={{ 'marginRight': '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                            <i className="fas fa-user-edit"></i>
                        </a>
                        <a className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                            <i className="fas fa-user-times"></i>
                        </a>
                    </td>
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

        if (this.state.showUserTable) {
            pageContent = <div id='user_table' className='row'>
                <div className='col-sm-12 col-md-12'>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Role</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users}
                        </tbody>
                    </table>
                </div>
            </div>;
        } else {
            pageContent = <Register toggleDisplay={this.toggleDisplay} />;
        }

        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Users Management</h1>
                    <a href="#" onClick={this.toggleDisplay} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-user fa-sm text-white-50"></i> Create Users</a>
                </div>

                {pageContent}

            </React.Fragment >
        );
    }

}

export default User;

if (document.getElementById('users')) {
    ReactDOM.render(<User />, document.getElementById('users'));
}
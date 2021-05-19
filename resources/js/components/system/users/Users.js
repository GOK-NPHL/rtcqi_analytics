import React from 'react';
import ReactDOM from 'react-dom';

import DropdownTreeSelect from 'react-dropdown-tree-select';
import Register from './Register';

class User extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showUserTable: true
        }
        this.onChange = this.onChange.bind(this);
        this.toggleDisplay = this.toggleDisplay.bind(this);
    }

    onChange(currentNode, selectedNodes) {
        console.log("path::", currentNode.path);
    };

    toggleDisplay() {
        let booll= this.state.showUserTable;
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

        if (this.state.showUserTable) {
            pageContent = <div id='user_table' className='row'>
                <div className='col-sm-12 col-md-12'>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Organisation Unit</th>
                                <th scope="col">Role</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">1</th>
                                <td>Mark Odour</td>
                                <td>mark@mail.com</td>
                                <td>Nairobi</td>
                                <td>Implementing Partner</td>
                                <td>
                                    <a href="#" style={{ 'marginRight': '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                        <i className="fas fa-user-edit"></i>
                                    </a>
                                    <a className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                        <i className="fas fa-user-times"></i>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">2</th>
                                <td>Jacob juma</td>
                                <td>Jacob@mail.com</td>
                                <td>Kakamega</td>
                                <td>CMLC</td>
                                <td>
                                    <a href="#" style={{ 'marginRight': '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                        <i className="fas fa-user-edit"></i>
                                    </a>
                                    <a className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                        <i className="fas fa-user-times"></i>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">3</th>
                                <td>Larry Mko</td>
                                <td>Larry@mail.com</td>
                                <td>Kenya</td>
                                <td>National Manager</td>
                                <td>
                                    <a href="#" style={{ 'marginRight': '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                        <i className="fas fa-user-edit"></i>
                                    </a>
                                    <a className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                        <i className="fas fa-user-times"></i>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">3</th>
                                <td>Larry Mko</td>
                                <td>Larry@mail.com</td>
                                <td>Dagoretti North Subcounty</td>
                                <td>SUB CMLC</td>
                                <td>
                                    <a href="#" style={{ 'marginRight': '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                        <i className="fas fa-user-edit"></i>
                                    </a>
                                    <a className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                        <i className="fas fa-user-times"></i>
                                    </a>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>;
        } else {
            pageContent = <Register/>;
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
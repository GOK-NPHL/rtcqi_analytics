import React from 'react';
import ReactDOM from 'react-dom';

import DropdownTreeSelect from 'react-dropdown-tree-select';
import TreeDrop from './TreeDrop';

class User extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
        this.onChange = this.onChange.bind(this);
    }

    onChange(currentNode, selectedNodes) {
        console.log("path::", currentNode.path);
    };


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

        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Users Management</h1>
                    <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-user fa-sm text-white-50"></i> Create Users</a>
                </div>

                {/* Users Table */}
                <div className='row'>
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
                </div>
                {/* End Users Table */}


                {/* Registration Form */}

                <div className="card shadow mb-4">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary">Registration Form</h6>
                    </div>
                    <div className="card-body">

                        <div className="card mb-4 py-3 border-left-secondary">
                            <div className="card-body">
                                <form className="needs-validation" novalidate>
                                    <div className="form-row">
                                        <div className="col-md-6 mb-3">
                                            <label for="validationTooltip01">First name</label>
                                            <input type="text" className="form-control" id="validationTooltip01" value="Mark" required />
                                            <div className="valid-tooltip">Looks good!</div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label for="validationTooltip02">Last name</label>
                                            <input type="text" className="form-control" id="validationTooltip02" value="Otto" required />
                                            <div className="valid-tooltip">Looks good!</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="col-md-6 mb-3">
                                            <label for="validationTooltip03">Email</label>
                                            <input type="text" className="form-control" id="validationTooltip03" required />
                                            <div className="invalid-tooltip">Please provide a valid Email. </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label for="validationTooltip05">Role</label>
                                            <select className="form-control" id="exampleFormControlSelect1">
                                                <option>National Manager</option>
                                                <option>Implamenting Partner</option>
                                                <option>County Medical Laboratory coordinators</option>
                                                <option>Sub-County Medical Laboratory coordinators</option>
                                            </select>
                                        </div>
                                    </div>
                                    

                                    <div className="form-row">
                                        <div className="col-md-12 mb-12">
                                            <label for="validationTooltip03">Organisation Units</label>
                                            <TreeDrop/>
                                            <div className="invalid-tooltip">Please provide a valid Email. </div>
                                        </div>
                                    </div>
                                    
                                    <button className="btn btn-primary" type="submit">Submit form</button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
                
                {/* End Registration Form */}

            </React.Fragment >
        );
    }

}

export default User;

if (document.getElementById('users')) {
    ReactDOM.render(<User />, document.getElementById('users'));
}
import React from 'react';
import ReactDOM from 'react-dom';


import DropdownTreeSelect from 'react-dropdown-tree-select';
import TreeDrop from './TreeDrop';

class Orgunit extends React.Component {


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

        if (this.state.showUserTable) {
            pageContent = <div id='user_table' className='row'>
                <div className='col-sm-12 col-md-12'>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Editor</th>
                                <th scope="col">Last Updated</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">1</th>
                                <td>Mark Odour</td>
                                <td>Implementing Partner</td>
                                <td>20-04-2021</td>
                                
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
                                <td>CMLC</td>
                                <td>20-04-2021</td>
                                
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
                                <td>National Manager</td>
                                <td>Larry Mko</td>
                                <td>20-04-2021</td>
                                
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
                                <td>SUB CMLC</td>
                                <td>Larry Mko</td>
                                <td>20-04-2021</td>
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
            pageContent = <div id="registration_form" className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Role Creation</h6>
                </div>
                <div className="card-body">

                    <div className="card mb-4 py-3 border-left-secondary">
                        <div className="card-body">
                            <form className="needs-validation" novalidate>
                                <div className="form-row">
                                    <div className="col-md-12 mb-3">
                                        <label for="validationTooltip01">First name</label>
                                        <input type="text" className="form-control" id="validationTooltip01" value="Mark" required />
                                        <div className="valid-tooltip">Looks good!</div>
                                    </div>
                                </div>
                               
                                <button className="btn btn-primary" type="submit">Save Role</button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>;
        }

        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Roles Management</h1>
                    <a href="#" onClick={this.toggleDisplay} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-users fa-sm text-white-50"></i> Create Roles</a>
                </div>
                {pageContent}
            </React.Fragment>
        );
    }

}

export default Orgunit;

if (document.getElementById('roles')) {
    ReactDOM.render(<Orgunit />, document.getElementById('roles'));
}
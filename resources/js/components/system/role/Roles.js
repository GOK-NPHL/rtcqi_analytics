import React from 'react';
import ReactDOM from 'react-dom';
import { FetchRoles } from '../../utils/Helpers';


import DropdownTreeSelect from 'react-dropdown-tree-select';
import TreeDrop from '../TreeDrop';
import RoleCreate from './role-create';

class Roles extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            showUserTable: true,
            roles: []
        }
        this.onChange = this.onChange.bind(this);
        this.toggleDisplay = this.toggleDisplay.bind(this);
    }

    componentDidMount() {
        //fetch roles
        (async () => {
            let returnedData = await FetchRoles();
            this.setState({
                roles: returnedData,
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

        // this.assignObjectPaths(data);

        const regForm = {
            color: "white",
            backgroundColor: "DodgerBlue",
            padding: "10px",
            fontFamily: "Arial"
        };
        let pageContent = '';


        var tableRows = [];
        {
            if (this.state.roles.map.length) {
                tableRows.push(<tr>
                    <td>1</td>
                    <td colspan="4" style={{textAlign: 'center'}}>No Roles Defined</td>
                </tr>);
            } else {
                this.state.roles.map((value, index) => {
                    tableRows.push(<tr>
                        <td>{index}</td>
                        <td>{value.name}</td>
                        <td>{value.name}</td>
                        <td>{value.updated_ata}</td>
                        <td>
                            <a href="#" style={{ 'marginRight': '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                <i className="fas fa-user-edit"></i>
                            </a>
                            <a className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                <i className="fas fa-user-times"></i>
                            </a>
                        </td>
                    </tr>);
                })
            }
        }

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

                            {tableRows}

                            {/* <tr>
                                <th scope="row">1</th>
                                <td>Implementing Partner</td>
                                <td>Mark Odour</td>

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
                                <td>CMLC</td>
                                <td>Jacob juma</td>

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
                            </tr> */}

                        </tbody>
                    </table>
                </div>
            </div>;
        } else {
            pageContent = <RoleCreate />;
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

export default Roles;

if (document.getElementById('roles')) {
    ReactDOM.render(<Roles />, document.getElementById('roles'));
}
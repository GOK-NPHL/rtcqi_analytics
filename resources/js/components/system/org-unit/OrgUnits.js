import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import TreeView from '../../utils/TreeView';
import OrgunitCreate from './CreateOrgunits';
import Pagination from "react-js-pagination";
import DataTable from "react-data-table-component";
import { FetchOrgunits, DevelopOrgStructure, UpdateOrg, DeleteOrg, DeleteAllOrgs, FetchUserAuthorities } from '../../utils/Helpers';


class Orgunit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            httpOrgUnits: null,
            message: '',
            tableOrgs: '',
            showOrgunitLanding: true,
            tableOrgsStruct: '',
            orgToEdit: null,
            newOrgToName: '',
            allowedPermissions: [],
            dropOrgUnitStructure: false,
            startTableData: 0,
            endeTableData: 10,
            activePage: 1
        };
        this.updateOrg = this.updateOrg.bind(this);
        this.editOrg = this.editOrg.bind(this);
        this.deleteOrg = this.deleteOrg.bind(this);
        this.createOrgunitTable = this.createOrgunitTable.bind(this);
        this.setNewOrgToName = this.setNewOrgToName.bind(this);
        this.setShowOrgunitLanding = this.setShowOrgunitLanding.bind(this);
        this.dropCurrentOrgunitStructure = this.dropCurrentOrgunitStructure.bind(this);
    }

    componentDidMount() {
        (async () => {
            let allowedPermissions = await FetchUserAuthorities();
            this.setState({
                allowedPermissions: allowedPermissions
            });
        })();
    }

    updateOrg(org, newOrgToName) {
        (async () => {
            let returnedData = await UpdateOrg(org, newOrgToName);
            $("#org_success").html(returnedData);
            $("#org_success").show();
            $("#org_success").fadeTo(2000, 500).slideUp(500, () => {
                $("#org_success").alert(500);
                this.setState({
                    newOrgToName: null
                });
            });
        })();
    }

    editOrg(org) {
        window.$('#editOrgModal').modal();
        this.setState({
            orgToEdit: org
        });
    }

    deleteOrg(org) {
        (async () => {
            let returnedData = await DeleteOrg(org);
            // $("#org_success").html(returnedData.data.Message);
            let message = returnedData.data.Message;
            this.setState({ message: message });
            $('#returnedMessage').html(message);
            $('#messageModal').modal('toggle');

        })();
    }


    createOrgunitTable(tableData) {
        var tableRows = [];
        if (!tableData) {
            tableRows.push(<tr key={1}>
                <td>1</td>
                <td colSpan="4" style={{ textAlign: 'center' }}>No Org units Defined</td>
            </tr>);
        } else {
            tableData.payload[0].map((value, index) => {
                index = index + 1;
                tableRows.push(<tr key={index}>
                    <td>{index}</td>
                    <td style={{ "width": "10px" }}>{value.odk_unit_name}</td>
                    <td>{value.level}</td>
                    <td>{value.updated_at}</td>
                    <td>

                        {(this.state.allowedPermissions.length > 0) &&
                            this.state.allowedPermissions.includes('edit_orgunit') ?

                            <a onClick={() => this.editOrg(value)}
                                href="#"
                                style={{ "display": "inlineBlock", 'marginRight': '5px' }}
                                className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                <i className="fas fa-user-edit"></i>
                            </a>
                            : undefined}

                        {(this.state.allowedPermissions.length > 0) &&
                            this.state.allowedPermissions.includes('delete_orgunit') ?

                            <a onClick={() => {
                                this.deleteOrg(value);
                                localStorage.removeItem('orgunitList');
                            }}
                                style={{ "display": "inlineBlock" }}
                                className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                <i className="fas fa-user-times"></i>
                            </a>
                            : undefined}

                    </td>
                </tr>);
            });
        }
        return tableRows;
    }

    setNewOrgToName(newOrgToName) {
        this.setState({
            newOrgToName: newOrgToName
        });
    }

    setShowOrgunitLanding(showOrgunitLanding) {
        this.setState({
            showOrgunitLanding: showOrgunitLanding
        });
    }

    dropCurrentOrgunitStructure(action) {
        if (action == null) {
            this.setState({
                message: "By droping current orunits, users will not access reports for any organisation unit",
                dropOrgUnitStructure: true
            });
            $('#messageModal').modal('toggle');
        } else if (action == 'drop') {

            (async () => {
                let returnedData = await DeleteAllOrgs();
                // $("#org_success").html(returnedData.data.Message);
                let message = returnedData.data.Message;

                this.setState({
                    message: message,
                    dropOrgUnitStructure: false,
                    httpOrgUnits: null,
                    tableOrgs: null
                });
                $('#returnedMessage').html(message);
                //$('#messageModal').modal('toggle');

            })();
        }

    }
    
    handlePageChange(pageNumber) {
        console.log(`active page is ${pageNumber}`);
        let pgNumber = pageNumber * 10 + 1;
        this.setState({
            startTableData: pgNumber - 11,
            endeTableData: pgNumber - 1,
            activePage: pageNumber
        });
    }

    render() {

        $("#org_success").hide();

        if (this.state.allowedPermissions.length > 0) {

            if (this.state.allowedPermissions.includes('view_orgunit')) {

                (async () => {

                    if (this.state.httpOrgUnits == null || this.state.httpOrgUnits.payload[0].length == 0) {

                        let httpOrgUnits = await FetchOrgunits();
                        let tableOrgs = DevelopOrgStructure(httpOrgUnits);
                        this.setState({
                            httpOrgUnits: httpOrgUnits,
                            tableOrgs: tableOrgs
                        });
                    }
                })();
            }
        }

        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "5px"
        };

        let pageContent = '';
        let tableEl = this.createOrgunitTable(this.state.httpOrgUnits);
        let createOrgsButton = '';

        if (this.state.allowedPermissions.includes('upload_new_orgunit_structure')) {
            if (this.state.httpOrgUnits == null || this.state.httpOrgUnits.payload[0].length == 0) {
                createOrgsButton = <a href="#" onClick={() => this.setState({ showOrgunitLanding: false })} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-sitemap fa-sm text-white-50"></i> Create Organisation Unit</a>;
            } else {
                createOrgsButton = <a href="#" onClick={() => this.dropCurrentOrgunitStructure()} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-sitemap fa-sm text-white-50"></i> Drop current orgunit structure</a>;
            }

        }

        if (this.state.showOrgunitLanding) {
            pageContent = <React.Fragment>
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Organisation Unit Management</h1>
                    {createOrgsButton}
                </div>

                <div className="row">
                    <div id="org_success" className="alert alert-success col-sm-12 fade show" role="alert">

                    </div>
                    <div style={{ "overflow": "scroll", "maxHeight": "700px", "minHeight": "500px", "paddingBottom": "6px", "paddingRight": "16px" }} className="col-sm-4">
                        <TreeView orgUnits={this.state.tableOrgs} updateOrg={this.updateOrg} />
                    </div>
                    <div className="col-sm-8">
                        <table
                            className="table table-striped"
                            data-show-refresh={true}
                        >
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Org Unit Name</th>
                                    <th scope="col">Org Level</th>
                                    <th scope="col">Last Updated</th>
                                    {(this.state.allowedPermissions.length > 0) &&
                                        (this.state.allowedPermissions.includes('edit_orgunit') || this.state.allowedPermissions.includes('delete_orgunit')) ?
                                        <th scope="col">Action</th> : undefined}

                                </tr>
                            </thead>
                            <tbody>

                                {tableEl.slice(this.state.startTableData, this.state.endeTableData)}

                            </tbody>
                        </table>
                        <Pagination
                            itemClass="page-item"
                            linkClass="page-link"
                            activePage={this.state.activePage}
                            itemsCountPerPage={10}
                            totalItemsCount={tableEl.length}
                            pageRangeDisplayed={5}
                            onChange={this.handlePageChange.bind(this)}
                        />
                    </div>
                </div>

                <div className="modal fade" id="editOrgModal" tabIndex="-1" role="dialog" aria-labelledby="editOrgModalTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Edit Org Unit</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                <input id="" type="text"
                                    defaultValue={this.state.orgToEdit ? this.state.orgToEdit.odk_unit_name : ''}
                                    onChange={event => {
                                        this.setNewOrgToName(event.target.value);
                                    }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button"
                                    onClick={() => {
                                        this.updateOrg(this.state.orgToEdit.org_unit_id, this.state.newOrgToName);
                                        $('#editOrgModal').modal('toggle');
                                    }}
                                    className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* user persist alert box */}
                <div className="modal fade" id="messageModal" tabIndex="-1" role="dialog" aria-labelledby="messageModalTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Notice!</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p id="returnedMessage">{this.state.message}</p>
                            </div>
                            <div className="modal-footer">
                                {
                                    this.state.dropOrgUnitStructure ?
                                        <>
                                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                            <button type="button" id="confirmDrop" onClick={(event) => {
                                                this.dropCurrentOrgunitStructure('drop');
                                                $("#confirmDrop").prop('disabled', true);
                                            }} className="btn btn-warning">Confirm deletion</button>
                                        </>
                                        :
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                }


                            </div>
                        </div>
                    </div>
                </div>

            </React.Fragment>

        } else {
            pageContent = <OrgunitCreate
                setShowOrgunitLanding={this.setShowOrgunitLanding}
            />;
        }

        return (
            <React.Fragment>
                {pageContent}
            </React.Fragment>
        );
    }
}

export default Orgunit;

if (document.getElementById('orgunits')) {
    ReactDOM.render(<Orgunit />, document.getElementById('orgunits'));
}
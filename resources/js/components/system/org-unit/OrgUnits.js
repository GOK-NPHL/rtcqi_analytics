import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import TreeView from '../../utils/TreeView';
import OrgunitCreate from './CreateOrgunits';
import Pagination from "react-js-pagination";
import DataTable from "react-data-table-component";
import { FetchOrgunits, DevelopOrgStructure, UpdateOrg, DeleteOrg, DeleteAllOrgs, FetchUserAuthorities, RequestNewOrgnit } from '../../utils/Helpers';

import '../../../../css/OrgUnitFloatingButton.css';

class Orgunit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            httpOrgUnits: null,
            allTableElements: [],
            tableEl: [],
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
            activePage: 1,
            isUpdateOrgunits: false,
            currentSelectedOrg: { 'name': null, 'id': null },
            currentSelectedOrgRequest: { 'name': null, 'id': null, 'level': null },
            newOrgunitRequestMessage: null,
            newOrgRequestError: '',
            hasErrors: false
        };
        this.updateOrg = this.updateOrg.bind(this);
        this.editOrg = this.editOrg.bind(this);
        this.deleteOrg = this.deleteOrg.bind(this);
        this.createOrgunitTable = this.createOrgunitTable.bind(this);
        this.setNewOrgToName = this.setNewOrgToName.bind(this);
        this.setShowOrgunitLanding = this.setShowOrgunitLanding.bind(this);
        this.dropCurrentOrgunitStructure = this.dropCurrentOrgunitStructure.bind(this);
        this.triggerOrgUnitsFetch = this.triggerOrgUnitsFetch.bind(this);
        this.deleteSelectedOrgUnit = this.deleteSelectedOrgUnit.bind(this);
        this.setcurrentSelectedOrg = this.setcurrentSelectedOrg.bind(this);
        this.requestNewOrgUnit = this.requestNewOrgUnit.bind(this);
        this.setcurrentSelectedOrgRequest = this.setcurrentSelectedOrgRequest.bind(this);
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

    requestNewOrgUnit(parentOrgId, newOrgToName) {
        (async () => {
            let returnedData = await RequestNewOrgnit(parentOrgId, newOrgToName);
            if (returnedData.status == 500) {
                this.setState({
                    newOrgRequestError: returnedData.data.Message,
                    hasErrors: true
                });
            } else {
                this.setState({
                    newOrgToName: null,
                    newOrgRequestError: returnedData.data.Message,
                    hasErrors: false
                });
            }
        })();
    }

    editOrg(org) {
        window.$('#editOrgModal').modal();
        this.setState({
            orgToEdit: org
        });
    }

    deleteOrg(org) {
        this.setState({
            dropOrgUnit: true,
            message: "Deleting organisation units will detach users from assigned org units, proceed?",
            orgToDelete: org
        });
        $('#messageModal').modal('toggle');
    }

    deleteSelectedOrgUnit() {
        (async () => {
            let returnedData = await DeleteOrg(this.state.orgToDelete);
            localStorage.removeItem('orgunitList');
            localStorage.removeItem("treeStruc");
            localStorage.removeItem("orgunitTableStruc");
            let message = returnedData.data.Message + ". Your brower might freeze as the tree is refreshed";
            this.setState({ message: message, dropOrgUnit: false, httpOrgUnits: null });
            $('#messageModal').modal('show');

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

    triggerOrgUnitsFetch() {
        this.setState({
            httpOrgUnits: null
        })
    }

    handlePageChange(pageNumber) {
        //console.log(`active page is ${pageNumber}`);
        let pgNumber = pageNumber * 10 + 1;
        this.setState({
            startTableData: pgNumber - 11,
            endeTableData: pgNumber - 1,
            activePage: pageNumber
        });
    }

    setcurrentSelectedOrg(currentSelectedOrg) {
        if (currentSelectedOrg == null) {
            currentSelectedOrg = { 'name': 'null', 'id': null }
        }
        this.setState({
            currentSelectedOrg: currentSelectedOrg
        });
    }

    setcurrentSelectedOrgRequest(currentSelectedOrg) {
        console.log(currentSelectedOrg)
        if (currentSelectedOrg == null) {
            currentSelectedOrg = { 'name': null, 'id': null, 'level': null }
        }
        this.setState({
            currentSelectedOrgRequest: currentSelectedOrg
        });
    }



    render() {

        $("#org_success").hide();

        if (this.state.allowedPermissions.length > 0) {

            if (this.state.allowedPermissions.includes('view_orgunit')) {

                (async () => {

                    if (this.state.httpOrgUnits == null || this.state.httpOrgUnits.payload[0].length == 0) {

                        let httpOrgUnits = await FetchOrgunits();
                        if (httpOrgUnits) {
                            let tableOrgs = DevelopOrgStructure(httpOrgUnits);
                            let tableEl = this.createOrgunitTable(httpOrgUnits);
                            this.setState({
                                httpOrgUnits: httpOrgUnits,
                                tableOrgs: tableOrgs,
                                tableEl: tableEl,
                                allTableElements: tableEl,
                                currentSelectedOrg: { 'name': httpOrgUnits.payload[0][0].odk_unit_name, 'id': httpOrgUnits.payload[0][0].org_unit_id },
                                currentSelectedOrgRequest: { 'name': httpOrgUnits.payload[0][0].odk_unit_name, 'id': httpOrgUnits.payload[0][0].org_unit_id, 'level': httpOrgUnits.payload[0][0].level },
                            });
                        }
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


        let createOrgsButton = '';

        if (this.state.allowedPermissions.includes('upload_new_orgunit_structure')) {
            if (this.state.httpOrgUnits == null || this.state.httpOrgUnits.payload[0].length == 0) {
                createOrgsButton = <a href="#" onClick={() => this.setState({ showOrgunitLanding: false })} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-sitemap fa-sm text-white-50"></i> Upload Organisation Unit</a>;
            } else {
                createOrgsButton = <>
                    <div className="d-flex p-3 text-white">
                        <a href="#" onClick={() => this.setState({
                            showOrgunitLanding: false,
                            isUpdateOrgunits: true
                        })} className="d-none d-sm-inline-block btn btn-sm btn-primary mr-4 shadow-sm"><i
                            className="fas fa-sitemap fa-sm text-white-50"></i> Upload County sub-orgunits</a>
                        <a href="#" onClick={() => this.dropCurrentOrgunitStructure()} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                            className="fas fa-sitemap fa-sm text-white-50"></i> Delete all orgunit</a>
                    </div>


                </>;
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
                        <TreeView orgUnits={this.state.tableOrgs}
                            updateOrg={this.updateOrg}
                            setcurrentSelectedOrg={this.setcurrentSelectedOrg}
                        />
                    </div>
                    <div className="col-sm-8">

                        <div className="form-group mb-2">
                            <input type="text"
                                onChange={(event) => {
                                    let tableEl = this.state.allTableElements.filter(orgUnit => orgUnit['props']['children'][1]['props']['children'].toLowerCase().trim().includes(event.target.value.trim().toLowerCase()));
                                    this.setState({
                                        tableEl: tableEl,
                                        activePage: 1,
                                        startTableData: 0,
                                        endeTableData: 10,
                                    })

                                }}
                                className="form-control" placeholder="search orgunit"></input>
                        </div>

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

                                {this.state.tableEl.slice(this.state.startTableData, this.state.endeTableData)}

                            </tbody>
                        </table>
                        <Pagination
                            itemClass="page-item"
                            linkClass="page-link"
                            activePage={this.state.activePage}
                            itemsCountPerPage={10}
                            totalItemsCount={this.state.tableEl.length}
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
                                    this.state.dropOrgUnitStructure || this.state.dropOrgUnit ?
                                        <>
                                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                            <button type="button" id="confirmDrop" onClick={(event) => {
                                                this.state.dropOrgUnit ?
                                                    this.deleteSelectedOrgUnit()
                                                    :
                                                    this.dropCurrentOrgunitStructure('drop')
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

                {/* open request org unit form */}

                {this.state.allowedPermissions.includes('can_request_new_org_unit') ?
                    <a data-toggle="tooltip" data-placement="top" title="Request creation of new org unit" href="#" className="float" onClick={(event) => {
                        event.preventDefault();
                        this.setState({
                            newOrgunitRequestMessage: null,
                            hasErrors: false,
                            newOrgRequestError: '',
                            newOrgToName: ''
                        });
                        $('#newOrgUnitRequestForm').modal('toggle');
                    }}>
                        <i className="fa fa-plus my-float"></i>
                    </a>
                    : ''
                }
                {this.state.allowedPermissions.includes('can_request_new_org_unit') ?

                    // Request new organisation unit form
                    <div className="modal fade" id="newOrgUnitRequestForm" tabIndex="-1" role="dialog" aria-labelledby="newOrgUnitRequestFormTitle" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLongTitle">Add/Delete Orgnanization unit request form</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <div style={{
                                                    "overflow": "scroll", "maxHeight": "400px", "minWidth": "100px",
                                                    "minHeight": "300px", "paddingBottom": "6px",
                                                    "paddingRight": "16px"
                                                }} >
                                                    <h6>Organization units</h6>
                                                    <hr />
                                                    <TreeView orgUnits={this.state.tableOrgs}
                                                        updateOrg={this.updateOrg}
                                                        setcurrentSelectedOrg={this.setcurrentSelectedOrgRequest}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-sm-7">
                                                <h6>Select organization unit of the <strong>left</strong> and choose
                                                    type of action (Add bellow it, Request delete)</h6>
                                                <hr />
                                                <form>
                                                    {this.state.hasErrors ?
                                                        <div className="alert alert-danger" role="alert">
                                                            {this.state.newOrgRequestError}
                                                        </div>
                                                        :
                                                        ''
                                                    }

                                                    {!this.state.hasErrors && this.state.newOrgRequestError ?

                                                        <div className="alert alert-success new_org_request  fade show" role="alert">
                                                            {this.state.newOrgRequestError}
                                                        </div> :
                                                        <React.Fragment>
                                                            <div className="form-group">
                                                                <div className="col-sm-12">
                                                                    You selected:
                                                                    <label htmlFor="parentOrg" >
                                                                        <strong>{this.state.currentSelectedOrgRequest.name}</strong>
                                                                    </label> {this.state.requestFormAction == 'delete' ? 'to get deleted' : 'to have a new organization unit created under it.'}
                                                                </div>
                                                            </div>

                                                            <div className="form-group">
                                                                <div className="col-sm-12">

                                                                    Select action: <select onChange={

                                                                        (event) => {
                                                                            this.setState({
                                                                                requestFormAction: event.target.value
                                                                            }
                                                                            );
                                                                        }
                                                                    } className="form-select" aria-label="Default select example">
                                                                        <option value="add">Request new organization unit</option>
                                                                        <option value="delete">Request delete</option>
                                                                    </select>

                                                                </div>
                                                            </div>

                                                            {
                                                                this.state.requestFormAction != 'delete' ?
                                                                    <div className="form-group">
                                                                        <label htmlFor="newOrgName" className="col-sm-12 col-form-label">New organization unit name</label>
                                                                        <div className="col-sm-12">
                                                                            <input type="text" className="form-control" id="newOrgName" placeholder="new org name" />
                                                                        </div>
                                                                    </div> : ''
                                                            }

                                                            {
                                                                this.state.currentSelectedOrgRequest.level == 3 && this.state.requestFormAction != 'delete'?
                                                                    <div className="form-group">
                                                                        <label htmlFor="mflCode" className="col-sm-12 col-form-label">MFL Code</label>
                                                                        <div className="col-sm-12">
                                                                            <input type="text" className="form-control" id="mflCode" placeholder="mfl code" />
                                                                        </div>
                                                                    </div> : ''
                                                            }

                                                        </React.Fragment>
                                                    }

                                                </form>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button"
                                        onClick={() => {
                                            $('#newOrgUnitRequestForm').modal('toggle');
                                            this.setState({
                                                newOrgunitRequestMessage: null,
                                                hasErrors: false,
                                                newOrgRequestError: '',
                                                newOrgToName: ''
                                            });
                                        }}
                                        className="btn btn-secondary" data-dismiss="modal">Close</button>

                                    {!this.state.hasErrors && this.state.newOrgRequestError ?
                                        '' : <button type="button"
                                            onClick={() => {
                                                this.requestNewOrgUnit(this.state.currentSelectedOrg.id, document.getElementById('newOrgName').value)
                                            }}
                                            className="btn btn-primary">Send Request</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    : ''
                }


            </React.Fragment>

        } else {
            pageContent = <OrgunitCreate triggerOrgUnitsFetch={this.triggerOrgUnitsFetch} isUpdateOrgunits={this.state.isUpdateOrgunits}
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
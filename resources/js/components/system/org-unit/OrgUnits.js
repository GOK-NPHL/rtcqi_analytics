import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import TreeView from '../../utils/TreeView';
import OrgunitCreate from './CreateOrgunits';
import DataTable from "react-data-table-component";
import { FetchOrgunits, DevelopOrgStructure, UpdateOrg, DeleteOrg } from '../../utils/Helpers';

let httpOrgUnits = [];

let tableOrgs;

function updateOrg(org, setOrgToEdit) {
    (async () => {
        let returnedData = await UpdateOrg(org);
        $("#org_success").html(returnedData);
        $("#org_success").show();
        $("#org_success").fadeTo(2000, 500).slideUp(500, function () {
            $("#org_success").alert(500);
            setOrgToEdit();
        });
    })();
}

function editOrg(org, setOrgToEdit) {
    window.$('#editOrgModal').modal();
    setOrgToEdit(org);
}

function deleteOrg(org, setOrgToEdit) {
    (async () => {
        let returnedData = await DeleteOrg(org);
        $("#org_success").html(returnedData);
        $("#org_success").show();
        $("#org_success").fadeTo(2000, 500).slideUp(500, function () {
            $("#org_success").alert(500);
            setOrgToEdit(org);
        });
    })();
}


function createOrgunitTable(tableData, setOrgToEdit) {
    var tableRows = [];
    if (tableData.length == 0) {
        tableRows.push(<tr key={1}>
            <td>1</td>
            <td colSpan="4" style={{ textAlign: 'center' }}>No Roles Defined</td>
        </tr>);
    } else {
        tableData.payload[0].map((value, index) => {
            index = index + 1;
            tableRows.push(<tr key={index}>
                <td>{index}</td>
                <td >{value.odk_unit_name}</td>
                <td>{value.level}</td>
                <td>{value.updated_at}</td>
                <td>

                    <a onClick={() => editOrg(value, setOrgToEdit)}
                        href="#"
                        style={{ "display": "inlineBlock", 'marginRight': '5px' }}
                        className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                        <i className="fas fa-user-edit"></i>
                    </a>
                    <a onClick={() => deleteOrg(value, setOrgToEdit)} style={{ "display": "inlineBlock" }}
                        className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                        <i className="fas fa-user-times"></i>
                    </a>
                </td>
            </tr>);
        });
    }
    return tableRows;
}


function Orgunit() {
    $("#org_success").hide();
    const [showOrgunitLanding, setShowOrgunitLanding] = useState(true);
    const [tableOrgsStruct, setTableOrgsStruct] = useState();
    const [orgToEdit, setOrgToEdit] = useState();

    (async () => {
        if (httpOrgUnits.length == 0) {
            httpOrgUnits = await FetchOrgunits();
            tableOrgs=DevelopOrgStructure(httpOrgUnits,tableOrgs);
            setTableOrgsStruct(httpOrgUnits); ///save to state
        }
    })();
    const imgStyle = {
        width: "100%"
    };

    const rowStle = {
        marginBottom: "5px"
    };

    let pageContent = '';
    let tableEl = createOrgunitTable(httpOrgUnits, setOrgToEdit);


    if (showOrgunitLanding) {
        pageContent = <React.Fragment>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h4 mb-0 text-gray-500">Organisation Unit Management</h1>
                <a href="#" onClick={() => setShowOrgunitLanding(false)} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-sitemap fa-sm text-white-50"></i> Create Organisation Unit</a>
            </div>

            <div className="row">
                <div id="org_success" className="alert alert-success col-sm-12 fade show" role="alert">

                </div>
                <div style={{ "overflow": "scroll", "maxHeight": "700px", "minHeight": "500px", "paddingBottom": "6px", "paddingRight": "16px" }} className="col-sm-3">
                    <TreeView orgUnits={tableOrgs} />
                </div>
                <div className="col-sm-9">
                    <table className="table table-striped" >
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Org Unit Name</th>
                                <th scope="col">Org Level</th>
                                <th scope="col">Last Updated</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>

                            {tableEl}

                        </tbody>
                    </table>
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
                                defaultValue={orgToEdit ? orgToEdit.odk_unit_name : ''}
                                onChange={event => {
                                    orgToEdit.odk_unit_name = event.target.value;
                                }}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button"
                                onClick={() => {
                                    updateOrg(orgToEdit, setOrgToEdit);
                                    $('#editOrgModal').modal('toggle');
                                }}
                                className="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>

        </React.Fragment>

    } else {
        pageContent = <OrgunitCreate
            setShowOrgunitLanding={setShowOrgunitLanding}
        />;
    }

    return <React.Fragment>
        {pageContent}
    </React.Fragment>
}

export default Orgunit;

if (document.getElementById('orgunits')) {
    ReactDOM.render(<Orgunit />, document.getElementById('orgunits'));
}
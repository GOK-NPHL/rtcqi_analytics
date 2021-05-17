import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import TreeView from '../../utils/TreeView';
import OrgunitCreate from './CreateOrgunits';
import DataTable from "react-data-table-component";
import { FetchOrgunits, OrgUnitStructureMaker, UpdateOrg } from '../../utils/Helpers';

let httpOrgUnits = [];

let tableOrgs = [
    {
        id: 0,
        name: "Kenya",
        level: 1,
        parentId: 0,
        children: [

        ]
    }
];

function developOrgStructure(orunitData) {

    orunitData.metadata.levels.map(hierchayLevel => {
        // console.log(orunitData.payload);
        let kenya = orunitData.payload[0].filter(orgUnit => orgUnit.name == 'Kenya');
        tableOrgs[0]['id'] = kenya.org_unit_id;
        let orgUnits = orunitData.payload[0].filter(orgUnit => orgUnit.level == hierchayLevel); //access sorted values by level asc
        orgUnits.map((orgUnitToAdd) => {
            if (orgUnitToAdd.level == 2) {
                let orgUnit = {
                    id: orgUnitToAdd.org_unit_id,
                    name: orgUnitToAdd.odk_unit_name,
                    level: orgUnitToAdd.level,
                    parentId: orgUnitToAdd.parent_id,
                    updatedAt: orgUnitToAdd.updated_at,
                    children: [
                    ]
                };
                tableOrgs[0].children.push(orgUnit);
            } else {
                OrgUnitStructureMaker(tableOrgs, orgUnitToAdd);
            }

        });

    });
}

function updateOrg(org) {
    (async () => {
        let returnedData = await UpdateOrg(org);
        console.log(returnedData);
    })();
}

function editOrg(org, setOrgToEdit) {
    window.$('#editOrgModal').modal();
    setOrgToEdit(org);
}

function deleteOrg(orgId) {
    console.log(orgId);
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
                    <a onClick={() => deleteOrg(value.org_unit_id)} style={{ "display": "inlineBlock" }}
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

    const [showOrgunitLanding, setShowOrgunitLanding] = useState(true);
    const [tableOrgsStruct, setTableOrgsStruct] = useState();
    const [orgToEdit, setOrgToEdit] = useState();
    (async () => {
        if (httpOrgUnits.length == 0) {
            httpOrgUnits = await FetchOrgunits();
            developOrgStructure(httpOrgUnits);
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
                            <h5 className="modal-title" id="exampleModalLongTitle">Modal title</h5>
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
                                    updateOrg(orgToEdit);
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
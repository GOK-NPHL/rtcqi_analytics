import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import TreeView from '../../utils/TreeView';
import OrgunitCreate from './CreateOrgunits';
import Pagination from 'react-js-pagination';
import { FetchOrgunits, DevelopOrgStructure, UpdateOrg, DeleteOrg, DeleteAllOrgs, FetchUserAuthorities, RequestNewOrgnit } from '../../utils/Helpers';
import '../../../../css/OrgUnitFloatingButton.css';

function Orgunit() {
    const [httpOrgUnits, setHttpOrgUnits] = useState(null);
    const [tableOrgs, setTableOrgs] = useState('');
    const [allTableElements, setAllTableElements] = useState([]);
    const [tableEl, setTableEl] = useState([]);
    const [message, setMessage] = useState('');
    const [showOrgunitLanding, setShowOrgunitLanding] = useState(true);
    const [orgToEdit, setOrgToEdit] = useState(null);
    const [newOrgToName, setNewOrgToName] = useState('');
    const [allowedPermissions, setAllowedPermissions] = useState([]);
    const [dropOrgUnitStructure, setDropOrgUnitStructure] = useState(false);
    const [dropOrgUnit, setDropOrgUnit] = useState(false);
    const [orgToDelete, setOrgToDelete] = useState(null);
    const [startTableData, setStartTableData] = useState(0);
    const [endeTableData, setEndeTableData] = useState(10);
    const [activePage, setActivePage] = useState(1);
    const [isUpdateOrgunits, setIsUpdateOrgunits] = useState(false);
    const [currentSelectedOrg, setCurrentSelectedOrg] = useState({ name: null, id: null });
    const [currentSelectedOrgRequest, setCurrentSelectedOrgRequest] = useState({ name: null, id: null, level: null });
    const [newOrgRequestError, setNewOrgRequestError] = useState('');
    const [hasErrors, setHasErrors] = useState(false);
    const [requestFormAction, setRequestFormAction] = useState('add');

    useEffect(() => {
        (async () => {
            const perms = await FetchUserAuthorities();
            setAllowedPermissions(perms);
        })();
    }, []);

    useEffect(() => {
        if (allowedPermissions.includes('view_orgunit') && !httpOrgUnits) {
            (async () => {
                const data = await FetchOrgunits();
                if (data) {
                    const treeOrgs = DevelopOrgStructure(data);
                    const rows = createOrgunitTable(data, allowedPermissions);
                    setHttpOrgUnits(data);
                    setTableOrgs(treeOrgs);
                    setTableEl(rows);
                    setAllTableElements(rows);
                    setCurrentSelectedOrg({ name: data.payload[0][0].odk_unit_name, id: data.payload[0][0].org_unit_id });
                    setCurrentSelectedOrgRequest({ name: data.payload[0][0].odk_unit_name, id: data.payload[0][0].org_unit_id, level: data.payload[0][0].level });
                }
            })();
        }
    }, [allowedPermissions, httpOrgUnits]);

    const createOrgunitTable = (tableData, perms) => {
        if (!tableData) {
            return [<tr key={1}><td>1</td><td colSpan="4" style={{ textAlign: 'center' }}>No Org units Defined</td></tr>];
        }
        return tableData.payload[0].map((value, index) => (
            <tr key={index + 1}>
                <td>{index + 1}</td>
                <td style={{ width: '10px' }}>{value.odk_unit_name}</td>
                <td>{value.level}</td>
                <td>{value.updated_at}</td>
                <td>
                    {perms.includes('edit_orgunit') && (
                        <a onClick={() => { window.$('#editOrgModal').modal(); setOrgToEdit(value); }} href="#" style={{ display: 'inlineBlock', marginRight: '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                            <i className="fas fa-user-edit"></i>
                        </a>
                    )}
                    {perms.includes('delete_orgunit') && (
                        <a onClick={() => { setDropOrgUnit(true); setMessage('Deleting organisation units will detach users from assigned org units, proceed?'); setOrgToDelete(value); $('#messageModal').modal('toggle'); }} style={{ display: 'inlineBlock' }} className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                            <i className="fas fa-user-times"></i>
                        </a>
                    )}
                </td>
            </tr>
        ));
    };

    const updateOrg = async (org, newName) => {
        const returnedData = await UpdateOrg(org, newName);
        $('#org_success').html(returnedData).show().fadeTo(2000, 500).slideUp(500, () => {
            $('#org_success').alert(500);
            setNewOrgToName(null);
        });
    };

    const deleteSelectedOrgUnit = async () => {
        const returnedData = await DeleteOrg(orgToDelete);
        ['orgunitList', 'treeStruc', 'orgunitTableStruc'].forEach(k => localStorage.removeItem(k));
        setMessage(returnedData.data.Message + '. Your browser might freeze as the tree is refreshed');
        setDropOrgUnit(false);
        setHttpOrgUnits(null);
        $('#messageModal').modal('show');
    };

    const dropCurrentOrgunitStructure = async (action) => {
        if (action == null) {
            setMessage('By dropping current orgunits, users will not access reports for any organisation unit');
            setDropOrgUnitStructure(true);
            $('#messageModal').modal('toggle');
        } else if (action === 'drop') {
            const returnedData = await DeleteAllOrgs();
            setMessage(returnedData.data.Message);
            setDropOrgUnitStructure(false);
            setHttpOrgUnits(null);
            setTableOrgs(null);
            $('#returnedMessage').html(returnedData.data.Message);
        }
    };

    const requestNewOrgUnit = async (parentOrgId, newName) => {
        const returnedData = await RequestNewOrgnit(parentOrgId, newName);
        if (returnedData.status === 500) {
            setNewOrgRequestError(returnedData.data.Message);
            setHasErrors(true);
        } else {
            setNewOrgToName(null);
            setNewOrgRequestError(returnedData.data.Message);
            setHasErrors(false);
        }
    };

    const handlePageChange = (pageNumber) => {
        const pgNumber = pageNumber * 10 + 1;
        setStartTableData(pgNumber - 11);
        setEndeTableData(pgNumber - 1);
        setActivePage(pageNumber);
    };

    $('#org_success').hide();

    const canUpload = allowedPermissions.includes('upload_new_orgunit_structure');
    const canRequest = allowedPermissions.includes('can_request_new_org_unit');
    const canEdit = allowedPermissions.includes('edit_orgunit');
    const canDelete = allowedPermissions.includes('delete_orgunit');

    let createOrgsButton = null;
    if (canUpload) {
        createOrgsButton = (!httpOrgUnits || httpOrgUnits.payload[0].length === 0) ? (
            <a href="#" onClick={() => setShowOrgunitLanding(false)} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-sitemap fa-sm text-white-50"></i> Upload Organisation Unit
            </a>
        ) : (
            <div className="d-flex p-3 text-white">
                <a href="#" onClick={() => { setShowOrgunitLanding(false); setIsUpdateOrgunits(true); }} className="d-none d-sm-inline-block btn btn-sm btn-primary mr-4 shadow-sm">
                    <i className="fas fa-sitemap fa-sm text-white-50"></i> Upload County sub-orgunits
                </a>
                <a href="#" onClick={() => dropCurrentOrgunitStructure(null)} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                    <i className="fas fa-sitemap fa-sm text-white-50"></i> Delete all orgunit
                </a>
            </div>
        );
    }

    if (!showOrgunitLanding) {
        return (
            <React.Fragment>
                <OrgunitCreate triggerOrgUnitsFetch={() => setHttpOrgUnits(null)} isUpdateOrgunits={isUpdateOrgunits} setShowOrgunitLanding={setShowOrgunitLanding} />
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h4 mb-0 text-gray-500">Organisation Unit Management</h1>
                {createOrgsButton}
            </div>

            <div className="row">
                <div id="org_success" className="alert alert-success col-sm-12 fade show" role="alert"></div>
                <div style={{ overflow: 'scroll', maxHeight: '700px', minHeight: '500px', paddingBottom: '6px', paddingRight: '16px' }} className="col-sm-4">
                    <TreeView orgUnits={tableOrgs} updateOrg={updateOrg} setcurrentSelectedOrg={(org) => setCurrentSelectedOrg(org ?? { name: 'null', id: null })} />
                </div>
                <div className="col-sm-8">
                    <div className="form-group mb-2">
                        <input
                            type="text"
                            onChange={(e) => {
                                const filtered = allTableElements.filter(ou => ou?.props?.children?.[1]?.props?.children?.toLowerCase().trim().includes(e.target.value.trim().toLowerCase()));
                                setTableEl(filtered);
                                setActivePage(1);
                                setStartTableData(0);
                                setEndeTableData(10);
                            }}
                            className="form-control" placeholder="search orgunit"
                        />
                    </div>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Org Unit Name</th>
                                <th scope="col">Org Level</th>
                                <th scope="col">Last Updated</th>
                                {(canEdit || canDelete) && <th scope="col">Action</th>}
                            </tr>
                        </thead>
                        <tbody>{tableEl.slice(startTableData, endeTableData)}</tbody>
                    </table>
                    <Pagination itemClass="page-item" linkClass="page-link" activePage={activePage} itemsCountPerPage={10} totalItemsCount={tableEl.length} pageRangeDisplayed={5} onChange={handlePageChange} />
                </div>
            </div>

            {/* Edit modal */}
            <div className="modal fade" id="editOrgModal" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Org Unit</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <input type="text" defaultValue={orgToEdit?.odk_unit_name ?? ''} onChange={e => setNewOrgToName(e.target.value)} />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" onClick={() => { updateOrg(orgToEdit.org_unit_id, newOrgToName); $('#editOrgModal').modal('toggle'); }} className="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm/message modal */}
            <div className="modal fade" id="messageModal" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Notice!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body"><p id="returnedMessage">{message}</p></div>
                        <div className="modal-footer">
                            {(dropOrgUnitStructure || dropOrgUnit) ? (
                                <>
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                    <button type="button" id="confirmDrop" onClick={() => { dropOrgUnit ? deleteSelectedOrgUnit() : dropCurrentOrgunitStructure('drop'); document.getElementById('confirmDrop').disabled = true; }} className="btn btn-warning">Confirm deletion</button>
                                </>
                            ) : (
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Request new org unit */}
            {canRequest && (
                <>
                    <a data-toggle="tooltip" title="Request creation of new org unit" href="#" className="float"
                        onClick={(e) => { e.preventDefault(); setHasErrors(false); setNewOrgRequestError(''); setNewOrgToName(''); $('#newOrgUnitRequestForm').modal('toggle'); }}>
                        <i className="fa fa-plus my-float"></i>
                    </a>
                    <div className="modal fade" id="newOrgUnitRequestForm" tabIndex="-1" role="dialog" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add/Delete Organisation unit request form</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                </div>
                                <div className="modal-body">
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <div style={{ overflow: 'scroll', maxHeight: '400px', minWidth: '100px', minHeight: '300px', paddingBottom: '6px', paddingRight: '16px' }}>
                                                    <h6>Organization units</h6><hr />
                                                    <TreeView orgUnits={tableOrgs} updateOrg={updateOrg} setcurrentSelectedOrg={(org) => setCurrentSelectedOrgRequest(org ?? { name: null, id: null, level: null })} />
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <h6>Select organization unit on the <strong>left</strong> and choose action</h6><hr />
                                                <form>
                                                    {hasErrors && <div className="alert alert-danger">{newOrgRequestError}</div>}
                                                    {!hasErrors && newOrgRequestError
                                                        ? <div className="alert alert-success">{newOrgRequestError}</div>
                                                        : (
                                                            <>
                                                                <div className="form-group">
                                                                    <div className="col-sm-12">
                                                                        You selected: <label><strong>{currentSelectedOrgRequest.name}</strong></label>{' '}
                                                                        {requestFormAction === 'delete' ? 'to get deleted' : 'to have a new organization unit created under it.'}
                                                                    </div>
                                                                </div>
                                                                <div className="form-group">
                                                                    <div className="col-sm-12">
                                                                        Select action: <select onChange={(e) => setRequestFormAction(e.target.value)} className="form-select">
                                                                            <option value="add">Request new organization unit</option>
                                                                            <option value="delete">Request delete</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                {requestFormAction !== 'delete' && (
                                                                    <div className="form-group">
                                                                        <label htmlFor="newOrgName" className="col-sm-12 col-form-label">New organization unit name</label>
                                                                        <div className="col-sm-12"><input type="text" className="form-control" id="newOrgName" placeholder="new org name" /></div>
                                                                    </div>
                                                                )}
                                                                {currentSelectedOrgRequest.level === 3 && requestFormAction !== 'delete' && (
                                                                    <div className="form-group">
                                                                        <label htmlFor="mflCode" className="col-sm-12 col-form-label">MFL Code</label>
                                                                        <div className="col-sm-12"><input type="text" className="form-control" id="mflCode" placeholder="mfl code" /></div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )
                                                    }
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => { $('#newOrgUnitRequestForm').modal('toggle'); setHasErrors(false); setNewOrgRequestError(''); setNewOrgToName(''); }} className="btn btn-secondary" data-dismiss="modal">Close</button>
                                    {!(!hasErrors && newOrgRequestError) && (
                                        <button type="button" onClick={() => requestNewOrgUnit(currentSelectedOrg.id, document.getElementById('newOrgName').value)} className="btn btn-primary">Send Request</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </React.Fragment>
    );
}

export default Orgunit;

const el = document.getElementById('orgunits');
if (el) ReactDOM.createRoot(el).render(<Orgunit />);

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { FetchRoles, DeleteRole, FetchUserAuthorities } from '../../utils/Helpers';
import RoleCreate from './CreateRoles';

function Roles() {
    const [showUserTable, setShowUserTable] = useState(true);
    const [roles, setRoles] = useState([]);
    const [allowedPermissions, setAllowedPermissions] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');
    const [roleToEdit, setRoleToEdit] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const fetchRoles = async () => {
        const returnedData = await FetchRoles();
        setRoles(returnedData);
    };

    useEffect(() => {
        (async () => {
            const perms = await FetchUserAuthorities();
            setAllowedPermissions(perms);
            if (perms.length > 0 && perms.includes('view_role')) {
                fetchRoles();
            }
        })();
    }, []);

    const deleteRole = async (role_id) => {
        if (allowedPermissions.includes('delete_role')) {
            const returnedData = await DeleteRole(role_id);
            if (returnedData) {
                setResponseMessage(returnedData.data.Message);
                $('#deleteRoleModal').modal('toggle');
                fetchRoles();
            }
        }
    };

    const editRole = (role) => {
        setRoleToEdit(role);
        setEditMode(true);
        setShowUserTable(false);
    };

    const toggleDisplay = () => setShowUserTable(prev => !prev);

    const canView = allowedPermissions.includes('view_role');
    const canEdit = allowedPermissions.includes('edit_role');
    const canDelete = allowedPermissions.includes('delete_role');
    const canAdd = allowedPermissions.includes('add_role');

    let tableRows = [];
    if (Object.keys(roles).length === 0 && roles.constructor === Object) {
        tableRows.push(
            <tr key="empty">
                <td>1</td>
                <td colSpan="4" style={{ textAlign: 'center' }}>No Roles Defined</td>
            </tr>
        );
    } else {
        let index = 0;
        for (const [, value] of Object.entries(roles)) {
            index++;
            tableRows.push(
                <tr key={index}>
                    <td>{index}</td>
                    <td>{value.role_name}</td>
                    <td>{value.editor}</td>
                    <td>{value.updated_at}</td>
                    {(canEdit || canDelete) && (
                        <td>
                            {canEdit && (
                                <a onClick={() => editRole(value)} href="#" style={{ marginRight: '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                    <i className="fas fa-user-edit"></i>
                                </a>
                            )}
                            {canDelete && (
                                <a onClick={() => deleteRole(value.role_id)} className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                    <i className="fas fa-user-times"></i>
                                </a>
                            )}
                        </td>
                    )}
                </tr>
            );
        }
    }

    let pageContent = null;
    if (showUserTable) {
        if (canView) {
            pageContent = (
                <div id="user_table" className="row">
                    <div className="col-sm-12 col-md-12">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Editor</th>
                                    <th scope="col">Last Updated</th>
                                    {(canEdit || canDelete) && <th scope="col">Action</th>}
                                </tr>
                            </thead>
                            <tbody>{tableRows}</tbody>
                        </table>
                    </div>
                </div>
            );
        }
    } else {
        if ((editMode && canEdit) || (!editMode && canAdd)) {
            pageContent = (
                <RoleCreate
                    fetchRoles={fetchRoles}
                    toggleDisplay={toggleDisplay}
                    editMode={editMode}
                    roleToEdit={roleToEdit}
                    updateEditMode={setEditMode}
                />
            );
        }
    }

    let roleCreateButton = null;
    if (canAdd) {
        roleCreateButton = showUserTable ? (
            <a href="#" onClick={toggleDisplay} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-users fa-sm text-white-50"></i> Create Roles
            </a>
        ) : (
            <a href="#" onClick={toggleDisplay} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-arrow-left"></i> Back
            </a>
        );
    }

    return (
        <React.Fragment>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h4 mb-0 text-gray-500">Roles Management</h1>
                {roleCreateButton}
            </div>
            {pageContent}
            <div className="modal fade" id="deleteRoleModal" tabIndex="-1" role="dialog" aria-labelledby="deleteRoleModalTitle" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Notice!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">{responseMessage}</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Roles;

const el = document.getElementById('roles');
if (el) ReactDOM.createRoot(el).render(<Roles />);

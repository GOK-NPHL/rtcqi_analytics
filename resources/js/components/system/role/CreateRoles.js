import React, { useState, useEffect } from 'react';
import { FetchAuthorities, SaveRole, UpdateRole, FetchUserAuthorities } from '../../utils/Helpers';
import DualListBox from 'react-dual-listbox';

function RoleCreate({ editMode, roleToEdit, toggleDisplay, fetchRoles, updateEditMode }) {
    const [selected, setSelected] = useState([]);
    const [roleName, setRoleName] = useState('');
    const [permissionOptions, setPermissionOptions] = useState([]);
    const [allowedPermissions, setAllowedPermissions] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');

    useEffect(() => {
        (async () => {
            const returnedData = await FetchAuthorities();
            const perms = await FetchUserAuthorities();

            const categories = [];
            const options = [];
            returnedData.forEach((obj) => {
                if (categories.includes(obj.group)) {
                    options.forEach((s) => {
                        if (s.label === obj.group) s.options.push({ value: obj.id, label: obj.name });
                    });
                } else {
                    options.push({ label: obj.group, options: [{ value: obj.id, label: obj.name }] });
                    categories.push(obj.group);
                }
            });

            setPermissionOptions(options);
            setAllowedPermissions(perms);
        })();

        if (editMode && roleToEdit) {
            setRoleName(roleToEdit.role_name);
            const sel = [];
            for (const value of Object.values(roleToEdit.authorities)) {
                sel.push(...value);
            }
            setSelected(sel);
        }
    }, []);

    const saveRole = async () => {
        if (editMode) {
            if (!allowedPermissions.includes('edit_role')) return;
            const returnedData = await UpdateRole(roleToEdit.role_id, roleName, selected);
            if (returnedData) {
                setResponseMessage(returnedData.data.Message);
                $('#saveRoleModal').modal('toggle');
                toggleDisplay();
                fetchRoles();
            }
        } else {
            if (!allowedPermissions.includes('add_role')) return;
            const returnedData = await SaveRole(roleName, selected);
            if (returnedData) {
                setResponseMessage(returnedData.data.Message);
                $('#saveRoleModal').modal('toggle');
                toggleDisplay();
                fetchRoles();
            }
        }
    };

    const canSave = allowedPermissions.length > 0 &&
        ((editMode && allowedPermissions.includes('edit_role')) ||
         (!editMode && allowedPermissions.includes('add_role')));

    if (!canSave) return null;

    return (
        <React.Fragment>
            <div id="registration_form" className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Role Creation</h6>
                </div>
                <div className="card-body">
                    <div className="card mb-4 py-3 border-left-secondary">
                        <div className="card-body">
                            <div className="form-row">
                                <div className="col-md-12 mb-3">
                                    <label htmlFor="role_name">Role name</label>
                                    <input
                                        type="text"
                                        onChange={e => setRoleName(e.target.value)}
                                        value={roleName}
                                        className="form-control"
                                        id="role_name"
                                        required
                                    />
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label htmlFor="permissions">Assign permissions</label>
                                    <DualListBox
                                        canFilter
                                        options={permissionOptions}
                                        selected={selected}
                                        onChange={setSelected}
                                    />
                                </div>
                            </div>
                            <button onClick={saveRole} className="btn btn-primary mr-2">Save Role</button>
                            <button onClick={() => {
                                setSelected([]);
                                setRoleName('');
                                setPermissionOptions([]);
                                setAllowedPermissions([]);
                                toggleDisplay();
                            }} className="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="saveRoleModal" tabIndex="-1" role="dialog" aria-labelledby="saveRoleModalTitle" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="saveRoleModalTitle">Notice!</h5>
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

export default RoleCreate;

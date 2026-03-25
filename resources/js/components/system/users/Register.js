import React, { useState, useEffect } from 'react';
import { FetchRoles, Saveuser, DevelopOrgStructure, FetchOrgunits, FetchUserDetails, Updateuser } from '../../utils/Helpers';
import TreeView from '../../utils/TreeView';
import DualListBox from 'react-dual-listbox';

function Register({ userActionState, selectedUser, allowedPermissions, toggleDisplay }) {
    const [selectedViewableRoles, setSelectedViewableRoles] = useState([]);
    const [previousSelectedViewableRoles, setPreviousSelectedViewableRoles] = useState([]);
    const [role, setRole] = useState('');
    const [roleId, setRoleId] = useState('');
    const [roles, setRoles] = useState({});
    const [selectedOrgs, setSelectedOrgs] = useState({});
    const [rolesOptions, setRolesOptions] = useState([]);
    const [message, setMessage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [assignedOrgUnits, setAssignedOrgUnits] = useState([]);
    const [orgUnits, setOrgUnits] = useState(null);
    const [closeRegisterPage, setCloseRegisterPage] = useState(true);
    const [canViewAssignRolesList, setCanViewAssignRolesList] = useState(false);

    useEffect(() => {
        (async () => {
            const fetchedRoles = await FetchRoles();
            let httpOrgUnits = await FetchOrgunits();
            const assigned = [];

            if (userActionState === 'edit' && selectedUser) {
                const userDetails = await FetchUserDetails(selectedUser.id);
                const userAssignedOrgs = {};
                userDetails['org_units'].forEach(ou => {
                    userAssignedOrgs[ou.org_unit_id] = ou;
                    assigned.push(ou.org_unit_id);
                });

                let canView = false;
                try { canView = fetchedRoles[userDetails['demographics']['role_id']]['authorities']['role'].includes(12); } catch {}

                setFirstName(userDetails['demographics']['first_name']);
                setLastName(userDetails['demographics']['last_name'] ?? '');
                setEmail(userDetails['demographics']['email']);
                setRole(userDetails['demographics']['role_id']);
                setRoleId(userDetails['demographics']['role_id']);
                setSelectedViewableRoles(userDetails['allowed_roles']);
                setPreviousSelectedViewableRoles(userDetails['allowed_roles']);
                setSelectedOrgs(userAssignedOrgs);
                setCanViewAssignRolesList(canView);
            }

            setOrgUnits(DevelopOrgStructure(httpOrgUnits));
            setRoles(fetchedRoles);
            setAssignedOrgUnits(assigned);
            setRolesOptions(Object.values(fetchedRoles).map(v => ({ value: v.role_id, label: v.role_name })));
        })();
    }, []);

    const roleOnChange = (event) => {
        const rid = event.target.value;
        let canView = false;
        try { if (roles[rid].authorities.role.includes(12)) canView = true; } catch {}
        setRole(rid);
        setCanViewAssignRolesList(canView);
        setSelectedViewableRoles(canView ? previousSelectedViewableRoles : []);
    };

    const selectOrgUnitHandler = (orgunit) => {
        setSelectedOrgs(prev => {
            const updated = { ...prev };
            if (orgunit.id in updated) delete updated[orgunit.id];
            else updated[orgunit.id] = orgunit;
            return updated;
        });
    };

    const saveUser = async () => {
        if (!firstName || !email || !password || !role || Object.keys(selectedOrgs).length === 0) {
            setMessage('Kindly fill in the required data marked in *');
            setCloseRegisterPage(false);
            $('#saveUserModal').modal('toggle');
            return;
        }
        const response = await Saveuser(firstName, lastName, email, password, selectedOrgs, role, selectedViewableRoles);
        if (response) {
            setMessage(response.data.Message);
            $('#saveUserModal').modal('toggle');
        }
    };

    const updateCurrentUser = async () => {
        if (!firstName || !email || Object.keys(selectedOrgs).length === 0) {
            setMessage('Kindly fill in the required data marked in *');
            setCloseRegisterPage(false);
            $('#saveUserModal').modal('toggle');
            return;
        }
        const response = await Updateuser(firstName, lastName, email, password, selectedOrgs, role, selectedUser.id, selectedViewableRoles);
        setMessage(response.data.Message);
        $('#saveUserModal').modal('toggle');
    };

    const roleOptions = Object.entries(roles).map(([key, value]) => (
        <option key={key} value={key} selected={userActionState === 'edit' && roleId == value.role_id}>{value.role_name}</option>
    ));

    const selectedOrgsList = Object.entries(selectedOrgs).map(([key, value], i) => (
        <p key={key} data-id={key}>{i + 1}. {value.name}</p>
    ));

    const resetAndClose = () => {
        setSelectedViewableRoles([]); setPreviousSelectedViewableRoles([]); setRole(''); setRoles({});
        setSelectedOrgs({}); setRolesOptions([]); setMessage(''); setFirstName(''); setLastName('');
        setEmail(''); setPassword(''); setAssignedOrgUnits([]); setCloseRegisterPage(true); setCanViewAssignRolesList(false);
        toggleDisplay();
    };

    return (
        <React.Fragment>
            <div id="registration_form" className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Registration Form</h6>
                </div>
                <div className="card-body">
                    <div className="card mb-4 py-3 border-left-secondary">
                        <div className="card-body">
                            <div className="form-row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="validationTooltip01">First name *</label>
                                    <input type="text" onChange={e => setFirstName(e.target.value)} value={firstName} className="form-control" id="validationTooltip01" required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="validationTooltip02">Last name</label>
                                    <input type="text" onChange={e => setLastName(e.target.value)} value={lastName} className="form-control" id="validationTooltip02" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="validationTooltip03">Email *</label>
                                    <input type="text" onChange={e => setEmail(e.target.value)} value={email} className="form-control" id="validationTooltip03" required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="exampleFormControlSelect1">Role *</label>
                                    <select onChange={roleOnChange} className="form-control" id="exampleFormControlSelect1">
                                        <option defaultValue>--Select user role--</option>
                                        {roleOptions}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="validationTooltip04">Password{userActionState !== 'edit' ? ' *' : ''}</label>
                                    <input type="text" onChange={e => setPassword(e.target.value)} className="form-control" id="validationTooltip04" />
                                </div>
                            </div>
                            {(canViewAssignRolesList || selectedViewableRoles.length !== 0) && (
                                <>
                                    <br />
                                    <div className="col-md-12 mb-12">
                                        <label>Assign roles this user will view</label>
                                        <DualListBox canFilter options={rolesOptions} selected={selectedViewableRoles} onChange={setSelectedViewableRoles} />
                                    </div>
                                </>
                            )}
                            <br />
                            <div className="form-row">
                                <div className="col-md-6 mb-6">
                                    <div style={{ overflow: 'scroll', maxHeight: '300px', minHeight: '300px', paddingBottom: '6px', paddingRight: '16px' }}>
                                        <p>Select Organisation Unit *</p>
                                        <TreeView assignedOrgUnits={assignedOrgUnits} addCheckBox={true} clickHandler={selectOrgUnitHandler} orgUnits={orgUnits} />
                                    </div>
                                </div>
                                <div id="selectedOrgs" className="col-md-6 mb-6">
                                    <div style={{ overflow: 'scroll', maxHeight: '300px', minHeight: '300px', paddingBottom: '6px', paddingRight: '16px' }}>
                                        <p>Selected Organisation Units *</p>
                                        {selectedOrgsList}
                                    </div>
                                </div>
                            </div>
                            <button onClick={userActionState !== 'edit' ? saveUser : updateCurrentUser} style={{ marginTop: '10px' }} className="btn btn-primary mr-2">
                                {userActionState === 'edit' ? 'Update User' : 'Save User'}
                            </button>
                            <button style={{ marginTop: '10px' }} onClick={resetAndClose} className="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="saveUserModal" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Notice!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body"><p id="modal-message">{message}</p></div>
                        <div className="modal-footer">
                            <button type="button" onClick={closeRegisterPage ? () => toggleDisplay() : undefined} className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Register;

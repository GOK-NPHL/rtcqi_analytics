import React from 'react';
import DualListBox from 'react-dual-listbox';
import { FetchPartners, FetchPartner, FetchOrgunits, FetchUsers } from '../../utils/Helpers';

export function PartnerForm({ saveFxn, toEdit }) {
    let id = null;
    if (toEdit) id = toEdit;

    const [loading, setLoading] = React.useState(true);
    const [users, setUsers] = React.useState([]);
    const [usersFixed, setUsersFixed] = React.useState([]);
    const [org_units, setOrgUnits] = React.useState([]);
    const [orgUnitsFixed, setOrgUnitsFixed] = React.useState([]);
    const [allPartners, setAllPartners] = React.useState([]);
    const [newPartner, setNewPartner] = React.useState({
        'name': '',
        'description': '',
        'url': '',
        'location': '',
        'active': true,
        'start_date': '',
        'end_date': '',
        'email': '',
        'phone': '',
        'address': '',
        'users': [],
        "level": '',
        "parent_partner_id": null,
        'org_units': [],
    });
    const [isEdit, setIsEdit] = React.useState(!!id);
    React.useEffect(() => {
        if (id) {
            console.log('edit', id)
            FetchPartner(id).then((response) => {
                let np = response;
                np['users'] = response?.users?.map((u) => u.id);
                np['org_units'] = response?.org_units?.map((u) => u.org_unit_id);
                delete np['created_at'];
                delete np['updated_at'];
                setNewPartner(np);
                setLoading(false);
                setIsEdit(true);
            });
        } else {
            setIsEdit(false);
            setNewPartner({
                'name': '',
                'description': '',
                'url': '',
                'location': '',
                'active': true,
                'start_date': '',
                'end_date': '',
                'email': '',
                'phone': '',
                'address': '',
                'users': [],
                "level": '',
                "parent_partner_id": null,
                'org_units': []
            })
            setLoading(false);
        }

        // users
        FetchUsers().then((response) => {
            let usrs = response.filter((user) => {
                return user.role_name.toLowerCase() == 'partner';
            }) || [];
            setUsers(usrs);
            setUsersFixed(usrs);
        })

        // org units
        FetchOrgunits().then((response) => {
            let ous = response.payload[0]
                // .filter((ou) => { return ou.level == 4; })
                || [];
            setOrgUnits(ous);
            setOrgUnitsFixed(ous);
        })

        // partners
        FetchPartners().then((response) => {
            setAllPartners(response);
        })
    }, [id]);


    return (
        <div className="modal fade" id="partnerForm">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    {loading ? <>
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </> : <form onSubmit={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        if (newPartner && newPartner.name != null) {
                            saveFxn(newPartner);
                            // dismiss modal
                            $('#partnerForm').modal('hide');
                        } else {
                            setMessage('Please fill in all fields')
                            setStatus(500)
                        }
                    }}>
                        <div className="modal-header">
                            <h5 className="modal-title text-center">{isEdit ? "Edit" : "New"} Partner</h5>
                            {/* 'name', 'description', 'url', 'location', 'active', 'start_date', 'end_date', 'email', 'phone', 'address', */}
                        </div>
                        <div className="modal-body">
                            {/* <div className="col-md-12">
                                <pre>{JSON.stringify(newPartner, null, 2)}</pre>
                            </div> */}
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_name">Name</label>
                                </div>
                                <div className="col-md-9">
                                    <input value={newPartner?.name || ''} type="text" className="form-control" id="partner_name" name="partner_name" placeholder="Partner name" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            name: ev.target.value
                                        })
                                    }} />
                                </div>
                            </div>
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_description">Description</label>
                                </div>
                                <div className="col-md-9">
                                    <textarea value={newPartner?.description || ''} className="form-control" id="partner_description" name="partner_description" placeholder="Partner description" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            description: ev.target.value
                                        })
                                    }} />
                                </div>
                            </div>
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_url">URL</label>
                                </div>
                                <div className="col-md-9">
                                    <input value={newPartner?.url || ''} type="text" className="form-control" id="partner_url" name="partner_url" placeholder="Partner URL" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            url: ev.target.value
                                        })
                                    }} />
                                </div>
                            </div>
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_location">Location</label>
                                </div>
                                <div className="col-md-9">
                                    <input value={newPartner?.location || ''} type="text" className="form-control" id="partner_location" name="partner_location" placeholder="Partner location" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            location: ev.target.value
                                        })
                                    }} />
                                </div>
                            </div>
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_active">Active?</label>
                                </div>
                                <div className="col-md-9">
                                    <select value={newPartner?.active || ''} className="form-control" id="partner_active" name="partner_active" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            active: ev.target.value == 'true' ? true : false
                                        })
                                    }}>
                                        <option value="">Select</option>
                                        <option value={true}>Yes</option>
                                        <option value={false}>No</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_start_date">Start date</label>
                                </div>
                                <div className="col-md-9">
                                    <input value={newPartner?.start_date ? new Date(newPartner?.start_date).toISOString().slice(0, 10) : ''} type="date" className="form-control" id="partner_start_date" name="partner_start_date" placeholder="Partner start date" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            start_date: new Date(ev.target.value).toISOString()
                                        })
                                    }} />
                                </div>
                            </div>
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_end_date">End date</label>
                                </div>
                                <div className="col-md-9">
                                    <input value={newPartner?.end_date ? new Date(newPartner?.end_date).toISOString().slice(0, 10) : ''} type="date" className="form-control" id="partner_end_date" name="partner_end_date" placeholder="Partner end date" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            end_date: new Date(ev.target.value).toISOString()
                                        })
                                    }} />
                                </div>
                            </div>
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_email">Email</label>
                                </div>
                                <div className="col-md-9">
                                    <input value={newPartner?.email || ''} type="email" className="form-control" id="partner_email" name='partner_email' placeholder="Partner email" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            email: ev.target.value
                                        })
                                    }} />
                                </div>
                            </div>
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_phone">Phone</label>
                                </div>
                                <div className="col-md-9">
                                    <input value={newPartner?.phone || ''} type="text" className="form-control" id="partner_phone" name="partner_phone" placeholder="Partner phone" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            phone: ev.target.value
                                        })
                                    }} />
                                </div>
                            </div>
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="partner_address">Address</label>
                                </div>
                                <div className="col-md-9">
                                    <input value={newPartner?.address || ''} type="text" className="form-control" id="partner_address" name="partner_address" placeholder="Partner address" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            address: ev.target.value
                                        })
                                    }} />
                                </div>
                            </div>
                            {/* users */}
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-12">
                                    <div className='row mb-2'>
                                        <div className='col-sm-3 py-0' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <label htmlFor="partner_users">Users <small>({users.length})</small></label>
                                        </div>
                                        <div className='col-sm-9 py-0'>
                                            <input type="text" className="form-control" id="partner_users_search" placeholder="Search users" onInput={(ev) => {
                                                let term = ev.target.value.toLowerCase();
                                                let filteredUsers = users.filter((us) => {
                                                    let name = (us.first_name || '') + ' ' + (us.last_name || '') + (us.email || '');
                                                    // if search term is longer than 2 characters
                                                    if (term.length > 2) {
                                                        return name.toLowerCase().indexOf(term) > -1;
                                                    } else {
                                                        return true;
                                                    }
                                                }) || [];
                                                if (term.length > 2) {
                                                    setUsers(filteredUsers)
                                                } else {
                                                    setUsers(usersFixed)
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <DualListBox options={Array.from(users, us => {
                                        return { value: us.id, label: (us.first_name || '') + ' ' + (us.last_name || '') + (' (' + us.email + ')' || '') }
                                    })} selected={newPartner.users} onChange={(selected) => {
                                        setNewPartner({
                                            ...newPartner,
                                            users: selected
                                        })
                                    }} />
                                </div>
                            </div>
                            {/* parent_partner */}
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="parent_partner_id">Parent partner</label>
                                </div>
                                <div className="col-md-9">
                                    <select value={newPartner?.parent_partner_id || ''} className="form-control" id="parent_partner_id" name="parent_partner_id" onChange={(ev) => {
                                        setNewPartner({
                                            ...newPartner,
                                            parent_partner_id: ev.target.value
                                        })
                                    }}>
                                        <option value={''}> -- Select (None) -- </option>
                                        {allPartners.map((par) => (
                                            <option key={par.id} value={par.id}>{par.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* level */}
                            <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-3">
                                    <label htmlFor="level">Org unit Level</label>
                                </div>
                                <div className="col-md-9">
                                    <select value={newPartner?.level || ''} className="form-control" id="level" name="level" onChange={(ev) => {
                                        // filter org units
                                        setOrgUnits(orgUnitsFixed.filter((ou) => ou.level == ev.target.value))
                                        setNewPartner({
                                            ...newPartner,
                                            level: ev.target.value
                                        })
                                    }}>
                                        <option value=""> -- Select -- </option>
                                        <option value={1}>Level 1</option>
                                        <option value={2}>Level 2</option>
                                        <option value={3}>Level 3</option>
                                        <option value={4}>Level 4</option>
                                        {/* <option value={5}>Level 5</option> */}
                                    </select>
                                </div>
                            </div>
                            {/* org_units */}
                            {newPartner && newPartner?.level && newPartner?.level > 0 && <div className="form-group row p-2 my-2" style={{ borderBottom: '1px solid #e2e2e2' }}>
                                <div className="col-md-12">
                                    <div className='row mb-2'>
                                        <div className='col-sm-3 py-0' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <label htmlFor="partner_org_units">Organisation units <small>({org_units.length})</small></label>
                                        </div>
                                        <div className='col-sm-9 py-0'>
                                            <input type="text" className="form-control" id="partner_org_units_search" placeholder="Search org_units" onInput={(ev) => {
                                                let term = ev.target.value.toLowerCase();
                                                let filteredOUs = org_units.filter((ou) => {
                                                    let name = ou.odk_unit_name
                                                    // if search term is longer than 2 characters
                                                    if (term.length > 2) {
                                                        return name.toLowerCase().indexOf(term) > -1;
                                                    } else {
                                                        return true;
                                                    }
                                                }) || [];
                                                if (term.length > 2) {
                                                    setOrgUnits(filteredOUs)
                                                } else {
                                                    setOrgUnits(orgUnitsFixed)
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <DualListBox options={Array.from(org_units, ou => {
                                        return {
                                            // value: ou.id,
                                            value: ou.org_unit_id,
                                            label: ou.odk_unit_name.split('_').join(' ').trim().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
                                        }
                                    })} selected={newPartner.org_units} onChange={(selected) => {
                                        setNewPartner({
                                            ...newPartner,
                                            org_units: selected
                                        })
                                    }} />
                                </div>
                            </div>}
                        </div>
                        <div className="modal-footer">
                            <button type="button" id="dismissSave" className="btn btn-link" data-dismiss="modal">Cancel</button>
                            <button type="submit" className="btn btn-primary">{
                                isEdit ? 'Update' : 'Save'
                            }</button>
                        </div>
                    </form>}
                </div>
            </div>
        </div>
    );
}

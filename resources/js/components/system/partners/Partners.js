import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { FetchUserAuthorities, FetchPartners, FetchUsers, FetchOrgunits, SavePartner, DeletePartner, UpdatePartner } from '../../utils/Helpers';
import 'jspdf-autotable';
import { ViewPartner } from './ViewPartner';
import { PartnerForm } from './PartnerForm';

function Partners() {
    const [auths, setAuths] = useState([]);
    const [partners, setPartners] = useState([]);
    const [ptns, setPtns] = useState([]);
    const [orgUnits, setOrgUnits] = useState([]);
    const [viewPartner, setViewPartner] = useState(null);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(null);
    const [toEdit, setToEdit] = useState(null);

    const fetchAllPartners = async () => {
        const data = await FetchPartners();
        setPartners(data);
        setPtns(data);
    };

    useEffect(() => {
        fetchAllPartners();
        FetchUserAuthorities().then(setAuths).catch(err => console.error('Error fetching authorities:', err));
        FetchUsers().then(users => {
            // available if needed
        }).catch(err => console.error('Error fetching users:', err));
        FetchOrgunits().then(data => {
            const ous = data.payload[0].filter(ou => ou.level == 4) || [];
            setOrgUnits(ous);
        }).catch(err => console.error('Error fetching org units:', err));
    }, []);

    useEffect(() => {
        if (toEdit) $('#partnerForm').modal('show');
    }, [toEdit]);

    const saveNewPartner = async (fl) => {
        const result = await SavePartner(fl);
        if (result.status === 200) {
            setMessage('Partner saved successfully');
            setStatus(200);
        } else {
            setMessage(result?.data?.message || result?.data?.error || 'An error occurred while saving partner');
            setStatus(500);
        }
        $('#partnerForm').modal('hide');
        await fetchAllPartners();
    };

    const deleteAPartner = async (id) => {
        if (!window.confirm('Are you sure you want to delete this partner?')) return;
        const result = await DeletePartner(id);
        if (result.status === 200) { setMessage('Partner deleted successfully'); setStatus(200); }
        else { setMessage(result?.data?.message || 'An error occurred while deleting partner'); setStatus(500); }
        await fetchAllPartners();
    };

    const updateAPartner = async (partner) => {
        const result = await UpdatePartner(partner);
        if (result.status === 200) { setMessage('Partner updated successfully'); setStatus(200); }
        else { setMessage(result?.data?.message || 'An error occurred while updating partner'); setStatus(500); }
        await fetchAllPartners();
    };

    const searchPartner = (e) => {
        const search = e.target.value;
        if (search.length > 2) {
            setPartners(ptns.filter(p => (p.name + ' ' + p.description + ' ' + p.location + ' ' + p.address + ' ' + p.email).toLowerCase().includes(search.toLowerCase())));
        } else {
            setPartners(ptns);
        }
    };

    const canManage = auths?.includes('manage_partners');

    return (
        <React.Fragment>
            {status && message && (
                <div className="row">
                    <div className="col-lg-12">
                        <div className={`alert alert-${status === 200 ? 'success' : 'danger'}`}>
                            <button type="button" className="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                            <strong>{status === 200 ? 'Success' : 'Error'}</strong>
                            <p>{message}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col-md-6"><h1 className="h4 mb-0">Partners</h1></div>
                <div className="col-md-4">
                    <div className="form-group">
                        <input type="text" autoComplete="off" className="form-control" placeholder="Search" onInput={searchPartner} />
                    </div>
                </div>
                <div className="col-md-2 text-right">
                    {canManage && <a className="btn btn-success pull-right" data-toggle="modal" href="#partnerForm">Add new partner</a>}
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="table-responsive">
                        <table className="table table-striped table-condensed">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Parent</th>
                                    <th>Contact</th>
                                    {canManage ? <th>Actions</th> : <th>&nbsp;</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {partners?.length > 0 ? partners.map((fl, x) => (
                                    <tr key={x + '_'}>
                                        <td style={{ verticalAlign: 'middle' }}>{fl.name}</td>
                                        <td style={{ verticalAlign: 'middle', border: '1px solid #ccd6e3' }}>
                                            {fl['active'] == '1' || fl['active'] === true
                                                ? <span className="badge badge-success"><i className="fa fa-check"></i> Active</span>
                                                : <span className="badge badge-danger"><i className="fa fa-lock"></i> Disabled</span>}
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>{fl.parent_name || ''}</td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <p className="mb-0"><small>Location:</small> {fl['location']}</p>
                                            <p className="mb-0"><small>Address:</small> {fl['address']}</p>
                                            <p className="mb-0"><small>Email:</small> {fl['email']}</p>
                                            <p className="mb-0"><small>Phone:</small> {fl['phone']}</p>
                                            <p className="mb-0"><small>Website:</small> <a href={fl['url']} target="_blank">{fl['url']}</a></p>
                                        </td>
                                        {canManage ? (
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <a className="btn btn-sm btn-outline-primary" onClick={() => { setViewPartner(fl); $('#viewPartner').modal('show'); }}>
                                                    <i className="fa fa-eye"></i> View
                                                </a> &nbsp;
                                                <a className="btn btn-sm btn-outline-info" onClick={() => setToEdit(fl.id)}>
                                                    <i className="fa fa-edit"></i> Edit
                                                </a> &nbsp;
                                                <a className="btn btn-sm btn-outline-danger" onClick={() => deleteAPartner(fl.id)}>
                                                    <i className="fa fa-trash"></i> Delete
                                                </a>
                                            </td>
                                        ) : <td></td>}
                                    </tr>
                                )) : (
                                    <tr><th className="text-center" colSpan={5}>No partners found.</th></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {orgUnits?.length > 0 && <PartnerForm saveFxn={toEdit ? updateAPartner : saveNewPartner} toEdit={toEdit} />}
            {viewPartner && <ViewPartner partner={viewPartner} />}
        </React.Fragment>
    );
}

export default Partners;

const el = document.getElementById('partners');
if (el) ReactDOM.createRoot(el).render(<Partners />);

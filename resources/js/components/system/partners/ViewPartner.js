import React from 'react';
import { FetchPartner } from '../../utils/Helpers';

export function ViewPartner(ptnr) {
    const id = ptnr?.partner?.id;
    // modal
    const [partner, setPartner] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        if (id)
            FetchPartner(id).then((response) => {
                setPartner(response);
                setLoading(false);
            });
    }, [id]);


    return (
        <div className="modal fade" id="viewPartner" tabIndex="-1" role="dialog" aria-labelledby="viewPartnerLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="viewPartnerLabel">View Partner</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-12">
                                {loading ? <>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </> : <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td>Partner Name</td>
                                                <td>{partner?.name}</td>
                                            </tr>
                                            <tr>
                                                <td>Partner Description</td>
                                                <td>{partner?.description}</td>
                                            </tr>
                                            <tr>
                                                <td>Partner Status</td>
                                                <td>{partner?.active ? <span className='badge badge-success'>Active</span> : <span className='badge badge-dark'>Disabled</span>}</td>
                                            </tr>
                                            <tr>
                                                <td>Organisation Unit Level</td>
                                                <td> {partner?.level ? "Level "+partner?.level : <span className='badge badge-dark'>Not set</span>}</td>
                                            </tr>
                                            <tr>
                                                <td>Partner Parent</td>
                                                <td> {partner?.parent ? partner?.parent?.name : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>Partner Address</td>
                                                <td>{partner?.address}</td>
                                            </tr>
                                            <tr>
                                                <td>Partner Phone</td>
                                                <td>{partner?.phone}</td>
                                            </tr>
                                            <tr>
                                                <td>Partner Email</td>
                                                <td>{partner?.email}</td>
                                            </tr>
                                            <tr>
                                                <td>Partner Website</td>
                                                <td><a href={partner?.url} target="_blank">{partner?.url}</a></td>
                                            </tr>
                                            <tr>
                                                <td>Partner Users</td>
                                                <td>
                                                    <ul>
                                                        {partner.users.map((user, index) => {
                                                            return (
                                                                <li key={index}>{user?.name || ''} {user?.last_name || ''} {user?.email ? '(' + user?.email + ')' : '-'}</li>
                                                            );
                                                        })}
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Partner Organisation Units</td>
                                                <td>
                                                    <ul>
                                                        {partner.org_units.map((ou, index) => {
                                                            return (
                                                                <li key={index}>{ou?.odk_unit_name.split('_').join(' ').trim().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')} {ou?.level ? ' (Level ' + ou.level + ')' : ''}</li>
                                                            );
                                                        })}
                                                    </ul>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import ReactDOM from 'react-dom';

import { exportToExcel, FetchUserAuthorities, FetchPartners, FetchPartner, FetchUsers, FetchOrgunits, SavePartner, DeletePartner } from '../../utils/Helpers'
import 'jspdf-autotable'
import Pagination from 'react-js-pagination';
import OrgDate from '../../utils/orgunit/OrgDate';
import DualListBox from 'react-dual-listbox';


const ViewPartner = (ptnr) => {
    const id = ptnr?.partner?.id
    // modal
    const [partner, setPartner] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        if (id) FetchPartner(id).then((response) => {
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
                                            {/* <tr>
                                                <td>Partner Level</td>
                                                <td>{partner?.partner_level}</td>
                                            </tr>
                                            <tr>
                                                <td>Partner Parent</td>
                                                <td>{partner?.partner_parent}</td>
                                            </tr> */}
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
                                                            )
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
                                                            )
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
    )
}



class Partners extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            auths: [],
            partners: [],
            ptns: [], // preserved for resetting filter/search
            users: [],
            usrs: [], // preserved for resetting filter/search
            org_units: [],
            ous: [], // preserved for resetting filter/search
            newPartner: {
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
                'org_units': [],
            },
            viewPartner: null,
            viewPartnerModal: false,
            message: '',
            status: null,
        }
        this.saveNewPartner = this.saveNewPartner.bind(this);
        this.deleteAPartner = this.deleteAPartner.bind(this);
        this.searchPartner = this.searchPartner.bind(this);
    }

    componentDidMount() {
        (async () => {
            let returnedData = await FetchPartners();
            this.setState({
                partners: returnedData,
                ptns: returnedData,
            });

            FetchUserAuthorities().then((auths) => {
                this.setState({ auths: auths });
            }).catch((err) => {
                console.log('Error fetching user authorities: ' + err);
            })

            // users
            FetchUsers().then((users) => {
                let usrs = users.filter((user) => {
                    return user.role_name.toLowerCase() == 'partner';
                }) || [];
                this.setState({ users: usrs, usrs: usrs });
            }).catch((err) => {
                console.log('Error fetching users: ' + err);
            })

            // org units
            FetchOrgunits().then((org_units) => {
                let ous = org_units.payload[0].filter((ou) => {
                    return ou.level == 4;
                }) || [];
                this.setState({ org_units: ous, ous: ous });
            }).catch((err) => {
                console.log('Error fetching org units: ' + err);
            })

        })();

    }

    saveNewPartner(fl) {
        (async () => {
            let result = await SavePartner(fl);
            console.log('saveNewPartner response:::: ', result);
            if (result.status == 200) {
                this.setState({
                    partners: result.data.data,
                    message: 'Partner saved successfully',
                    status: 200,
                });
                let ptnrs = await FetchPartners();
                this.setState({
                    partners: ptnrs,
                    ptns: ptnrs,
                });
            } else {
                this.setState({
                    message: result?.data?.error || result?.statusText || 'An error occured while saving partner',
                    status: 500,
                });
            }
            this.setState({
                newPartner: {
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
                    'org_units': [],
                }
            });

            $('#newPartnerModal').modal('hide');
        })();
    }

    deleteAPartner(id) {
        (async () => {
            let result = await DeletePartner(id);
            console.log('deleteAPartner response:::: ', result);
            if (result.status == 200) {
                this.setState({
                    message: 'Partner deleted successfully',
                    status: 200,
                });
                let ptnrs = await FetchPartners();
                this.setState({
                    partners: ptnrs,
                    ptns: ptnrs,
                });
            } else {
                this.setState({
                    message: result?.data?.error || result?.statusText || 'An error occured while deleting partner',
                    status: 500,
                });
            }
        })();
    }


    searchPartner(e) {
        let search = e.target.value;
        let filteredPartners = this.state.partners.filter((partner) => {
            return (partner.name + ' ' + partner.description + ' ' + partner.location + ' ' + partner.address + ' ' + partner.email).toLowerCase().includes(search.toLowerCase())
        }) || [];
        if (search.length > 2) {
            this.setState({
                partners: filteredPartners
            })
        } else {
            this.setState({
                partners: this.state.ptns
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true
        // if (prevState.showUserTable !== this.state.showUserTable) {
        //     // this.getUsers();
        // }
    }


    render() {

        return (

            <React.Fragment>

                {/* Page Heading */}
                {this.state.status && this.state.status != null && this.state.message && this.state.message != null && <div className="row">
                    <div className="col-lg-12">
                        <div className={"alert alert-" + (this.state.status == 200 ? "success" : "danger")}>
                            <button type="button" className="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                            <strong>
                                {this.state.status == 200 ? "Success" : "Error"}
                            </strong>
                            <p>{this.state.message}</p>
                        </div>
                    </div>
                </div>}

                {/* Filter bar */}
                <div className="row">
                    <div className="col-md-6">
                        <h1 className="h4 mb-0">Partners</h1>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <input type="text" autoComplete='off' className="form-control" id="search" placeholder="Search" onInput={this.searchPartner} />
                        </div>
                    </div>
                    <div className="col-md-2 text-right">
                        {this.state.auths && this.state.auths.includes('manage_partners') &&
                            <>&nbsp;&nbsp;<a className="btn btn-success pull-right" data-toggle="modal" href='#newPartnerModal'>Add new partner</a>&nbsp;&nbsp;</>
                        }
                    </div>
                </div>
                {/* end filter bar */}

                <div className="row">
                    <div className="col-md-12">
                        {/* <div className="col-md-12" style={{ backgroundColor: '#fff', color: 'black', padding: '7px', borderRadius: '6px', margin: '2em auto' }}>
                            <h6>
                                <details>
                                    <summary>this.state.newpartner</summary>
                                    <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                                        <pre>
                                            {JSON.stringify(this.state.newPartner, null, 1)}
                                        </pre>
                                    </div>
                                </details>
                            </h6><br />
                            <h6>
                                <details>
                                    <summary>this.state.partners</summary>
                                    <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                                        <pre>
                                            {JSON.stringify(this.state.partners, null, 1)}
                                        </pre>
                                    </div>
                                </details>
                            </h6><br />
                            <h6>Status: {this.state.status}</h6>
                            <h6>Message: {this.state.message}</h6>
                            <small>
                                <details>
                                    <summary>this.state.auths</summary>
                                    <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                                        <pre>
                                            {JSON.stringify(this.state.auths, null, 1)}
                                        </pre>
                                    </div>
                                </details>
                            </small><br />
                        </div> */}

                        <div className="table-responsive">
                            {/* 'name', 'description', 'url', 'location', 'active', 'start_date', 'end_date', 'email', 'phone', 'address', */}
                            <table className='table table-striped table-condensed'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        {/* <th>Description</th> */}
                                        <th>Active</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Contact</th>  {/*  incl. location, address, email, phone, url */}
                                        {this.state.auths && this.state.auths.includes('manage_partners') ? <th>Actions</th> : <th></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.partners && this.state.partners.length > 0 ? this.state.partners.map((fl, x) => (
                                        <tr key={x + "_"}>
                                            <td style={{ verticalAlign: 'middle' }}>{fl.name}</td>
                                            {/* <td style={{verticalAlign: 'middle'}}>{fl.description}</td> */}
                                            <td style={{ verticalAlign: 'middle', border: '1px solid #ccd6e3' }}>{fl['active'] == "1" || fl['active'] === true ? <span className="badge badge-success"><i className="fa fa-check"></i> Yes</span> : <span className="badge badge-danger"><i className="fa fa-lock"></i> No</span>}</td>
                                            <td style={{ verticalAlign: 'middle' }}>{fl['start_date'] ? new Date(fl['start_date']).toDateString() : '-'}</td>
                                            <td style={{ verticalAlign: 'middle' }}>{fl['end_date'] ? new Date(fl['end_date']).toDateString() : '-'}</td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <div className="">
                                                    <p className='mb-0'>
                                                        <small>Location:</small> &nbsp; &nbsp;
                                                        <span>{fl['location']}</span>
                                                    </p>
                                                    <p className='mb-0'>
                                                        <small>Address:</small> &nbsp; &nbsp;
                                                        <span>{fl['address']}</span>
                                                    </p>
                                                    <p className='mb-0'>
                                                        <small>Email:</small> &nbsp; &nbsp;
                                                        <span>{fl['email']}</span>
                                                    </p>
                                                    <p className='mb-0'>
                                                        <small>Phone:</small> &nbsp; &nbsp;
                                                        <span>{fl['phone']}</span>
                                                    </p>
                                                    <p className='mb-0'>
                                                        <small>Website:</small> &nbsp; &nbsp;
                                                        <a href={fl['url']} target="_blank">{fl['url']}</a>
                                                    </p>
                                                </div>
                                            </td>
                                            {this.state.auths && this.state.auths.includes('manage_partners') ?
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    <a className="btn btn-sm btn-outline-primary" data-toggle="modal" href='#viewPartnerModal' onClick={(ev) => {
                                                        // view
                                                        this.setState({
                                                            viewPartner: fl
                                                        })
                                                        $('#viewPartner').modal('show');
                                                    }}><i className="fa fa-eye"></i> View</a> &nbsp;
                                                    <a className="btn btn-sm btn-outline-info" data-toggle="modal" href='#editPartnerModal' onClick={() => this.setState({ toEdit: fl.id })}>Edit</a>&nbsp;
                                                    <a className="btn btn-sm btn-outline-danger" onClick={(ev) => {
                                                        ev.preventDefault();
                                                        window.confirm('Are you sure you want to delete this partner?') && this.deleteAPartner(fl.id);
                                                    }}><i className="fa fa-trash"></i> Delete</a>
                                                </td>
                                                : <td></td>
                                            }
                                        </tr>
                                    )) : <tr>
                                        <th className='text-center' colSpan={7}>No partners found.</th>
                                    </tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="newPartnerModal">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <form onSubmit={
                                (ev) => {
                                    ev.preventDefault();
                                    ev.stopPropagation();
                                    // console.log('this.state.newPartner::: ', this.state.newPartner);
                                    // console.log('t::: ', typeof this.state.newPartner);
                                    if (this.state.newPartner && this.state.newPartner.name != null) {
                                        this.saveNewPartner(this.state.newPartner);
                                    } else {
                                        this.setState({
                                            message: 'Please fill in all fields',
                                            status: 500,
                                        });
                                    }
                                }
                            }>
                                <div className="modal-header">
                                    <h5 className="modal-title text-center">New Partner</h5>
                                    {/* 'name', 'description', 'url', 'location', 'active', 'start_date', 'end_date', 'email', 'phone', 'address', */}
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label htmlFor="partner_name">Name</label>
                                        <input type="text" className="form-control" id="partner_name" name="partner_name" placeholder="Partner name" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    name: ev.target.value
                                                }
                                            })
                                        }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="partner_description">Description</label>
                                        <textarea className="form-control" id="partner_description" name="partner_description" placeholder="Partner description" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    description: ev.target.value
                                                }
                                            })
                                        }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="partner_url">URL</label>
                                        <input type="text" className="form-control" id="partner_url" name="partner_url" placeholder="Partner URL" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    url: ev.target.value
                                                }
                                            })
                                        }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="partner_location">Location</label>
                                        <input type="text" className="form-control" id="partner_location" name="partner_location" placeholder="Partner location" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    location: ev.target.value
                                                }
                                            })
                                        }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="partner_active">Active?</label>
                                        <select className="form-control" id="partner_active" name="partner_active" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    active: ev.target.value == 'true' ? true : false
                                                }
                                            })
                                        }}>
                                            <option value="">Select</option>
                                            <option value={true}>Yes</option>
                                            <option value={false}>No</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="partner_start_date">Start date</label>
                                        <input type="date" className="form-control" id="partner_start_date" name="partner_start_date" placeholder="Partner start date" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    start_date: ev.target.value
                                                }
                                            })
                                        }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="partner_end_date">End date</label>
                                        <input type="date" className="form-control" id="partner_end_date" name="partner_end_date" placeholder="Partner end date" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    end_date: ev.target.value
                                                }
                                            })
                                        }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="partner_email">Email</label>
                                        <input type="email" className="form-control" id="partner_email" name='partner_email' placeholder="Partner email" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    email: ev.target.value
                                                }
                                            })
                                        }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="partner_phone">Phone</label>
                                        <input type="text" className="form-control" id="partner_phone" name="partner_phone" placeholder="Partner phone" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    phone: ev.target.value
                                                }
                                            })
                                        }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="partner_address">Address</label>
                                        <input type="text" className="form-control" id="partner_address" name="partner_address" placeholder="Partner address" onChange={(ev) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    address: ev.target.value
                                                }
                                            })
                                        }} />
                                    </div>
                                    {/* users */}
                                    <div className="form-group">
                                        <div className='row mb-2'>
                                            <div className='col-sm-4 py-0' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                <label htmlFor="partner_users">Users <small>({this.state.users.length})</small></label>
                                            </div>
                                            <div className='col-sm-8 py-0'>
                                                <input type="text" className="form-control" id="partner_users_search" placeholder="Search users" onInput={(ev) => {
                                                    let term = ev.target.value.toLowerCase();
                                                    let filteredUsers = this.state.users.filter((us) => {
                                                        let name = (us.first_name || '') + ' ' + (us.last_name || '') + (us.email || '');
                                                        // if search term is longer than 2 characters
                                                        if (term.length > 2) {
                                                            return name.toLowerCase().indexOf(term) > -1;
                                                        } else {
                                                            return true;
                                                        }
                                                    }) || [];
                                                    if (term.length > 2) {
                                                        this.setState({
                                                            users: filteredUsers
                                                        })
                                                    } else {
                                                        this.setState({
                                                            users: this.state.usrs
                                                        })
                                                    }
                                                }} />
                                            </div>
                                        </div>
                                        <DualListBox options={Array.from(this.state.users, us => {
                                            return { value: us.id, label: (us.first_name || '') + ' ' + (us.last_name || '') + (' (' + us.email + ')' || '') }
                                        })} selected={this.state.newPartner.users} onChange={(selected) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    users: selected
                                                }
                                            })
                                        }} />
                                    </div>
                                    {/* org_units */}
                                    <div className="form-group">
                                        <div className='row mb-2'>
                                            <div className='col-sm-4 py-0' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                <label htmlFor="partner_org_units">Organisation units <small>({this.state.org_units.length})</small></label>
                                            </div>
                                            <div className='col-sm-8 py-0'>
                                                <input type="text" className="form-control" id="partner_org_units_search" placeholder="Search org_units" onInput={(ev) => {
                                                    let term = ev.target.value.toLowerCase();
                                                    let filteredOUs = this.state.org_units.filter((ou) => {
                                                        let name = ou.odk_unit_name
                                                        // if search term is longer than 2 characters
                                                        if (term.length > 2) {
                                                            return name.toLowerCase().indexOf(term) > -1;
                                                        } else {
                                                            return true;
                                                        }
                                                    }) || [];
                                                    if (term.length > 2) {
                                                        this.setState({
                                                            org_units: filteredOUs
                                                        })
                                                    } else {
                                                        this.setState({
                                                            org_units: this.state.ous
                                                        })
                                                    }
                                                }} />
                                            </div>
                                        </div>
                                        <DualListBox options={Array.from(this.state.org_units, ou => {
                                            return {
                                                // value: ou.id,
                                                value: ou.org_unit_id,
                                                label: ou.odk_unit_name.split('_').join(' ').trim().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
                                            }
                                        })} selected={this.state.newPartner.org_units} onChange={(selected) => {
                                            this.setState({
                                                newPartner: {
                                                    ...this.state.newPartner,
                                                    org_units: selected
                                                }
                                            })
                                        }} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" id="dismissSave" className="btn btn-link" data-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* view */}
                {this.state.viewPartner && <ViewPartner partner={this.state.viewPartner} />}

            </React.Fragment>
        );
    }

}

export default Partners;


if (document.getElementById('partners')) {
    let domValues = [];
    let domValuesMap = {};
    domValues.forEach(element => {
        for (const property in element) {
            domValuesMap[property] = element[property];
        }
    });

    const props = Object.assign({}, domValuesMap);
    ReactDOM.render(<Partners {...props} />, document.getElementById('partners'));
}

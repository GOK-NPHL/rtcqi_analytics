import React from 'react';
import ReactDOM from 'react-dom';

import { exportToExcel, FetchUserAuthorities, FetchPartners, FetchUsers, FetchOrgunits, SavePartner, DeletePartner } from '../../utils/Helpers'
import 'jspdf-autotable'
import Pagination from 'react-js-pagination';
import OrgDate from '../../utils/orgunit/OrgDate';
import DualListBox from 'react-dual-listbox';
import { ViewPartner } from './ViewPartner';
import { PartnerForm } from './PartnerForm';


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
            message: '',
            status: null,
            toEdit: null,
        }
        this.saveNewPartner = this.saveNewPartner.bind(this);
        this.deleteAPartner = this.deleteAPartner.bind(this);
        this.updateAPartner = this.updateAPartner.bind(this);
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

            $('#partnerForm').modal('hide');
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

    updateAPartner(partner) {
        (async () => {
            let result = await SavePartner(partner);
            console.log('updateAPartner response:::: ', result);
            if (result.status == 200) {
                this.setState({
                    message: 'Partner updated successfully',
                    status: 200,
                });
                let ptnrs = await FetchPartners();
                this.setState({
                    partners: ptnrs,
                    ptns: ptnrs,
                });
            } else {
                this.setState({
                    message: result?.data?.error || result?.statusText || 'An error occured while updating partner',
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
        // prime the dynamic modals
        if (nextState.toEdit) {
            $('#partnerForm').modal('show');
        }
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
                            <>&nbsp;&nbsp;<a className="btn btn-success pull-right" data-toggle="modal" href='#partnerForm'>Add new partner</a>&nbsp;&nbsp;</>
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
                                        <th>Contact</th>{/*  incl. location, address, email, phone, url */}
                                        {this.state.auths && this.state.auths.includes('manage_partners') ? <th>Actions</th> : <th>&nbsp;</th>}
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
                                                    <a className="btn btn-sm btn-outline-primary" onClick={(ev) => {
                                                        // view
                                                        this.setState({
                                                            viewPartner: fl
                                                        })
                                                        $('#viewPartner').modal('show');
                                                    }}><i className="fa fa-eye"></i> View</a> &nbsp;
                                                    <a className="btn btn-sm btn-outline-info" onClick={(ev) => {
                                                        // edit
                                                        this.setState({
                                                            toEdit: fl.id
                                                        })
                                                        $('#partnerForm').modal('show');
                                                    }}><i className="fa fa-edit"></i> Edit</a> &nbsp;
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

                {/* form */}
                <PartnerForm saveFxn={this.state.toEdit != null ? this.updateAPartner : this.saveNewPartner} toEdit={this.state.toEdit} />

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

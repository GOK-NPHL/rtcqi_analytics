import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { FetchRequestedNewOrgs } from '../../utils/Helpers';
import Pagination from "react-js-pagination";

import '../../../../css/OrgUnitFloatingButton.css';

class RequestedOrgUnits extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            requestedNewOrgs: [],
            allTableElements: [],
            currTableEl: [],
            startTableData: 0,
            endeTableData: 10,
            activePage: 1,
        };
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    componentDidMount() {
        (async () => {
            let requestedNewOrgs = await FetchRequestedNewOrgs();
            this.setState({
                requestedNewOrgs: requestedNewOrgs
            });
        })();
    }

    updateOrg(org, newOrgToName) {
        // (async () => {
        //     let returnedData = await UpdateOrg(org, newOrgToName);
        //     $("#org_success").html(returnedData);
        //     $("#org_success").show();
        //     $("#org_success").fadeTo(2000, 500).slideUp(500, () => {
        //         $("#org_success").alert(500);
        //         this.setState({
        //             newOrgToName: null
        //         });
        //     });
        // })();
    }

    handlePageChange(pageNumber) {
        console.log(`active page is ${pageNumber}`);
        let pgNumber = pageNumber * 10 + 1;
        this.setState({
            startTableData: pgNumber - 11,
            endeTableData: pgNumber - 1,
            activePage: pageNumber
        });
    }

    render() {

        let orgs = [];

        if (this.state.requestedNewOrgs.length > 0) {
            this.state.requestedNewOrgs.map((value, index) => {
                orgs.push(<tr key={index + 1}>
                    <td>{index + 1}</td>
                    <td>{value.requested_name}</td>
                    <td>{value.parent_org_name}</td>
                    <td>{value.requester_name}</td>
                    <td>{value.created_at}</td>
                    <td>{value.status}</td>

                    <td>
                        <a
                            onClick={
                                () => {
                                    this.toggleDisplay();
                                    this.setState({
                                        userActionState: 'edit',
                                        selectedUser: user
                                    });
                                }
                            }
                            style={{ 'marginRight': '5px' }}
                            className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                            <i className="fas fa-user-edit"></i>
                        </a>
                        <a
                            onClick={() => {
                                this.setState({
                                    selectedUser: user
                                });
                                $('#deleteConfirmModal').modal('toggle');
                            }} className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                            <i className="fas fa-user-times"></i>
                        </a>
                    </td>
                </tr>
                );
            });

            if (this.state.allTableElements.length == 0) {
                this.setState({
                    allTableElements: orgs,
                    currTableEl: orgs
                })
            }

        }

        let pageContent = '';

        pageContent = <React.Fragment>
            <div className='row'>

                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Requested Organisation units</h1>
                </div>

                <div className='col-sm-12 col-md-12'>
                    <div className="form-group mb-2">
                        <input type="text"
                            onChange={(event) => {
                                let currUsersTableEl = this.state.allTableElements.filter(orgUnit => orgUnit['props']['children'][1]['props']['children'][0].toLowerCase().trim().includes(event.target.value.trim().toLowerCase()));
                                this.setState({
                                    currUsersTableEl: currUsersTableEl,
                                    activePage: 1,
                                    startTableData: 0,
                                    endeTableData: 10,
                                })

                            }}
                            className="form-control" placeholder="search from list"></input>
                    </div>

                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Requested name</th>
                                <th scope="col">Parent Org Name</th>
                                <th scope="col">Requester</th>
                                {/* <th scope="col">Requester org unit</th> */}
                                <th scope="col">Created at</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.currTableEl.slice(this.state.startTableData, this.state.endeTableData)}
                        </tbody>

                    </table>
                    <br />
                    <Pagination
                        itemClass="page-item"
                        linkClass="page-link"
                        activePage={this.state.activePage}
                        itemsCountPerPage={10}
                        totalItemsCount={this.state.currTableEl.length}
                        pageRangeDisplayed={5}
                        onChange={this.handlePageChange.bind(this)}
                    />
                </div>
            </div>
        </React.Fragment>

        return (

            <React.Fragment>
                {pageContent}
            </React.Fragment>
        );
    }
}

export default RequestedOrgUnits;

if (document.getElementById('requested_orgs')) {
    ReactDOM.render(<RequestedOrgUnits />, document.getElementById('requested_orgs'));
}
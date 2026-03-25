import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { FetchRequestedNewOrgs } from '../../utils/Helpers';
import Pagination from 'react-js-pagination';
import '../../../../css/OrgUnitFloatingButton.css';

function RequestedOrgUnits() {
    const [requestedNewOrgs, setRequestedNewOrgs] = useState([]);
    const [startTableData, setStartTableData] = useState(0);
    const [endeTableData, setEndeTableData] = useState(10);
    const [activePage, setActivePage] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        (async () => {
            const data = await FetchRequestedNewOrgs();
            setRequestedNewOrgs(data);
        })();
    }, []);

    const handlePageChange = (pageNumber) => {
        const pgNumber = pageNumber * 10 + 1;
        setStartTableData(pgNumber - 11);
        setEndeTableData(pgNumber - 1);
        setActivePage(pageNumber);
    };

    const filtered = search
        ? requestedNewOrgs.filter(o => o.requested_name?.toLowerCase().includes(search.toLowerCase()))
        : requestedNewOrgs;

    const rows = filtered.map((value, index) => (
        <tr key={index + 1}>
            <td>{index + 1}</td>
            <td>{value.requested_name}</td>
            <td>{value.parent_org_name}</td>
            <td>{value.requester_name}</td>
            <td>{value.created_at}</td>
            <td>{value.status}</td>
            <td>
                <a
                    data-toggle="tooltip" data-placement="top" title="View and act on submission"
                    onClick={() => $('#moreOrgunitInfo').modal('toggle')}
                    style={{ marginRight: '5px' }}
                    className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"
                >
                    <i className="fas fa-eye"></i>
                </a>
            </td>
        </tr>
    ));

    return (
        <React.Fragment>
            <div className="row">
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Requested Organisation units</h1>
                </div>
                <div className="col-sm-12 col-md-12">
                    <div className="form-group mb-2">
                        <input
                            type="text"
                            onChange={(e) => { setSearch(e.target.value); setActivePage(1); setStartTableData(0); setEndeTableData(10); }}
                            className="form-control"
                            placeholder="search from list"
                        />
                    </div>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Requested name</th>
                                <th scope="col">Parent Org Name</th>
                                <th scope="col">Requester</th>
                                <th scope="col">Created at</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>{rows.slice(startTableData, endeTableData)}</tbody>
                    </table>
                    <br />
                    <Pagination
                        itemClass="page-item"
                        linkClass="page-link"
                        activePage={activePage}
                        itemsCountPerPage={10}
                        totalItemsCount={rows.length}
                        pageRangeDisplayed={5}
                        onChange={handlePageChange}
                    />
                </div>
            </div>

            <div className="modal fade" id="moreOrgunitInfo" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">New Organisation unit request</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="newOrgName" className="col-sm-12 col-form-label">New organization unit name</label>
                                <div className="col-sm-12">
                                    <input type="text" className="form-control" id="newOrgName" placeholder="new org name" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={() => $('#moreOrgunitInfo').modal('toggle')} className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Send Request</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default RequestedOrgUnits;

const el = document.getElementById('requested_orgs');
if (el) ReactDOM.createRoot(el).render(<RequestedOrgUnits />);

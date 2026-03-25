import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { FetchOrgunits, exportToExcel, FetchUserAuthorities, FetchHTSSubmissions, FetchPartners } from '../../utils/Helpers';
import 'jspdf-autotable';
import Pagination from 'react-js-pagination';
import OrgUnitButton from '../../utils/orgunit/orgunit_button';
import OrgDate from '../../utils/orgunit/OrgDate';

function SubmissionsReport() {
    const [orgUnits, setOrgUnits] = useState([]);
    const [counties, setCounties] = useState([]);
    const [orgUnitDataIds, setOrgUnitDataIds] = useState(['0']);
    const [siteType, setSiteType] = useState([]);
    const [odkData, setOdkData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(100);
    const [page, setPage] = useState(1);
    const [countyDl, setCountyDl] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchOdkDataServer = useCallback(async (orgIds, stType, sd, ed, pg = 1, ppg = 100) => {
        if (!orgIds || orgIds.length === 0) return;
        const returnedData = await FetchHTSSubmissions(orgIds, stType, sd, ed, pg, ppg);
        if (returnedData.status === 200) {
            setOdkData(returnedData.data?.result || []);
            setHeaders(returnedData.data?.headers || []);
            setPage(returnedData.data?.page || 1);
            setTotal(returnedData.data?.total || 0);
            setPerPage(returnedData.data?.perPage || 100);
        }
    }, []);

    useEffect(() => {
        (async () => {
            const [returnedData, returnedPartners] = await Promise.all([FetchOrgunits(), FetchPartners()]);
            const defaultOU = returnedData.payload[0].slice(0, 1);
            setOrgUnits(returnedData.payload[0]);
            setCounties(returnedData.payload[0].filter(o => o.level === 2));
            setOrgUnitDataIds(defaultOU);
            fetchOdkDataServer(defaultOU, siteType, '', '', 1, 100);
        })();
    }, []);

    const onFilter = () => fetchOdkDataServer(orgUnitDataIds, siteType, startDate, endDate, page, perPage);

    const handlePageChange = (pg) => {
        setPage(pg);
        fetchOdkDataServer(orgUnitDataIds, siteType, startDate, endDate, pg, perPage);
    };

    return (
        <React.Fragment>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h4 mb-0 text-gray-500">HTS Submissions</h1>
                <span>{Intl.NumberFormat().format(total || 0)} records</span>
            </div>

            <div className="row">
                <div className="col-sm-12 col-lg-3 col-md-3 mb-sm-1 mb-1">
                    <OrgUnitButton orgUnitChangeHandler={(ou) => setOrgUnitDataIds(orgUnits.filter(o => ou.includes(o['org_unit_id'])))} />
                </div>
                <div className="col-sm-12 col-lg-4 col-md-4 mb-sm-1 mb-1">
                    <OrgDate orgDateChangeHandler={(sd, ed) => { setStartDate(sd); setEndDate(ed); }} />
                </div>
                <div className="col-sm-12 col-lg-4 col-md-4 mb-sm-1 mb-1">
                    <button onClick={onFilter} type="button" style={{ display: 'inlineBlock', marginRight: '7px' }} className="btn btn-sm btn-primary font-weight-bold mr-2">Filter</button>
                    <button onClick={() => window.location.reload()} type="button" style={{ display: 'inlineBlock', marginRight: '7px' }} className="btn btn-sm btn-secondary font-weight-bold">Reset</button>
                    <a className="btn btn-primary ml-4" data-toggle="modal" href="#exportDataModal">Export data</a>

                    <div className="modal fade" id="exportDataModal">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <h5 className="modal-title">Export Data</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label className="control-label">County</label>
                                        <select className="form-control" name="county" value={countyDl?.id ?? ''} onChange={ev => setCountyDl(counties.find(c => c.id == ev.target.value))}>
                                            <option value="">Select County</option>
                                            {counties.map(c => <option key={c.id} value={c.id}>{c.odk_unit_name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default pull-left" data-dismiss="modal">Cancel</button>
                                    <button type="button" disabled={isDownloading} className="btn btn-success" onClick={async () => {
                                        if (!countyDl) return;
                                        setIsDownloading(true);
                                        try {
                                            const result = await FetchHTSSubmissions([countyDl], [], '', '', 1, 5000);
                                            if (result.status === 200 && result.data?.result?.length > 0) {
                                                exportToExcel(odkData, (countyDl?.odk_unit_name || 'RTCQI') + ' submissions ' + new Date().toLocaleString());
                                            }
                                        } catch {}
                                        setIsDownloading(false);
                                    }}>
                                        {isDownloading ? 'Downloading...' : <span><i className="fa fa-download"></i> Download data</span>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="pagination" style={{ marginTop: '2em' }}>
                        <Pagination itemClass="page-item" linkClass="page-link" activePage={page} itemsCountPerPage={perPage} totalItemsCount={total || 100} pageRangeDisplayed={5} onChange={handlePageChange} />
                    </div>
                    <div className="table-responsive">
                        <table className="table table-striped table-condensed">
                            <thead>
                                <tr>
                                    {headers.slice(0, 8).map((header, i) => (
                                        <th key={i} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap', border: '1px solid #ccd6e3' }}>
                                            {header.replace('mysites_', '').replace('_', ' ').replace('-', ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {odkData.map((dt, indx) => (
                                    <tr key={indx + '_'}>
                                        {headers.slice(0, 8).map((header, i) => (
                                            <td key={i} style={i >= 2 ? { border: '1px solid #ccd6e3' } : {}}>
                                                {i < 2 ? new Date(dt[header]).toLocaleString() : dt[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination">
                        <Pagination itemClass="page-item" linkClass="page-link" activePage={page} itemsCountPerPage={perPage} totalItemsCount={total} pageRangeDisplayed={5} onChange={handlePageChange} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default SubmissionsReport;

const el = document.getElementById('SubmissionsReport');
if (el) ReactDOM.createRoot(el).render(<SubmissionsReport />);

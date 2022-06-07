import React from 'react';
import ReactDOM from 'react-dom';

import { FetchOrgunits, exportToExcel, FetchUserAuthorities, FetchOdkHTSData, separateOrgUnitAndSite, FetchSubmissions } from '../../utils/Helpers'
import 'jspdf-autotable'
import Pagination from 'react-js-pagination';
import OrgUnitType from '../../utils/orgunit/OrgUnitType';
import OrgUnitButton from '../../utils/orgunit/orgunit_button';
import OrgDate from '../../utils/orgunit/OrgDate';


class SubmissionsReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],
            auths: [],
            orgUnitDataIds: ['0'],
            pickedOU: [0],
            siteType: [],
            siteTypes: [],
            odkData: [],
            headers: [],
            startDate : '',
            endDate: '',
            total: 0,
            perPage: 50,
            totalPages: 1,
            page: 1,
            echartsMinHeight: '',
            orgUnitIndicators: [
                'Site agreement Rates',
                'Positive concordance rate',
                'Completeness rate',
                'Consistency rate',
                'Invalid rate',
                'Supervisory Signature rate',
                'Algorithm Followed rate',
                'Sites using eHTS register',
            ],
            indicatorIndexToDisplay: 0,
        }
        this.fetchOdkDataServer = this.fetchOdkDataServer.bind(this);
        this.orgUnitChangeHandler = this.orgUnitChangeHandler.bind(this);
        this.siteTypeChangeHandler = this.siteTypeChangeHandler.bind(this);
        this.orgDateChangeHandler = this.orgDateChangeHandler.bind(this);
        this.onFilter = this.onFilter.bind(this);
        this.onReset = this.onReset.bind(this);
    }

    componentDidMount() {
        (async () => {
            let returnedData = await FetchOrgunits();
            let defaultOU = returnedData.payload[0].slice(0, 1)
            this.setState({
                odkData: [],
                orgLevel: 1,
                orgId: 1,
                orgUnitDataIds: defaultOU,
                orgUnits: returnedData.payload[0],
                startDate: '',
                endDate: ''
            });

            this.fetchOdkDataServer(
                defaultOU,
                this.state.siteType,
                this.state.startDate,
                this.state.endDate
            );

            FetchUserAuthorities().then((auths) => {
                this.setState({ auths: auths });
            }).catch((err) => {
                console.log(err);
            })

        })();

    }

    orgUnitChangeHandler(ou) {
        // console.log('org unit changed: ' + JSON.stringify(ou));
        // console.log('allOrgs', this.state.orgUnits)
        this.setState({
            orgUnitDataIds: this.state.orgUnits.filter((org) => {
                return ou.includes(org['org_unit_id']);
            })
        });
    }

    siteTypeChangeHandler(siteType) {
        console.log('site type changed: ' + siteType);
        this.setState({
            siteType: siteType
        });
    }

    orgDateChangeHandler(startDate, endDate) {
        this.setState({
            startDate: startDate,
            endDate: endDate
        });
    }

    onFilter() {
        this.fetchOdkDataServer(
            this.state.orgUnitDataIds,
            // this.state.orgUnitTimeline,
            this.state.siteType,
            this.state.startDate,
            this.state.endDate,
            this.state.page || 1,
            this.state.perPage || 50
        );
    }

    onReset() {
        this.setState({
            orgUnitDataIds: ['0'],
            siteType: [],
            startDate: '',
            endDate: '',
            page: 1,
            perPage: 50,
        })
        this.fetchOdkDataServer(
            this.state.orgUnits[0],
            [],
            '',
            '',
            1,
            50
        );
    }

    fetchOdkDataServer(orgUnitIds, siteType, startDate, endDate, page, perpage) {
        // console.log('fetching odk data page: ' + page + ' perpage: ' + perpage);
        let pg = page || 1;
        let ppg = perpage || 50;
        if (orgUnitIds) {
            if (orgUnitIds.length != 0) {
                (async () => {
                    let returnedData = await FetchSubmissions(orgUnitIds, siteType, startDate, endDate, pg, ppg);
                    if (returnedData.status == 200) {
                        this.setState({
                            odkData: returnedData.data?.result,
                            headers: returnedData.data?.headers,
                            page: returnedData.data?.page || 1,
                            total: returnedData.data?.total || 0,
                            perPage: returnedData.data?.perPage || 0,
                            totalPages: returnedData.data?.totalPages || 0,
                            // siteType: Array.from(new Set(Array.from(returnedData.data?.result, (x) => x['mysites']))),
                        });
                        // console.log(Object.values(returnedData.data?.result));
                    }
                })();
            }
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
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Submissions</h1>
                    <span>{Intl.NumberFormat().format(this.state.total || 0)} records</span>
                </div>

                {/* Filter bar */}
                <div className="row">
                    {/* <div className="col-sm-12  col-lg-2 col-md-4 mb-sm-1 mb-1">
                        <select className='form-control'>
                            <option>All</option>
                            <option>SPI</option>
                            <option>HTS</option>
                        </select>
                    </div> */}

                    <div className="col-sm-12  col-lg-2 col-md-4 mb-sm-1 mb-1">
                        <OrgUnitButton orgUnitChangeHandler={this.orgUnitChangeHandler}></OrgUnitButton>
                    </div>

                    {/* <div className="col-sm-12   col-lg-2  col-md-4 mb-sm-1 mb-1">
                        <OrgUnitType orgUnitTypeChangeHandler={this.siteTypeChangeHandler}></OrgUnitType>
                    </div> */}

                    <div className="col-sm-12 col-lg-4 col-md-4 mb-sm-1 mb-1">
                        <OrgDate orgDateChangeHandler={this.orgDateChangeHandler}></OrgDate>
                    </div>

                    <div className="col-sm-12  col-lg-4 col-md-4 mb-sm-1 mb-1">
                        <button
                            onClick={() => {
                                console.log('Filter')
                                this.onFilter();
                            }}
                            type="button"
                            style={{ "display": "inlineBlock", marginRight: "7px" }}
                            className="btn btn-sm btn-primary font-weight-bold mr-2">Filter
                        </button>
                        <button
                            onClick={() => {
                                console.log('Reset filters')
                                // this.onReset();
                                if(window && window.location) {
                                    window.location.reload();
                                }
                            }}
                            type="button"
                            style={{ "display": "inlineBlock", marginRight: "7px" }}
                            className="btn btn-sm btn-secondary font-weight-bold">Reset
                        </button>
                        <button
                            disabled={!this.state.odkData || this.state.odkData.length == 0}
                            onClick={() => {
                                console.log('Export')
                                exportToExcel(this.state.odkData, 'Submissions '+new Date().toLocaleString())
                            }}
                            type="button"
                            style={{ "display": "inlineBlock", marginRight: "7px" }}
                            className={"btn btn-sm btn-success font-weight-bold "+(!this.state.odkData || this.state.odkData.length == 0 ? "hidden" : "")}>Download
                        </button>
                    </div>


                </div>
                {/* end filter bar */}

                <div className="row">
                    <div className="col-md-12">
                        {/* <div className="col-md-12" style={{ backgroundColor: '#fff', color: 'black', padding: '7px', borderRadius: '6px', margin: '2em auto' }}>
                            <small>
                                <details>
                                    <summary>this.state.orgUnits</summary>
                                    <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                                        <pre>
                                            {JSON.stringify(this.state.orgUnits, null, 1)}
                                        </pre>
                                    </div>
                                </details>
                            </small><br />
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
                            <small>
                                <details>
                                    <summary>this.state.siteType</summary>
                                    <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                                        <pre>
                                            {JSON.stringify(this.state.siteType, null, 1)}
                                        </pre>
                                    </div>
                                </details>
                            </small><br />
                        </div> */}
                        <div className="table-responsive">
                            <div className="pagination " style={{ marginTop: '2em' }}>
                                <Pagination
                                    itemClass="page-item"
                                    linkClass="page-link"
                                    activePage={this.state.page || 1}
                                    itemsCountPerPage={this.state.perPage || 50}
                                    totalItemsCount={this.state.total || 100}
                                    pageRangeDisplayed={5}
                                    onChange={(page) => {
                                        this.setState({ page: page })
                                        // FetchSubmissions()
                                        console.log('fetching page', page)
                                        this.fetchOdkDataServer(this.state.orgUnitDataIds,
                                            this.state.siteType,
                                            this.state.startDate,
                                            this.state.endDate,
                                            page,
                                            this.state.perPage || 50
                                        );
                                    }} />
                            </div>
                            <table className='table table-striped table-condensed'>
                                <thead>
                                    <tr>
                                        {this.state.headers.map((header, index) => {
                                            return <th key={index} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap', border: '1px solid #ccd6e3' }}>{header.replace('mysites_', '').replace('_', ' ').replace('-', ' ')}</th>
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.odkData.map((dt, indx) => {
                                        return <React.Fragment key={indx + "_"}>
                                            {/* <tr>
                                                <td colSpan={this.state.headers.length}>{ou}</td>
                                            </tr>
                                            {Object.keys(dt).map((row, ky) => <tr key={ky}>
                                                {this.state.headers.map((header, index) => {
                                                    return <td key={index}>{dt[header]}</td>
                                                })}
                                            </tr>)} */}
                                            <tr>
                                                {this.state.headers.map((header, index) => {
                                                    if (index < 2) {
                                                        return <td key={index}>{new Date(dt[header]).toLocaleString()}</td>
                                                    }
                                                    return <td key={index} style={{ border: '1px solid #ccd6e3' }}>{dt[header]}</td>
                                                })}
                                            </tr>
                                        </React.Fragment>
                                    })}
                                </tbody>
                            </table>
                            <div className="pagination ">
                                <Pagination
                                    itemClass="page-item"
                                    linkClass="page-link"
                                    activePage={this.state.page || 1}
                                    itemsCountPerPage={this.state.perPage || 50}
                                    totalItemsCount={this.state.total || 0}
                                    pageRangeDisplayed={5}
                                    onChange={(page) => {
                                        this.setState({ page: page })
                                        // FetchSubmissions()
                                        console.log('fetching page', page)
                                        this.fetchOdkDataServer(returnedData.payload[0].slice(0, 1),
                                            this.state.siteType,
                                            this.state.startDate,
                                            this.state.endDate,
                                            page,
                                            this.state.perPage || 50
                                        );
                                    }} />
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default SubmissionsReport;


if (document.getElementById('SubmissionsReport')) {
    let domValues = [];
    let domValuesMap = {};
    domValues.forEach(element => {
        for (const property in element) {
            domValuesMap[property] = element[property];
        }
    });

    const props = Object.assign({}, domValuesMap);
    ReactDOM.render(<SubmissionsReport {...props} />, document.getElementById('SubmissionsReport'));
}
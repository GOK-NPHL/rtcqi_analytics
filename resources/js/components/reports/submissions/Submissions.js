import React from 'react';
import ReactDOM from 'react-dom';

import { FetchOrgunits, FetchOdkHTSData, separateOrgUnitAndSite, exportToExcel, FetchSubmissions } from '../../utils/Helpers'
import 'jspdf-autotable'
import Pagination from 'react-js-pagination';


class SubmissionsReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],
            orgUnitDataIds: ['0'],
            siteType: [],
            odkData: [],
            headers: [],
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
    }

    componentDidMount() {
        (async () => {
            let returnedData = await FetchOrgunits();

            let subCountyList = [];
            // returnedData.forEach((val) => {
            // });
            let defaultOrg = [returnedData.payload[0][0]['org_unit_id']]; //get first orgunit of in list of authorized orgs
            this.setState({
                odkData: [],
                orgLevel: 1,
                orgId: 1,
                orgUnitDataIds: returnedData.payload[0].slice(0, 1), //[defaultOrg[0]],
                startDate: '',
                endDate: ''
            });

            this.fetchOdkDataServer(returnedData.payload[0].slice(0, 1),
                this.state.siteType,
                this.state.startDate,
                this.state.endDate
            );

        })();

    }

    fetchOdkDataServer(orgUnitIds, siteType, startDate, endDate, page, perpage) {
        console.log('fetching odk data page: ' + page + ' perpage: ' + perpage);
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
                    <div className="col-sm-12  col-lg-2 col-md-4 mb-sm-1 mb-1">
                        <select className='form-control'>
                            <option>All</option>
                            <option>SPI</option>
                            <option>HTS</option>
                        </select>
                    </div>

                    <div className="col-sm-12  col-lg-2 col-md-4 mb-sm-1 mb-1">
                        <select className='form-control'>
                            <option>All counties</option>
                            <option>Baringo county</option>
                        </select>
                    </div>

                    <div className="col-sm-12   col-lg-2  col-md-4 mb-sm-1 mb-1">
                        <select className='form-control'>
                            <option>All sites</option>
                            <option>CCC</option>
                            <option>Laboratory</option>
                        </select>
                    </div>

                    <div className="col-sm-12 col-lg-4 col-md-6 mb-sm-1 mb-1">
                        <input className='form-control' type='date' placeholder='Date' />
                    </div>

                    <div className="col-sm-12  col-lg-2 col-md-4 mb-sm-1 mb-1">
                        <button
                            onClick={() => {
                                console.log('Filter')
                            }}
                            type="button"
                            style={{ "display": "inlineBlock" }}
                            className="btn btn-sm btn-primary font-weight-bold mr-2">Filter
                        </button>
                        <button
                            onClick={() => {
                                console.log('Reset filters')
                            }}
                            type="button"
                            style={{ "display": "inlineBlock" }}
                            className="btn btn-sm btn-secondary font-weight-bold">Reset
                        </button>
                    </div>


                </div>
                {/* end filter bar */}

                <div className="row">
                    <div className="col-md-12">
                        {/* <div className="col-md-12" style={{ backgroundColor: '#fff', color: 'black', padding: '7px', borderRadius: '6px', margin: '2em auto' }}><small>
                            <details open>
                                <summary>this.state.odkData</summary>
                                <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                                    <pre>
                                        {JSON.stringify(this.state.odkData, null, 1)}
                                    </pre>
                                </div>
                            </details></small>
                        </div> */}
                        <div className="table-responsive">
                        <div className="pagination " style={{marginTop: '2em'}}>
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
                                    } } />
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
                                        return <React.Fragment key={indx+"_"}>
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
                                                    if(index < 2){
                                                        return <td key={index}>{new Date(dt[header]).toLocaleString()}</td>
                                                    }
                                                    return <td key={index} style={{border: '1px solid #ccd6e3'}}>{dt[header]}</td>
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
                                    } } />
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
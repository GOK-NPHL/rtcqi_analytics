import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../../utils/charts/LineGraph';
import StackedHorizontal from '../../utils/charts/StackedHorizontal'

import { FetchOrgunits, exportToExcel, FetchPartners, FetchSPISubmissions } from '../../utils/Helpers'
import OrgUnitButton from '../../utils/orgunit/orgunit_button';
import OrgDate from '../../utils/orgunit/OrgDate';
import { v4 as uuidv4 } from 'uuid';
import OrgTimeline from '../../utils/orgunit/OrgTimeline';
import OrgUnitType from '../../utils/orgunit/OrgUnitType';

import { CSVLink, CSVDownload } from "react-csv";
import jsPDF from 'jspdf'
import 'jspdf-autotable'

import Pagination from 'react-js-pagination';

class SPISubmissions extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            counties: [],
            orgUnits: [],
            orgUnitDataIds: [0],
            partners: [],
            orgUnitTimeline: [],
            siteType: [],
            echartsMinHeight: '',
            orgUnitIndicators: [
                'Average Performance per QA element',
                'Overall Site Levels during Assessment',
            ],
            indicatorIndexToDisplay: 0,
            allPartners: [],
            //
            countyDl: null,
            isDownloading: false,
            auths: [],
            pickedOU: [0],
            siteTypes: [],
            odkData: [],
            headers: [],
            startDate: '',
            endDate: '',
            total: 0,
            perPage: 100,
            totalPages: 1,
            page: 1,
            //
        }
        this.fetchOdkDataServer = this.fetchOdkDataServer.bind(this);
        this.onOrgTimelineChange = this.onOrgTimelineChange.bind(this);
        this.orgUnitChangeHandler = this.orgUnitChangeHandler.bind(this);
        this.onFilterButtonClickEvent = this.onFilterButtonClickEvent.bind(this);
        this.orgUnitTypeChangeHandler = this.orgUnitTypeChangeHandler.bind(this);
        this.orgDateChangeHandler = this.orgDateChangeHandler.bind(this);
        this.filterDisplayedIndicator = this.filterDisplayedIndicator.bind(this);
        this.fetchAllPartners = this.fetchAllPartners.bind(this);
    }

    // componentDidMount() {
    //     //fetch counties

    // }


    fetchAllPartners() {
        (async () => {
            let returnedData = await FetchPartners();
            // console.log('partners', returnedData)
            this.setState({
                allPartners: returnedData,
            });
        })();
    }

    componentDidMount() {
        (async () => {
            let returnedData = await FetchOrgunits();
            // console.log('orgunits', returnedData)

            let defaultOrg = [returnedData.payload[0][0]['org_unit_id']] || [0];
            this.setState({
                unfilteredOrgUnits: returnedData,
                orgUnits: returnedData.payload[0],
                odkData: {},
                orgLevel: 1,
                partners: [],
                orgId: 1,
                orgUnitDataIds: [defaultOrg[0]],
                orgUnitTimeline: [],
                startDate: '',
                endDate: '',
                counties: returnedData.payload[0].filter((org) => org.level === 2)
            });

            this.fetchOdkDataServer(
                defaultOrg,
                this.state.orgUnitTimeline,
                this.state.siteType,
                this.state.partners,
                this.state.startDate,
                this.state.endDate,
                this.state.page,
                this.state.perPage,
            );
            this.fetchAllPartners();


        })();


    }

    fetchOdkDataServer(orgUnitIds, orgTimeline, siteType, partners, startDate, endDate, page, perPage) {
        if (orgUnitIds) {
            if (orgUnitIds.length != 0) {
                (async () => {
                    let returnedData = await FetchSPISubmissions(orgUnitIds, orgTimeline, siteType, partners, startDate, endDate, page, perPage)
                    // console.log('odk data', returnedData)
                    // set loading state to false
                    this.setState({
                        loading: false
                    });
                    if (returnedData.status == 200) {
                        this.setState({
                            // odkData: returnedData.data,
                            odkData: returnedData.data?.result,
                            headers: returnedData.data?.headers,
                            page: returnedData.data?.page || 1,
                            total: returnedData.data?.total || 0,
                            perPage: returnedData.data?.perPage || 0,
                            totalPages: returnedData.data?.totalPages || 0,
                        });
                    }
                })();
            }
        }

    }

    onOrgTimelineChange(orgTimeline) {
        this.setState({
            orgUnitTimeline: orgTimeline
        });
    }

    orgUnitChangeHandler(orgUnitIds) {
        this.setState({
            orgUnitDataIds: orgUnitIds
        });
    }

    orgUnitTypeChangeHandler(siteType) {
        this.setState({
            siteType: siteType
        });
    }

    filterDisplayedIndicator(indicatorIndex) {
        this.setState({ indicatorIndexToDisplay: indicatorIndex });
    }

    orgDateChangeHandler(startDate, endDate) {
        this.setState({
            startDate: startDate,
            endDate: endDate
        });
    }

    onFilterButtonClickEvent() {
        this.fetchOdkDataServer(
            this.state.orgUnitDataIds,
            this.state.orgUnitTimeline,
            this.state.siteType,
            this.state.partners,
            this.state.startDate,
            this.state.endDate,
            this.state.page,
            this.state.perPage
        );
    }


    resetFilters() {
        location.reload();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.state.orgUnitDataIds != nextState.orgUnitDataIds ||
            this.state.orgUnitTimeline != nextState.orgUnitTimeline ||
            this.state.siteType != nextState.siteType ||
            this.state.startDate != nextState.startDate ||
            this.state.endDate != nextState.endDate ||
            this.state.echartsMinHeight !== nextState.echartsMinHeight
        ) {
            return false;
        } else {
            return true;
        }
    }



    render() {

        return (

            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">SPI Submissions</h1>
                    <span>{Intl.NumberFormat().format(this.state.total || 0)} records</span>
                </div>

                {/* Filter bar */}
                <div className="row">

                    <div className="col-sm-12  col-lg-3 col-md-3 mb-sm-1 mb-1">
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
                                if (window && window.location) {
                                    window.location.reload();
                                }
                            }}
                            type="button"
                            style={{ "display": "inlineBlock", marginRight: "7px" }}
                            className="btn btn-sm btn-secondary font-weight-bold">Reset
                        </button>
                        {/* <button
                            disabled={!this.state.odkData || this.state.odkData.length == 0}
                            onClick={() => {
                                console.log('Export')
                                exportToExcel(this.state.odkData, 'Submissions '+new Date().toLocaleString())
                            }}
                            type="button"
                            style={{ "display": "inlineBlock", marginRight: "7px" }}
                            className={"btn btn-sm btn-success font-weight-bold "+(!this.state.odkData || this.state.odkData.length == 0 ? "hidden" : "")}>Download
                        </button> */}


                        <>

                            <a className="btn btn-primary ml-4" data-toggle="modal" href='#exportDataModal'>Export data</a>
                            <div className="modal fade" id="exportDataModal">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <h5 className="modal-title">Export Data</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                                        </div>
                                        <div className="modal-body">
                                            <div className='row'>
                                                {/* <div className='col-md-12'>
                                                <button
                                                    disabled={!this.state.odkData || this.state.odkData.length == 0}
                                                    onClick={() => {
                                                        console.log('Export')
                                                        exportToExcel(this.state.odkData, 'Submissions ' + new Date().toLocaleString())
                                                    }}
                                                    type="button"
                                                    style={{ "display": "inlineBlock", marginRight: "7px" }}
                                                    className={"btn btn-sm btn-success font-weight-bold " + (!this.state.odkData || this.state.odkData.length == 0 ? "hidden" : "")}>Download
                                                </button>
                                            </div> */}
                                                <div className='col-md-12'>
                                                    <div className='form-group'>
                                                        <label className='control-label'>County</label>
                                                        <select className='form-control' name='county' value={this.state.countyDl ? (this.state.countyDl?.id ? this.state.countyDl?.id : "") : ""} onChange={ev => {
                                                            this.setState({
                                                                countyDl: this.state.counties.find(county => county.id == ev.target.value)
                                                            })
                                                        }}>
                                                            <option value=''>Select County</option>
                                                            {this.state.counties.map(county => <option key={county.id} value={county.id}>{county.odk_unit_name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                {/* <div className='col-md-12'>
                                                    <div className='form-group'>
                                                        <label className='control-label'>Partner</label>
                                                        <select className='form-control' name='partner' value={this.state.partner} onChange={this.handlePartnerChange}>
                                                            <option value=''>Select Partner</option>
                                                            {this.state.partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-default pull-left" data-dismiss="modal">Cancel</button>
                                            <button type="button" disabled={this.state.isDownloading} className="btn btn-success" onClick={ev => {
                                                this.setState({
                                                    isDownloading: true
                                                })
                                                if (this.state.countyDl) {
                                                    FetchSPISubmissions([this.state.countyDl], [], "", "", 1, 5000).then(returnedData => {
                                                        if (returnedData.status == 200) {
                                                            // console.log("Data2DL:: ", Object.keys(returnedData?.data?.result[0]));
                                                            let results = returnedData?.data?.result;
                                                            if (results && results.length > 0) exportToExcel(this.state.odkData, (this.state.countyDl?.odk_unit_name || "RTCQI") + ' submissions ' + new Date().toLocaleString())
                                                        } else {
                                                            console.log("Error:: ", returnedData);
                                                        }
                                                        this.setState({
                                                            isDownloading: false
                                                        })
                                                    }).catch(err => {
                                                        console.log("Error:: ", err);
                                                        this.setState({
                                                            isDownloading: false
                                                        })
                                                    })
                                                }
                                            }}>
                                                {this.state.isDownloading ? "Downloading..." : <span><i className='fa fa-download'></i> Download data</span>}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    </div>


                </div>
                {/* end filter bar */}

                <div className="row">
                    <div className="col-md-12">
                        {/* <div className="col-md-12" style={{ backgroundColor: '#fff', color: 'black', padding: '7px', borderRadius: '6px', margin: '20px auto' }}>
                            <small>
                                <details>
                                    <summary>this.state.odkData</summary>
                                    <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                                        <pre>
                                            {JSON.stringify(this.state.odkData, null, 1)}
                                        </pre>
                                    </div>
                                </details>
                            </small>
                        </div> */}
                        <div className="pagination " style={{ marginTop: '2em' }}>
                            <Pagination
                                itemClass="page-item"
                                linkClass="page-link"
                                activePage={this.state.page || 1}
                                itemsCountPerPage={this.state.perPage || 100}
                                totalItemsCount={this.state.total || 100}
                                pageRangeDisplayed={5}
                                onChange={(page) => {
                                    this.setState({ page: page })
                                    // FetchSPISubmissions()
                                    console.log('fetching page', page)
                                    this.fetchOdkDataServer(this.state.orgUnitDataIds,
                                        this.state.siteType,
                                        this.state.startDate,
                                        this.state.endDate,
                                        page,
                                        this.state.perPage || 100
                                    );
                                }} />
                        </div>
                        <div className="table-responsive">
                            <table className='table table-striped table-condensed'>
                                <thead>
                                    <tr>
                                        {this.state.headers
                                            .slice(0, 8)
                                            .map((header, index) => {
                                                return <th key={index} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap', border: '1px solid #ccd6e3' }}>{header.replace('mysites_', '').replace('_', ' ').replace('-', ' ')}</th>
                                            })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.odkData && this.state.odkData.length > 0 ? this.state.odkData.map((dt, indx) => {
                                        return <React.Fragment key={indx + "_"}>
                                            <tr>
                                                {this.state.headers
                                                    .slice(0, 8)
                                                    .map((header, index) => {
                                                        if (index < 2) {
                                                            return <td key={index}>{new Date(dt[header]).toLocaleString()}</td>
                                                        }
                                                        return <td key={index} style={{ border: '1px solid #ccd6e3' }}>{dt[header]}</td>
                                                    })}
                                            </tr>
                                        </React.Fragment>
                                    }) : <tr><td colSpan={this.state.headers.length} style={{ textAlign: 'center' }}>
                                        {this.state.loading ? <div className='text-center'><i className='fa fa-spin fa-refresh'></i> Loading...</div> : <div className='text-center'>No data found</div>}
                                    </td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="pagination ">
                            <Pagination
                                itemClass="page-item"
                                linkClass="page-link"
                                activePage={this.state.page || 1}
                                itemsCountPerPage={this.state.perPage || 100}
                                totalItemsCount={this.state.total || 0}
                                pageRangeDisplayed={5}
                                onChange={(page) => {
                                    this.setState({ page: page })
                                    // FetchSPISubmissions()
                                    console.log('fetching page', page)
                                    this.fetchOdkDataServer(returnedData.payload[0].slice(0, 1),
                                        this.state.siteType,
                                        this.state.startDate,
                                        this.state.endDate,
                                        page,
                                        this.state.perPage || 100
                                    );
                                }} />
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default SPISubmissions;



if (document.getElementById('SPISubmissions')) {
    let domValues = [];
    let domValuesMap = {};
    domValues.forEach(element => {
        for (const property in element) {
            domValuesMap[property] = element[property];
        }
    });

    const props = Object.assign({}, domValuesMap);
    ReactDOM.render(<SPISubmissions {...props} />, document.getElementById('SPISubmissions'));
}

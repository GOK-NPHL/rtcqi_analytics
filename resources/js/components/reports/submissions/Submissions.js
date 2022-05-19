import React from 'react';
import ReactDOM from 'react-dom';

import { FetchOrgunits, FetchOdkHTSData, separateOrgUnitAndSite, exportToExcel } from '../../utils/Helpers'
import 'jspdf-autotable'


class SubmissionsReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],
            orgUnitDataIds: [0],
            siteType: [],
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
        //fetch counties
    }

    componentDidMount() {
        (async () => {
            let returnedData = await FetchOrgunits();

            let subCountyList = [];
            // returnedData.forEach((val) => {
            // });
            let defaultOrg = [returnedData.payload[0][0]['org_unit_id']];//get first orgunit of in list of authorized orgs
            this.setState({
                odkData: {},
                orgLevel: 1,
                orgId: 1,
                orgUnitDataIds: [defaultOrg[0]],
                startDate: '',
                endDate: ''
            });

            this.fetchOdkDataServer(defaultOrg,
                this.state.siteType,
                this.state.startDate,
                this.state.endDate
            );

        })();

    }

    fetchOdkDataServer(orgUnitIds, siteType, startDate, endDate) {
        if (orgUnitIds) {
            if (orgUnitIds.length != 0) {
                (async () => {
                    let returnedData = await FetchOdkHTSData(orgUnitIds, siteType, startDate, endDate);
                    if (returnedData.status == 200) {
                        this.setState({
                            odkData: returnedData.data,
                        });
                    }

                })();
            }
        }

    }

    shouldComponentUpdate(nextProps, nextState) {
        return false
    }


    render() {

        return (

            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Submissions</h1>
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
                        <div className="table-responsive">
                            <table className='table table-striped table-condensed'>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>County</th>
                                        <th>Subcounty</th>
                                        <th>Facility</th>
                                        <th>Site</th>
                                        <th>A</th>
                                        <th>B</th>
                                        <th>C</th>
                                        <th>D</th>
                                        <th>E</th>
                                        <th>F</th>
                                        <th>G</th>
                                        <th>H</th>
                                        <th>I</th>
                                        <th>J</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                    <tr>
                                        <td>{new Date().toDateString()}</td>
                                        <td>Baringo county</td>
                                        <td>Tenges sub-county</td>
                                        <td>100020 - Tenges AIC Mission Hospital</td>
                                        <td>PMTCT</td>
                                        <td>{Math.floor(Math.random() * 10)}</td>
                                        <td>{Math.floor(Math.random() * 75)}</td>
                                        <td>{Math.floor(Math.random() * 68)}</td>
                                        <td>{Math.floor(Math.random() * 32)}</td>
                                        <td>{Math.floor(Math.random() * 24)}</td>
                                        <td>{Math.floor(Math.random() * 28)}</td>
                                        <td>{Math.floor(Math.random() * 74)}</td>
                                        <td>{Math.floor(Math.random() * 4)}</td>
                                        <td>{Math.floor(Math.random() * 17)}</td>
                                        <td>{Math.floor(Math.random() * 51)}</td>
                                    </tr>
                                </tbody>
                            </table>
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
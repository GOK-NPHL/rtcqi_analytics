import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../../utils/charts/LineGraph';
import StackedHorizontal from '../../utils/charts/StackedHorizontal'

import { FetchOrgunits, FetchOdkHTSData } from '../../utils/Helpers'
import OrgUnitButton from '../../utils/orgunit/orgunit_button';
import OrgDate from '../../utils/orgunit/OrgDate';
import { v4 as uuidv4 } from 'uuid';
import OrgUnitType from '../../utils/orgunit/OrgUnitType';
import AgreementRateColumnCharts from './AgreementRateColumnCharts';

class LogbookReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],
            orgUnitDataIds: [0],
            siteType: [],
            echartsMinHeight: '',
        }
        this.fetchOdkDataServer = this.fetchOdkDataServer.bind(this);
        this.orgUnitChangeHandler = this.orgUnitChangeHandler.bind(this);
        this.onFilterButtonClickEvent = this.onFilterButtonClickEvent.bind(this);
        this.orgUnitTypeChangeHandler = this.orgUnitTypeChangeHandler.bind(this);
        this.addTableRows = this.addTableRows.bind(this);
        this.orgDateChangeHandler = this.orgDateChangeHandler.bind(this);
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
            this.setState({
                unfilteredOrgUnits: returnedData,
                orgUnits: returnedData.payload[0],
                odkData: {},
                orgLevel: 1,
                orgId: 1,
                orgUnitDataIds: [0],
                startDate: '',
                endDate: ''
            });
            let defaultOrg = [returnedData.payload[0][0]['org_unit_id']];//get first orgunit of in list of authorized orgs
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

    orgDateChangeHandler(startDate, endDate) {
        this.setState({
            startDate: startDate,
            endDate: endDate
        });
    }

    onFilterButtonClickEvent() {
        this.fetchOdkDataServer(
            this.state.orgUnitDataIds,
            this.state.siteType,
            this.state.startDate,
            this.state.endDate
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.state.orgUnitDataIds != nextState.orgUnitDataIds ||
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

    addTableRows(tableData, dataToParse) {

        tableData.push(
            <tr key={uuidv4()}>
                <td colSpan={4} scope="row">
                    <strong>{dataToParse.orgName.toUpperCase()}</strong>
                </td>
            </tr>);

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        for (let [period, totals] of Object.entries(dataToParse.overall_agreement_rate)) {

            let row = [];
            const d = new Date(period);

            row.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()} (N={totals['totals']['total_sites']})</td>);

            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    row.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                }
            }
            let percent1 = ((Number(totals['totals']["<95"]) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);
            let percent2 = ((Number(totals['totals']["95-98"]) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);
            let percent3 = ((Number(totals['totals'][">98"]) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);

            if (isNaN(percent1)) percent1 = 0;
            if (isNaN(percent2)) percent2 = 0;
            if (isNaN(percent3)) percent3 = 0;

            row.push(<td key={uuidv4()} scope="row">{percent1}</td>);
            row.push(<td key={uuidv4()} scope="row">{percent2}</td>);
            row.push(<td key={uuidv4()} scope="row">{percent3}</td>);
            tableData.push(<tr key={uuidv4()}>{row}</tr>);

        }

        return [tableData];
    }

    render() {

        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "10px"
        };

        let tableData = [];
        let tableHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">&#60;95%</th>
            <th scope="col">95-98%</th>
            <th scope="col">&#62;98%</th>

        </tr>;

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                tableHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">&#60;95%</th>
                    <th scope="col">95%-98%</th>
                    <th scope="col">&#62;98%</th>

                </tr>;
            }
        }

        if (this.state.odkData) {
            let displayData = this.state.odkData[0];
            for (let [key, payload] of Object.entries(displayData)) {
                [tableData] = this.addTableRows(tableData, payload);
            }
        }

        let tablesTab = <div className="col-sm-12  col-xm-12 col-md-12">
            <p style={{ fontWeight: "900" }}>Site agreement Rates</p>
            <table className="table table-responsive">
                <thead className="thead-dark">
                    {tableHeaders}
                </thead>
                <tbody>
                    {tableData}
                </tbody>
            </table>

            <br />

        </div>;

         let agreementRateColumnCharts = <AgreementRateColumnCharts  minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} />

        return (

            <React.Fragment>


                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Logbook REPORT</h1>
                    <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-download fa-sm text-white-50"></i> Generate Report</a>
                </div>

                <div className="row">

                    <div className="col-md-2">
                        <OrgUnitButton orgUnitChangeHandler={this.orgUnitChangeHandler}></OrgUnitButton>
                    </div>

                    <div className="col-md-2">
                        <OrgUnitType orgUnitTypeChangeHandler={this.orgUnitTypeChangeHandler}></OrgUnitType>
                    </div>

                    <div className="col-md-7">
                        <OrgDate orgDateChangeHandler={this.orgDateChangeHandler}></OrgDate>
                    </div>

                    <div className="col-md-1">
                        <button
                            onClick={() => this.onFilterButtonClickEvent()}
                            type="button"
                            className="btn btn-sm btn-info">
                            <i className="fa fa-search" aria-hidden="true"></i>
                        </button>
                    </div>

                </div>
                <br />
                <div style={rowStle} className="row">

                    <div className="col-sm-12  col-xm-12 col-md-12">
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <a className="nav-link active" id="tablesTab" data-toggle="tab" href="#tables" role="tab" aria-controls="home" aria-selected="true">
                                    <i className="fa fa-table" aria-hidden="true"></i> Tables</a>
                            </li>
                            <li className="nav-item" role="presentation">
                                <a className="nav-link" id="SiteColumnsTab" data-toggle="tab"
                                    href="#sitecolumns" role="tab" aria-controls="profile"
                                    aria-selected="false"
                                    onClick={() => {
                                        this.setState({
                                            echartsMinHeight: ""
                                        })
                                    }}
                                >
                                    <i className="fas fa-chart-bar"></i> Agreement rates bar</a>
                            </li>

                        </ul>
                        <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade show active" id="tables" role="tablesTab" aria-labelledby="home-tab">
                                <br />
                                {tablesTab}
                            </div>

                            <div className="tab-pane fade" id="sitecolumns" role="SiteColumnsTab" aria-labelledby="profile-tab">
                                <br />
                                <p style={{ fontWeight: "900" }}>Site agreement Rates</p>
                                {agreementRateColumnCharts}
                            </div>

                        </div>

                    </div>

                </div>
            </React.Fragment>
        );
    }

}

export default LogbookReport;

if (document.getElementById('LogbookReport')) {
    // find element by id
    let domValues = [];
    let domValuesMap = {};
    const dataChart1 = document.getElementById('data-chart1');
    const dataChart2 = document.getElementById('data-chart2');
    const dataChart3 = document.getElementById('data-chart3');
    const dataChart4 = document.getElementById('data-chart4');
    const dataChart5 = document.getElementById('data-chart5');
    const dataChart6 = document.getElementById('data-chart6');

    // create new props object with element's data-attributes
    // result: {chart1: "data"}
    domValues.push(dataChart1.dataset);
    domValues.push(dataChart2.dataset);
    domValues.push(dataChart3.dataset);
    domValues.push(dataChart4.dataset);
    domValues.push(dataChart5.dataset);
    domValues.push(dataChart6.dataset);
    // domValues.push({'f':10})
    domValues.forEach(element => {
        for (const property in element) {
            domValuesMap[property] = element[property];
        }
    });

    const props = Object.assign({}, domValuesMap);
    ReactDOM.render(<LogbookReport {...props} />, document.getElementById('LogbookReport'));
}
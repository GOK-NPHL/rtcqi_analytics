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

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { CSVLink, CSVDownload } from "react-csv";


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
        this.exportAgreementsRatesPDFData = this.exportAgreementsRatesPDFData.bind(this);

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

    addTableRows(tableData, dataToParse, tableDataExport, positiveConcordanceTableData, positiveConcordanceTableDataExport) {

        tableData.push(
            <tr key={uuidv4()}>
                <td colSpan={4} scope="row">
                    <strong>{dataToParse.orgName.toUpperCase()}</strong>
                </td>
            </tr>);
        tableDataExport.push([dataToParse.orgName.toUpperCase()]);

        positiveConcordanceTableData.push(
            <tr key={uuidv4()}>
                <td colSpan={2} scope="row">
                    <strong>{dataToParse.orgName.toUpperCase()}</strong>
                </td>
            </tr>);
        positiveConcordanceTableDataExport.push([dataToParse.orgName.toUpperCase()]);

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        for (let [period, totals] of Object.entries(dataToParse.overall_agreement_rate)) {

            let row = [];
            let exportData = [];
            const d = new Date(period);

            row.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()} (N={totals['totals']['total_sites']})</td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (N=" + totals['totals']['total_sites'] + ")"
            exportData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    row.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    exportData.push(dataToParse['OrgUniType']);
                }
            }
            let percent1 = ((Number(totals['totals']["<95"]) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);
            let percent2 = ((Number(totals['totals']["95-98"]) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);
            let percent3 = ((Number(totals['totals'][">98"]) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);

            if (isNaN(percent1)) percent1 = 0;
            if (isNaN(percent2)) percent2 = 0;
            if (isNaN(percent3)) percent3 = 0;

            row.push(<td key={uuidv4()} scope="row">{percent1}</td>);
            exportData.push(percent1);
            row.push(<td key={uuidv4()} scope="row">{percent2}</td>);
            exportData.push(percent2);
            row.push(<td key={uuidv4()} scope="row">{percent3}</td>);
            exportData.push(percent3);

            tableData.push(<tr key={uuidv4()}>{row}</tr>);
            tableDataExport.push(exportData);
        }

        // positive concordance data loop
        for (let [period, totals] of Object.entries(dataToParse.overall_concordance_totals)) {

            let positiveConcordanceRow = [];
            let positiveConcordanceExportData = [];
            const d = new Date(period);
            let no = dataToParse.overall_agreement_rate[period]['totals']['total_sites'];
            positiveConcordanceRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()} (N={no})</td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (N=" + no + ")"
            positiveConcordanceExportData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    positiveConcordanceRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    positiveConcordanceExportData.push(dataToParse['OrgUniType']);
                }
            }

            positiveConcordanceRow.push(<td key={uuidv4()} scope="row">{totals}</td>);
            positiveConcordanceExportData.push(totals);

            positiveConcordanceTableData.push(<tr key={uuidv4()}>{positiveConcordanceRow}</tr>);

            positiveConcordanceTableDataExport.push(positiveConcordanceExportData);
        }
        // end positive concordance data loop


        return [tableData, tableDataExport, positiveConcordanceTableData, positiveConcordanceTableDataExport];
    }

    exportAgreementsRatesPDFData() {
        const doc = new jsPDF();
        doc.autoTable({ html: '#agreementRates' });
        doc.save('agreement_rates.pdf')
    }

    exportPositiveConcordancePDFData() {
        const doc = new jsPDF();
        doc.autoTable({ html: '#positiveConcordanceRates' });
        doc.save('positive_concordance_rates.pdf')
    }

    render() {

        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "10px"
        };
        // Site agreement Rates
        let tableData = [];
        let tableHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">&#60;95%</th>
            <th scope="col">95-98%</th>
            <th scope="col">&#62;98%</th>

        </tr>;

        let tableDataExport = [];

        tableDataExport.push(['___', '<95%', '95%-98%', '>98%'
        ]);
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
                tableDataExport = [];
                tableDataExport.push(['___', 'Programme', '<95%', '95%-98%', '>98%'
                ]);
            }

        }
        // End Site agreement Rates


        // Positive concordance rate
        let positiveConcordanceTableData = [];
        let positiveConcordanceTableHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">Positive concordance rate</th>

        </tr>;

        let positiveConcordanceTableDataExport = [];

        positiveConcordanceTableDataExport.push(['___', 'Positive concordance rate']);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                positiveConcordanceTableHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">Positive concordance rate</th>

                </tr>;
                positiveConcordanceTableDataExport = [];
                positiveConcordanceTableDataExport.push(['___', 'Programme', 'Positive concordance rate']);
            }

        }
        // End Site agreement Rates


        if (this.state.odkData) {

            this.state.odkData.map(displayData => {
                for (let [key, payload] of Object.entries(displayData)) {
                    console.log(displayData);
                    [tableData, tableDataExport, positiveConcordanceTableData, positiveConcordanceTableDataExport] = this.addTableRows(tableData, payload, tableDataExport, positiveConcordanceTableData, positiveConcordanceTableDataExport);
                }
            })

        }

        let tablesTab = <div className="col-sm-12  col-xm-12 col-md-12">
            <div className="row">
                <div className="col-sm-6  col-xm-6 col-md-6">
                    <p style={{ fontWeight: "900" }}>Site agreement Rates</p>
                </div>
                <div className="col-sm-3  col-xm-3 col-md-3">
                    <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={tableDataExport}> Csv</CSVLink>
                </div>
                <div className="col-sm-3  col-xm-3 col-md-3">
                    <span style={{ "color": "blue" }} onClick={() => this.exportAgreementsRatesPDFData()}><i className="fas fa-download"></i><strong> PDF</strong></span>
                </div>

            </div>

            <table id="agreementRates" className="table table-responsive">
                <thead className="thead-dark">
                    {tableHeaders}
                </thead>
                <tbody>
                    {tableData}
                </tbody>
            </table>

            <br />

            {/* Begin Positive concordance rate  */}
            <div className="row">
                <div className="col-sm-6  col-xm-6 col-md-6">
                    <p style={{ fontWeight: "900" }}>Positive concordance rate</p>

                </div>
                <div className="col-sm-3  col-xm-3 col-md-3">
                    <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={positiveConcordanceTableDataExport}> Csv</CSVLink>
                </div>
                <div className="col-sm-3  col-xm-3 col-md-3">
                    <span style={{ "color": "blue" }} onClick={() => this.exportPositiveConcordancePDFData()}><i className="fas fa-download"></i><strong> PDF</strong></span>
                </div>
            </div>

            <table id="positiveConcordanceRates" className="table table-responsive">
                <thead className="thead-dark">
                    {positiveConcordanceTableHeaders}
                </thead>
                <tbody>
                    {positiveConcordanceTableData}
                </tbody>
            </table>
            {/* End Positive concordance rate  */}

        </div>;

        let agreementRateColumnCharts = <AgreementRateColumnCharts minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} />

        return (

            <React.Fragment>


                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Logbook REPORT</h1>
                    {/* <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-download fa-sm text-white-50"></i> Generate Report</a> */}
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
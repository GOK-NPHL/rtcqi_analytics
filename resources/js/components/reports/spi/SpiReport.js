import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../../utils/charts/LineGraph';
import StackedHorizontal from '../../utils/charts/StackedHorizontal'

import { FetchOrgunits, FetchOdkData } from '../../utils/Helpers'
import OrgUnitButton from '../../utils/orgunit/orgunit_button';
import OrgDate from '../../utils/orgunit/OrgDate';
import { v4 as uuidv4 } from 'uuid';
import OrgTimeline from '../../utils/orgunit/OrgTimeline';
import OrgUnitType from '../../utils/orgunit/OrgUnitType';
import SiteLevelBarColumnCharts from './SiteLevelBarColumnCharts';
import OverallPerformanceRadar from './OverallPerformanceRadar';
import { CSVLink, CSVDownload } from "react-csv";
import jsPDF from 'jspdf'
import 'jspdf-autotable'

class SpiReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],
            orgUnitDataIds: [0],
            orgUnitTimeline: [],
            siteType: [],
            echartsMinHeight: '',
        }
        this.fetchOdkDataServer = this.fetchOdkDataServer.bind(this);
        this.onOrgTimelineChange = this.onOrgTimelineChange.bind(this);
        this.orgUnitChangeHandler = this.orgUnitChangeHandler.bind(this);
        this.onFilterButtonClickEvent = this.onFilterButtonClickEvent.bind(this);
        this.orgUnitTypeChangeHandler = this.orgUnitTypeChangeHandler.bind(this);
        this.getTimelineAndOrgunits = this.getTimelineAndOrgunits.bind(this);
        this.addTableRows = this.addTableRows.bind(this);
        this.orgDateChangeHandler = this.orgDateChangeHandler.bind(this);
        this.exportAveragePerformancePDFData = this.exportAveragePerformancePDFData.bind(this);
        
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
                orgUnitTimeline: [],
                startDate: '',
                endDate: ''
            });
            let defaultOrg = [returnedData.payload[0][0]['org_unit_id']];//get first orgunit of in list of authorized orgs
            this.fetchOdkDataServer(defaultOrg,
                this.state.orgUnitTimeline,
                this.state.siteType,
                this.state.startDate,
                this.state.endDate
            );

        })();


        //change echarts layout to allow graph to fit for spider charts only.
        let div = $("#spiders");

        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === "class") {
                    let attributeValue = $(mutation.target).prop(mutation.attributeName);

                    if (attributeValue.includes("show")) {

                        $(".echarts-for-react").css('min-height', '500px');
                    } else {
                        // alert(currMinHeightValue);
                        $(".echarts-for-react").css('min-height', '');
                        // $(".echarts-for-react").css('min-height', '');
                    }
                }
            });
        });

        observer.observe(div[0], {
            attributes: true
        });
    }

    fetchOdkDataServer(orgUnitIds, orgTimeline, siteType, startDate, endDate) {
        if (orgUnitIds) {
            if (orgUnitIds.length != 0) {
                (async () => {
                    let returnedData = await FetchOdkData(orgUnitIds, orgTimeline, siteType, startDate, endDate);
                    if (returnedData.status == 200) {
                        this.setState({
                            odkData: returnedData.data,
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
            this.state.startDate,
            this.state.endDate
        );
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

    getTimelineAndOrgunits(orgUnitSpiData) {
        let timeLines = [];
        let orgunitName = '';
        for (let [key, val] of Object.entries(orgUnitSpiData)) {
            if (key != "OverallSitesLevel" && key != 'orgName' && key != 'OrgUniType') {
                for (let [timeline, value] of Object.entries(val)) {
                    if (!timeLines.includes(timeline)) timeLines.push(timeline);
                }
            } else if (key == 'orgName') {
                orgunitName = val.toUpperCase();
            }
        }
        return [timeLines, orgunitName];
    }

    addTableRows(tableData, overaRowllSiteLevels, dataToParse, tableDataExport, tableOverallDataExport) {
        for (let [orgUnitId, orgUnitSpiData] of Object.entries(dataToParse)) {

            let [timeLines, orgunitName] = this.getTimelineAndOrgunits(orgUnitSpiData);
            tableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={4} scope="row">
                        <strong>{orgunitName}</strong>
                    </td>
                </tr>);

            tableDataExport.push([orgunitName, "", "", ""]);

            timeLines.map((timeline) => {
                let row = [];
                let exportRow = [];
                row.push(<td key={uuidv4()} scope="row">{timeline}</td>);
                exportRow.push(timeline);

                if (this.state.siteType != null) {
                    if (this.state.siteType.length != 0) {
                        row.push(<td key={uuidv4()} scope="row">{orgUnitSpiData['OrgUniType']}</td>);
                        exportRow.push(orgUnitSpiData['OrgUniType']);
                    }
                }

                for (let [indicator, data] of Object.entries(orgUnitSpiData)) {
                    if (indicator != 'orgName' && indicator != "OverallSitesLevel") {

                        row.push(<td key={uuidv4()} scope="row">{data[timeline]}</td>);
                        exportRow.push(data[timeline]);
                    }
                }
                tableDataExport.push(exportRow);
                tableData.push(<tr key={uuidv4()}>{row}</tr>);
            });

            //======= Add  overaRowllSiteLevels table data =====//
            overaRowllSiteLevels.push(
                <tr key={uuidv4()}>
                    <td colSpan={5} style={{ "wordWrap": "break-word", "maxWidth": "150px" }}>
                        <strong>{orgUnitSpiData['orgName'].toUpperCase()}</strong>
                    </td>
                </tr>);
            tableOverallDataExport.push([orgUnitSpiData['orgName'].toUpperCase(), "", "", ""]);

            timeLines.map((timeline) => {
                let row = [];
                let tableOverallDataExportRow = [];
                row.push(<td key={uuidv4()}>{timeline} (N={orgUnitSpiData["OverallSitesLevel"][timeline]['counter']})</td>);
                tableOverallDataExportRow.push(timeline);

                if (this.state.siteType != null) {
                    if (this.state.siteType.length != 0) {
                        row.push(<td key={uuidv4()} scope="row">{orgUnitSpiData['OrgUniType']}</td>);
                        tableOverallDataExportRow.push(orgUnitSpiData['OrgUniType']);
                    }
                }
                for (let [key, val] of Object.entries(orgUnitSpiData)) {
                    if (key == "OverallSitesLevel") {

                        let level0 = orgUnitSpiData["OverallSitesLevel"][timeline]['level0'];
                        let level1 = orgUnitSpiData["OverallSitesLevel"][timeline]['level1'];
                        let level2 = orgUnitSpiData["OverallSitesLevel"][timeline]['level2'];
                        let level3 = orgUnitSpiData["OverallSitesLevel"][timeline]['level3'];
                        let level4 = orgUnitSpiData["OverallSitesLevel"][timeline]['level4'];

                        row.push(<td key={uuidv4()}>{level0}</td>);
                        row.push(<td key={uuidv4()}>{level1}</td>);
                        row.push(<td key={uuidv4()}>{level2}</td>);
                        row.push(<td key={uuidv4()}>{level3}</td>);
                        row.push(<td key={uuidv4()}>{level4}</td>);

                        tableOverallDataExportRow.push(level0);
                        tableOverallDataExportRow.push(level1);
                        tableOverallDataExportRow.push(level2);
                        tableOverallDataExportRow.push(level3);
                        tableOverallDataExportRow.push(level4);
                    }

                }
                tableOverallDataExport.push(tableOverallDataExportRow);
                overaRowllSiteLevels.push(<tr key={uuidv4()}>{row}</tr>);
            });

        }
        return [tableData, overaRowllSiteLevels, tableDataExport, tableOverallDataExport];
    }

    exportAveragePerformancePDFData() {
        const doc = new jsPDF();
        doc.autoTable({ html: '#averagePerformance' });
        doc.save('Average_performance.pdf')
    }

    exportOverallSiteLevelsPDFData() {
        const doc = new jsPDF();
        doc.autoTable({ html: '#overallSiteLevelPerformance' });
        doc.save('Overall_Site_Levels.pdf')
    }
    
    render() {

        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "10px"
        };

        // var overallSiteLevels = [];
        let overaRowllSiteLevels = [];
        let tableData = [];
        let tableDataExport = [];
        let tableOverallDataExport = [];
        let tableHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">Personnel Training & Certification</th>
            <th scope="col">QA in Counselling</th>
            <th scope="col">Physical Facility</th>
            <th scope="col">Safety</th>
            <th scope="col">Pre-testing phase</th>
            <th scope="col">Testing Phase</th>
            <th scope="col">Post-testing Phase</th>
            <th scope="col">External Quality Assessment</th>
            <th scope="col">Overall Performance</th>
        </tr>;
        tableDataExport.push(['___', 'Personnel Training & Certification', 'QA in Counselling', 'Physical Facility',
            'Safety', 'Pre-testing phase', 'Testing Phase', 'Post-testing Phase', 'External Quality Assessment', 'Overall Performance'
        ]);
        let overallSitesHeaders = <tr>
            <th scope="col">___</th>
            <th scope="col">Level 0 (&lt;40%)</th>
            <th scope="col">Level 1 (40-59%)</th>
            <th scope="col">Level 2 (60-79%)</th>
            <th scope="col">Level 3 (80-89%)</th>
            <th scope="col">Level 4 (&gt;90%)</th>
        </tr>;
        tableOverallDataExport.push(['___', 'Level 0 (<40%)', 'Level 1 (40-59%)', 'Level 2 (60-79%)',
            'Level 3 (80-89%)', 'Level 4 (>90%)'
        ]);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                tableHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">Personnel Training & Certification</th>
                    <th scope="col">QA in Counselling</th>
                    <th scope="col">Physical Facility</th>
                    <th scope="col">Safety</th>
                    <th scope="col">Pre-testing phase</th>
                    <th scope="col">Testing Phase</th>
                    <th scope="col">Post-testing Phase</th>
                    <th scope="col">External Quality Assessment</th>
                    <th scope="col">Overall Performance</th>
                </tr>;
                tableDataExport = [];
                tableDataExport.push(['___', 'Programme', 'Personnel Training & Certification', 'QA in Counselling', 'Physical Facility',
                    'Safety', 'Pre-testing phase', 'Testing Phase', 'Post-testing Phase', 'External Quality Assessment', 'Overall Performance'
                ]);
                overallSitesHeaders = <tr>
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">Level 0 (&lt;40%)</th>
                    <th scope="col">Level 1 (40-59%)</th>
                    <th scope="col">Level 2 (60-79%)</th>
                    <th scope="col">Level 3 (80-89%)</th>
                    <th scope="col">Level 4 (&gt;90%)</th>
                </tr>
                tableOverallDataExport = [];
                tableOverallDataExport.push(['___', 'Programme', 'Level 0 (<40%)', 'Level 1 (40-59%)', 'Level 2 (60-79%)',
                    'Level 3 (80-89%)', 'Level 4 (>90%)'
                ]);
            }
        }

        if (this.state.odkData) {
            //if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) { //return data comes in different form. list od data
                this.state.odkData.map((displayData) => {
                    [tableData, overaRowllSiteLevels, tableDataExport, tableOverallDataExport] = this.addTableRows(tableData, overaRowllSiteLevels, displayData, tableDataExport, tableOverallDataExport);
                });
            } else {
                [tableData, overaRowllSiteLevels, tableDataExport, tableOverallDataExport] = this.addTableRows(tableData, overaRowllSiteLevels, this.state.odkData, tableDataExport, tableOverallDataExport);
            }
        }

        let tablesTab = <div className="col-sm-12  col-xm-12 col-md-12">
            <div className="row">
                <div className="col-sm-6  col-xm-6 col-md-6">
                    <p style={{ fontWeight: "900"}}>Average Performance  per QA element</p>

                </div>
                <div className="col-sm-3  col-xm-3 col-md-3">
                    <span style={{"color": "blue"}}><i className="fas fa-download"></i></span><CSVLink data={tableDataExport}> Csv</CSVLink>
                </div>
                <div className="col-sm-3  col-xm-3 col-md-3">
                    <a style={{"color": "blue"}} onClick={() => this.exportAveragePerformancePDFData()}><i className="fas fa-download"></i> PDF </a>
                </div>
            </div>

            <table id="averagePerformance" className="table table-responsive">
                <thead className="thead-dark">
                    {tableHeaders}
                </thead>
                <tbody>
                    {tableData}
                </tbody>
            </table>

            <br />

            <div className="row">
                <div className="col-sm-6  col-xm-6 col-md-6">
                    <p style={{ fontWeight: "900" }}>Overall Site Levels during Assessment</p>

                </div>
                <div className="col-sm-3  col-xm-3 col-md-3">
                <span><i className="fas fa-download"></i></span><CSVLink data={tableOverallDataExport}> Csv</CSVLink>
                </div>
                <div className="col-sm-3  col-xm-3 col-md-3">
                    <a style={{"color": "blue"}} onClick={() => this.exportOverallSiteLevelsPDFData()}><i className="fas fa-download"></i> PDF </a>
                </div>
            </div>

            <table id="overallSiteLevelPerformance" className="table table-responsive">
                <thead className="thead-dark">
                    {overallSitesHeaders}
                </thead>
                <tbody>
                    {overaRowllSiteLevels}
                </tbody>
            </table>
        </div>;

        let siteLevelBarColumnCharts = <SiteLevelBarColumnCharts singleItem={false} minHeight={510} serverData={this.state.odkData} siteType={this.state.siteType} />
        let overallPerformanceRadar = <OverallPerformanceRadar minHeight={this.state.echartsMinHeight} setMinHeight={true} serverData={this.state.odkData} siteType={this.state.siteType} />


        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">SPI REPORT</h1>
                    {/* <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-download fa-sm text-white-50"></i> Generate Report</a> */}
                </div>

                <div className="row">

                    <div className="col-md-2">
                        <OrgUnitButton orgUnitChangeHandler={this.orgUnitChangeHandler}></OrgUnitButton>
                    </div>
                    <div className="col-md-2">
                        <OrgTimeline onOrgTimelineChange={this.onOrgTimelineChange}></OrgTimeline>
                    </div>

                    <div className="col-md-2">
                        <OrgUnitType orgUnitTypeChangeHandler={this.orgUnitTypeChangeHandler}></OrgUnitType>
                    </div>

                    <div className="col-md-5">
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
                                    <i className="fas fa-chart-bar"></i> Site Level Columns</a>
                            </li>
                            {/* <li className="nav-item" role="presentation">
                                <a className="nav-link" id="averagecolumnsTab" data-toggle="tab" href="#averagecolumns" role="tab" aria-controls="profile" aria-selected="false">
                                    <i className="fas fa-chart-bar"></i> Average Performance Columns</a>
                            </li> */}
                            <li className="nav-item" role="presentation">
                                <a className="nav-link" id="spidersTab"
                                    data-toggle="tab" href="#spiders" role="tab"
                                    aria-controls="contact" aria-selected="false"
                                    onClick={() => {
                                        this.setState({
                                            echartsMinHeight: "500px"
                                        })
                                    }}
                                >
                                    <i className="fas fa-atom"></i> Average Performance Spider</a>
                            </li>
                        </ul>
                        <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade show active" id="tables" role="tablesTab" aria-labelledby="home-tab">
                                <br />
                                {tablesTab}
                            </div>

                            <div className="tab-pane fade" id="sitecolumns" role="SiteColumnsTab" aria-labelledby="profile-tab">
                                <br />
                                <p style={{ fontWeight: "900" }}>Overall Site Levels during Assessment</p>
                                {siteLevelBarColumnCharts}
                            </div>
                            <div className="tab-pane fade" id="averagecolumns" role="averagecolumns" aria-labelledby="profile-tab">
                                <br />
                            </div>
                            <div className="tab-pane fade" id="spiders" role="tabpanel" aria-labelledby="contact-tab">
                                <br />
                                <p style={{ fontWeight: "900" }}>Average Performance per QA element</p>
                                {overallPerformanceRadar}
                            </div>
                        </div>

                    </div>

                </div>

            </React.Fragment>
        );
    }

}

export default SpiReport;

if (document.getElementById('SpiReport')) {
    // find element by id
    let domValues = [];
    let domValuesMap = {};
    const dataChart1 = document.getElementById('data-chart1');
    const dataChart2 = document.getElementById('data-chart2');
    const dataChart3 = document.getElementById('data-chart3');
    const dataChart4 = document.getElementById('data-chart4');
    const dataChart5 = document.getElementById('data-chart5');
    const dataChart6 = document.getElementById('data-chart6');
    const dataChart7 = document.getElementById('data-chart7');
    const dataChart8 = document.getElementById('data-chart8');
    // create new props object with element's data-attributes
    // result: {chart1: "data"}
    domValues.push(dataChart1.dataset);
    domValues.push(dataChart2.dataset);
    domValues.push(dataChart3.dataset);
    domValues.push(dataChart4.dataset);
    domValues.push(dataChart5.dataset);
    domValues.push(dataChart6.dataset);
    domValues.push(dataChart7.dataset);
    domValues.push(dataChart8.dataset);
    // domValues.push({'f':10})
    domValues.forEach(element => {
        for (const property in element) {
            domValuesMap[property] = element[property];
        }
    });

    const props = Object.assign({}, domValuesMap);
    ReactDOM.render(<SpiReport {...props} />, document.getElementById('SpiReport'));
}

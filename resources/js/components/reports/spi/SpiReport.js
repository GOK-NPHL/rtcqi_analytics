import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../../utils/charts/LineGraph';
import StackedHorizontal from '../../utils/charts/StackedHorizontal'

import { FetchOrgunits, FetchOdkData } from '../../utils/Helpers'
import OrgUnitButton from '../../utils/orgunit/orgunit_button';
import OrgDate from '../../utils/orgunit/OrgDate';
import { v4 as uuidv4 } from 'uuid';
import OrgTimeline from '../../utils/orgunit/OrgTimeline';
import OrgProgramme from '../../utils/orgunit/OrgProgramme';


class SpiReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],
            orgUnitDataIds: [0],
            orgUnitTimeline: []
        }
        this.fetchOdkDataServer = this.fetchOdkDataServer.bind(this);
        this.onOrgTimelineChange = this.onOrgTimelineChange.bind(this);
        this.orgUnitChangeHandler = this.orgUnitChangeHandler.bind(this);
        this.onFilterButtonClickEvent = this.onFilterButtonClickEvent.bind(this);
    }

    componentDidMount() {
        //fetch counties
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
                orgUnitTimeline: []
            });
        })();

        this.fetchOdkDataServer(this.state.orgUnitDataIds, this.state.orgUnitTimeline);
    }

    fetchOdkDataServer(orgUnitIds, orgTimeline) {
        if (orgUnitIds) {
            if (orgUnitIds.length != 0) {
                (async () => {
                    let returnedData = await FetchOdkData(orgUnitIds, orgTimeline);
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

    onFilterButtonClickEvent() {
        this.fetchOdkDataServer(
            this.state.orgUnitDataIds,
            this.state.orgUnitTimeline
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.state.orgUnitDataIds !== nextState.orgUnitDataIds ||
            this.state.orgUnitTimeline !== nextState.orgUnitTimeline
        ) {
            return false;
        } else {
            return true;
        }
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
        if (this.state.odkData) {

            for (let [orgUnitId, orgUnitSpiData] of Object.entries(this.state.odkData)) {


                let rowCounter = 1;

                rowCounter += 1;

                let timeLines = [];
                let orgunitName = '';
                for (let [key, val] of Object.entries(orgUnitSpiData)) {
                    if (key != "OverallSitesLevel" && key != 'orgName') {
                        for (let [timeline, value] of Object.entries(val)) {
                            if (!timeLines.includes(timeline)) timeLines.push(timeline);
                        }
                    } else if (key == 'orgName') {
                        orgunitName = val.toUpperCase();
                    }
                }

                tableData.push(
                    <tr key={uuidv4()}>
                        <td colSpan={4} scope="row">
                            <strong>{orgunitName}</strong>
                        </td>
                    </tr>);

                timeLines.map((timeline) => {
                    let row = [];
                    row.push(<td key={uuidv4()} scope="row">{timeline}</td>);
                    for (let [indicator, data] of Object.entries(orgUnitSpiData)) {
                        if (indicator != 'orgName' && indicator != "OverallSitesLevel") {
                            row.push(<td key={uuidv4()} scope="row">{data[timeline]}</td>);
                        }
                    }

                    tableData.push(<tr key={uuidv4()}>{row}</tr>);
                });

                //======= Add  overaRowllSiteLevels table data =====//
                overaRowllSiteLevels.push(
                    <tr key={uuidv4()}>
                        <td colSpan={5} style={{ "wordWrap": "break-word", "maxWidth": "150px" }}>
                            <strong>{orgUnitSpiData['orgName'].toUpperCase()}</strong>
                        </td>
                    </tr>);

                timeLines.map((timeline) => {
                    let row = [];
                    row.push(<td key={uuidv4()}>{timeline}</td>);
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
                        }

                    }
                    overaRowllSiteLevels.push(<tr key={uuidv4()}>{row}</tr>);
                });


            }
        }



        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">SPI REPORT</h1>
                    <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-download fa-sm text-white-50"></i> Generate Report</a>
                </div>

                <div className="row">

                    <div className="col-md-2">
                        <OrgUnitButton orgUnitChangeHandler={this.orgUnitChangeHandler}></OrgUnitButton>
                    </div>
                    <div className="col-md-2">
                        <OrgTimeline onOrgTimelineChange={this.onOrgTimelineChange}></OrgTimeline>
                    </div>

                    <div className="col-md-2">
                        <OrgProgramme></OrgProgramme>
                    </div>

                    <div className="col-md-5">
                        <OrgDate></OrgDate>
                    </div>

                    <div className="col-md-1">
                        <button
                            onClick={()=>this.onFilterButtonClickEvent()}
                            type="button"
                            className="btn btn-sm btn-info">
                            <i className="fa fa-search" aria-hidden="true"></i>
                        </button>
                    </div>

                </div>
                <br />
                <div style={rowStle} className="row">
                    <div className="col-sm-12  col-xm-6 col-md-12">
                        <p style={{ fontWeight: "900" }}>Average Performance  per QA element</p>
                        <table className="table table-responsive">
                            <thead className="thead-dark">
                                <tr>
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

                                </tr>
                            </thead>
                            <tbody>
                                {tableData}
                            </tbody>
                        </table>

                        <br />
                        <p style={{ fontWeight: "900" }}>Overall Site Levels during Assessment</p>
                        <table className="table table-responsive">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">___</th>
                                    <th scope="col">Level 0 (&lt;40%)</th>
                                    <th scope="col">Level 1 (40-59%)</th>
                                    <th scope="col">Level 2 (60-79%)</th>
                                    <th scope="col">Level 3 (80-89%)</th>
                                    <th scope="col">Level 4 (&gt;90%)</th>

                                </tr>
                            </thead>
                            <tbody>
                                {overaRowllSiteLevels}
                            </tbody>
                        </table>

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
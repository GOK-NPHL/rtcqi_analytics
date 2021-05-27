import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../../utils/charts/LineGraph';
import StackedHorizontal from '../../utils/charts/StackedHorizontal'

import { FetchOrgunits, FetchOdkData } from '../../utils/Helpers'
import OrgUnitButton from '../../utils/orgunit/orgunit_button';
import OrgDate from '../../utils/orgunit/OrgDate';
import { v4 as uuidv4 } from 'uuid';


class SpiReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],

        }
        this.fetchOdkDataServer = this.fetchOdkDataServer.bind(this);

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
                orgId: 1
            });
        })();

        this.fetchOdkDataServer([0]);
    }

    fetchOdkDataServer(orgUnitIds) {
        if (orgUnitIds) {
            if (orgUnitIds.length != 0) {
                (async () => {
                    let returnedData = await FetchOdkData(orgUnitIds);
                    console.log("Server data log");
                    console.log(returnedData);
                    console.log("Server data");
                    if (returnedData.status == 200) {
                        this.setState({
                            odkData: returnedData.data,
                        });
                    }

                })();
            }
        }

    }

    render() {

        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "10px"
        };


        var tableData = [];
        var overallSiteLevels = [];

        if (this.state.odkData) {
            let rowCounter = 1;
            for (let [orgUnitId, orgUnitSpiData] of Object.entries(this.state.odkData)) {
                let tableRow = [];
                let overaRowllSiteLevels = [];

                tableRow.push(<td key={uuidv4()} scope="row">{rowCounter}</td>);
                overaRowllSiteLevels.push(<td key={uuidv4()} scope="row">{rowCounter}</td>);

                for (const property in orgUnitSpiData) {

                    if (property != "OverallSitesLevel") {
                        if (property == 'orgName') {
                            tableRow.push(<td style={{ "wordWrap": "break-word","maxWidth": "150px"  }} key={uuidv4()}>{orgUnitSpiData[property].toUpperCase()}</td>);
                        } else {
                            tableRow.push(<td key={uuidv4()}>{orgUnitSpiData[property]}</td>);
                        }

                    } else {
                        overaRowllSiteLevels.push(<td style={{ "wordWrap": "break-word","maxWidth": "150px"  }} key={uuidv4()}>{orgUnitSpiData['orgName'].toUpperCase()}</td>);
                        overaRowllSiteLevels.push(<td key={uuidv4()}>{orgUnitSpiData[property]['level0']}</td>);
                        overaRowllSiteLevels.push(<td key={uuidv4()}>{orgUnitSpiData[property]['level1']}</td>);
                        overaRowllSiteLevels.push(<td key={uuidv4()}>{orgUnitSpiData[property]['level2']}</td>);
                        overaRowllSiteLevels.push(<td key={uuidv4()}>{orgUnitSpiData[property]['level3']}</td>);
                        overaRowllSiteLevels.push(<td key={uuidv4()}>{orgUnitSpiData[property]['level4']}</td>);

                    }

                }
                let tbRow = <tr key={uuidv4()}>{tableRow}</tr>;
                let tbRowSiteLevel = <tr key={uuidv4()}>{overaRowllSiteLevels}</tr>;
                tableData.push(tbRow);
                overallSiteLevels.push(tbRowSiteLevel);
                rowCounter += 1;
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
                    <OrgUnitButton orgUnitChangeHandler={this.fetchOdkDataServer}></OrgUnitButton>
                    <OrgDate></OrgDate>
                </div>
                <br />
                <div style={rowStle} className="row">
                    <div className="col-sm-12  col-xm-6 col-md-12">
                        <p style={{ fontWeight: "900" }}>Average Performance  per QA element</p>
                        <table className="table table-responsive">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
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
                                    <th scope="col">#</th>
                                    <th scope="col">___</th>
                                    <th scope="col">Level 0 (&lt;40%)</th>
                                    <th scope="col">Level 1 (40-59%)</th>
                                    <th scope="col">Level 2 (60-79%)</th>
                                    <th scope="col">Level 3 (80-89%)</th>
                                    <th scope="col">Level 4 (&gt;90%)</th>

                                </tr>
                            </thead>
                            <tbody>
                                {overallSiteLevels}
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
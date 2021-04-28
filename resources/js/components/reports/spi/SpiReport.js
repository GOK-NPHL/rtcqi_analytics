import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../../charts/LineGraph';
import StackedHorizontal from '../../charts/StackedHorizontal'
import OrguntiDrillDown from '../../utils/OrguntiDrillDown'

import { FetchOrgunits, FetchOdkData } from '../../utils/Helpers'

class SpiReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],

        }
        this.handleOrgUntiChange = this.handleOrgUntiChange.bind(this);
    }

    componentDidMount() {
        //fetch counties
        (async () => {
            let returnedData = await FetchOrgunits();
            console.log(returnedData);
            let subCountyList = [];
            // returnedData.forEach((val) => {
            //     console.log(val);
            // });
            this.setState({
                unfilteredOrgUnits: returnedData,
                orgUnits: returnedData,
                odkData: {},
                orgLevel: 1,
                orgId: 1
            });
        })();

        //fetch initial data
        (async () => {
            // $orgUnit['mysites_county'] = 'bungoma';
            // $orgUnit['mysites_subcounty'] = 'webuye_west';
            // $orgUnit['mysites_facility'] = '15965__friends_lugulu_mission_hospital';
            // $orgUnit['mysites'] = 'opd';
            console.log("fetching data")
            let returnedData = await FetchOdkData('Kenya', '', '', '');

            this.setState({
                odkData: returnedData,
            });
        })();
    }

    handleOrgUntiChange(event) {
        let parentId=event.target[event.target.selectedIndex].dataset.parent_id;
        let level=event.target[event.target.selectedIndex].dataset.level;
        let id=event.target[event.target.selectedIndex].dataset.id
        let filteredOrgs=this.state.unfilteredOrgUnits.filter(orgunit => (orgunit.parent_id == id) || (orgunit.level<= level));
        this.setState({
            orgUnits: filteredOrgs
        });
        // console.log(event.target[event.target.selectedIndex].dataset.level);
        // console.log(event.target[event.target.selectedIndex].dataset.id);

        if(level==5){
            let site = event.target.value;
            let facility = this.state.unfilteredOrgUnits.filter(orgunit => (orgunit.id == parentId));
            let subCounty = this.state.unfilteredOrgUnits.filter(orgunit => (orgunit.id == facility[0]['parent_id']));
            let county = this.state.unfilteredOrgUnits.filter(orgunit => (orgunit.id == subCounty[0]['parent_id']));
            //odk_unit_name
        }else if(level==4){
            
        }else if(level==3){
            
        }else if(level==2){
            
        }else if(level==1){
            
        }

        let filteredOrg=this.state.unfilteredOrgUnits.filter(
            orgunit => ((orgunit.parent_id == parentId && orgunit.id<= level) && orgunit.id<= id)
        );
        console.log("filter");
        console.log(filteredOrg);
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
        console.log(this.state.odkData);
        for (const property in this.state.odkData) {
            console.log(property);
            if (property != "OverallSitesLevel") {
                tableData.push(<td>{this.state.odkData[property]}</td>);
            } else {
                overallSiteLevels.push(<td>{this.state.odkData[property]['level0']}</td>);
                overallSiteLevels.push(<td>{this.state.odkData[property]['level1']}</td>);
                overallSiteLevels.push(<td>{this.state.odkData[property]['level2']}</td>);
                overallSiteLevels.push(<td>{this.state.odkData[property]['level3']}</td>);
                overallSiteLevels.push(<td>{this.state.odkData[property]['level4']}</td>);

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

                {/* <OrguntiDrillDown /> */}


                <div className="row">
                    <div className="col-md-3 col-sm-3 col-xl-3 col-xs-3">
                        <form>
                            <div className="form-group">
                                {/* <label for="exampleFormControlSelect1">Example select</label> */}
                                <select onChange={this.handleOrgUntiChange} className="form-control" id="exampleFormControlSelect1">
                                    <option disabled selected>Select county</option>
                                    <option data-level='1' data-id='1'>Kenya</option>
                                    {this.state.orgUnits.map((value, index) => {
                                        if (value.level == 2)
                                            return (<option data-level={value.level} data-id={value.id} data-parent_id={value.parent_id}>{value.odk_unit_name}</option>)
                                    })}
                                </select>
                            </div>
                        </form>
                    </div>

                    <div className="col-md-3 col-sm-3 col-xl-3 col-xs-3">
                        <form>
                            <div className="form-group">
                                {/* <label for="exampleFormControlSelect1">Example select</label> */}
                                <select onChange={this.handleOrgUntiChange} className="form-control" id="exampleFormControlSelect1">
                                    <option disabled selected>Select subcounty</option>
                                    {this.state.orgUnits.map((value, index) => {
                                        if (value.level == 3)
                                        return (<option data-level={value.level} data-id={value.id} data-parent_id={value.parent_id}>{value.odk_unit_name}</option>)
                                    })}
                                </select>
                            </div>
                        </form>
                    </div>


                    <div className="col-md-3 col-sm-3 col-xl-3 col-xs-3">
                        <form>
                            <div className="form-group">
                                {/* <label for="exampleFormControlSelect1">Example select</label> */}
                                <select onChange={this.handleOrgUntiChange} className="form-control" id="exampleFormControlSelect1">
                                    <option disabled selected>Select facility</option>
                                    {this.state.orgUnits.map((value, index) => {
                                        if (value.level == 4)
                                        return (<option data-level={value.level} data-id={value.id} data-parent_id={value.parent_id}>{value.odk_unit_name}</option>)
                                    })}
                                </select>
                            </div>
                        </form>
                    </div>


                    <div className="col-md-3 col-sm-3 col-xl-3 col-xs-3">
                        <form>
                            <div className="form-group">
                                {/* <label for="exampleFormControlSelect1">Example select</label> */}
                                <select onChange={this.handleOrgUntiChange} className="form-control" id="exampleFormControlSelect1">
                                    <option disabled selected>Select site</option>
                                    {this.state.orgUnits.map((value, index) => {
                                        if (value.level == 5)
                                        return (<option data-level={value.level} data-id={value.id} data-parent_id={value.parent_id}>{value.odk_unit_name}</option>)
                                    })}
                                </select>
                            </div>
                        </form>
                    </div>

                </div>


                <div style={rowStle} className="row">
                    <div className="col-sm-12  col-xm-6 col-md-12">
                        <p style={{ fontWeight: "900" }}>Average Performance  per QA element</p>
                        <table class="table">
                            <thead class="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
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

                                <tr>
                                    <td scope="row">1</td>
                                    {tableData}
                                </tr>

                            </tbody>
                        </table>

                        <br />
                        <p style={{ fontWeight: "900" }}>Overall Site Levels during Assessment</p>
                        <table class="table">
                            <thead class="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Level 0 (&lt;40%)</th>
                                    <th scope="col">Level 1 (40-59%)</th>
                                    <th scope="col">Level 2 (60-79%)</th>
                                    <th scope="col">Level 3 (80-89%)</th>
                                    <th scope="col">Level 4 (&gt;90%)</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td scope="row">1</td>
                                    {overallSiteLevels}
                                </tr>

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
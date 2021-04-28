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
            let subCountyList = [];
            // returnedData.forEach((val) => {
            //     console.log(val);
            // });
            this.setState({
                orgUnits: returnedData,
            });
        })();

        //fetch initial data
        (async () => {
             // $orgUnit['mysites_county'] = 'bungoma';
        // $orgUnit['mysites_subcounty'] = 'webuye_west';
        // $orgUnit['mysites_facility'] = '15965__friends_lugulu_mission_hospital';
        // $orgUnit['mysites'] = 'opd';
            console.log("fetching data")
            let returnedData = await FetchOdkData('bungoma','webuye_west','15965__friends_lugulu_mission_hospital','opd');
            console.log(returnedData);
        })();
    }
    
    handleOrgUntiChange(event) {
        // console.log(event.target.dataset);
        console.log(event.target[event.target.selectedIndex].dataset.level);
    }

    render() {
        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "10px"
        };
        console.log(this.props)
        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Logbook REPORT</h1>
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
                                    <option data-level='1'>Kenya</option>
                                    {this.state.orgUnits.map((value, index) => {
                                        if (value.level == 2)
                                            return (<option data-level={value.level}>{value.odk_unit_name}</option>)
                                    })}
                                </select>
                            </div>
                        </form>
                    </div>

                    <div className="col-md-3 col-sm-3 col-xl-3 col-xs-3">
                        <form>
                            <div className="form-group">
                                {/* <label for="exampleFormControlSelect1">Example select</label> */}
                                <select className="form-control" id="exampleFormControlSelect1">
                                    <option disabled selected>Select subcounty</option>
                                    {this.state.orgUnits.map((value, index) => {
                                        if (value.level == 3)
                                            return (<option>{value.odk_unit_name}</option>)
                                    })}
                                </select>
                            </div>
                        </form>
                    </div>


                    <div className="col-md-3 col-sm-3 col-xl-3 col-xs-3">
                        <form>
                            <div className="form-group">
                                {/* <label for="exampleFormControlSelect1">Example select</label> */}
                                <select className="form-control" id="exampleFormControlSelect1">
                                    <option disabled selected>Select facility</option>
                                    {this.state.orgUnits.map((value, index) => {
                                        if (value.level == 4)
                                            return (<option>{value.odk_unit_name}</option>)
                                    })}
                                </select>
                            </div>
                        </form>
                    </div>


                    <div className="col-md-3 col-sm-3 col-xl-3 col-xs-3">
                        <form>
                            <div className="form-group">
                                {/* <label for="exampleFormControlSelect1">Example select</label> */}
                                <select className="form-control" id="exampleFormControlSelect1">
                                    <option disabled selected>Select site</option>
                                    {this.state.orgUnits.map((value, index) => {
                                        if (value.level == 5)
                                            return (<option>{value.odk_unit_name}</option>)
                                    })}
                                </select>
                            </div>
                        </form>
                    </div>

                </div>







                <div style={rowStle} className="row">
                    <div className="col-sm-6  col-xm-6 col-md-6">
                        <img style={imgStyle} src={this.props.chart1}></img>
                    </div>
                    <div className="col-sm-6 col-xm-6 col-md-6">
                        <img style={imgStyle} src={this.props.chart2}></img>
                    </div>
                </div>

                <div style={rowStle} className="row">
                    <div className="col-sm-6  col-xm-6 col-md-6">
                        <img style={imgStyle} src={this.props.chart3}></img>
                    </div>
                    <div className="col-sm-6 col-xm-6 col-md-6">
                        <img style={imgStyle} src={this.props.chart4}></img>
                    </div>
                </div>

                <div style={rowStle} className="row">
                    <div className="col-sm-6  col-xm-6 col-md-6">
                        <img style={imgStyle} src={this.props.chart6}></img>
                    </div>
                    <div className="col-sm-6 col-xm-6 col-md-6">
                        <img style={imgStyle} src={this.props.chart7}></img>
                    </div>
                </div>

                <div style={rowStle} className="row">
                    <div className="col-sm-6  col-xm-6 col-md-6">
                        <img style={imgStyle} src={this.props.chart8}></img>
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
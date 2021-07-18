import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../../utils/charts/LineGraph';
import StackedHorizontal from '../../utils/charts/StackedHorizontal'

class PTReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        // const assetPath = document.getElementById("app").getAttribute("assetPath");
        console.log(this.props);
        // console.log(document.getElementById("app").getAttribute("assetPath"));
        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "5px"
        };

        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">PT REPORT</h1>
                    {/* <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-download fa-sm text-white-50"></i> Generate Report</a> */}
                </div>

                {/* <OrguntiDrillDown /> */}

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
                        <img style={imgStyle} src={this.props.chart5}></img>
                    </div>
                    <div className="col-sm-6 col-xm-6 col-md-6">
                        <img style={imgStyle} src={this.props.chart6}></img>
                    </div>
                </div>




            </React.Fragment>
        );
    }

}

export default PTReport;

if (document.getElementById('PTReport')) {
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
    ReactDOM.render(<PTReport {...props} />, document.getElementById('PTReport'));
}
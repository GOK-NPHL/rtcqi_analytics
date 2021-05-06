import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../../utils/charts/LineGraph';
import StackedHorizontal from '../../utils/charts/StackedHorizontal'
import OrguntiDrillDown from '../../utils/OrguntiDrillDown'

class MEReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        const imgStyle = {
            width: "100%"
        };
        const imgStyleHeight = {
            height: "50%"
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

                <OrguntiDrillDown />

                <div style={rowStle} className="row">
                    <div className="col-sm-6  col-xm-6 col-md-6">
                        <img style={{ "width": "100%", "height": "30%"}} src={this.props.chart1}></img>
                    </div>
                    <div className="col-sm-6 col-xm-6 col-md-6">
                        <img style={{ "width": "100%", "height": "100%"}} src={this.props.chart2}></img>
                    </div>
                </div>


            </React.Fragment>
        );
    }

}

export default MEReport;

if (document.getElementById('MEReport')) {
    // find element by id
    let domValues = [];
    let domValuesMap = {};
    const dataChart1 = document.getElementById('data-chart1');
    const dataChart2 = document.getElementById('data-chart2');
    // create new props object with element's data-attributes
    // result: {chart1: "data"}
    domValues.push(dataChart1.dataset);
    domValues.push(dataChart2.dataset);

    // domValues.push({'f':10})
    domValues.forEach(element => {
        for (const property in element) {
            domValuesMap[property] = element[property];
        }
    });

    const props = Object.assign({}, domValuesMap);
    ReactDOM.render(<MEReport {...props} />, document.getElementById('MEReport'));
}
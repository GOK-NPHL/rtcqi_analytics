import React from 'react';
import ReactDOM from 'react-dom';

class SheetSelect extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

    }

    render() {

        let sheets = [];
        if (this.props.workbook.length != 0) {
            this.props.workbook.SheetNames.map((value, index) => {
                sheets.push(
                    <tr key={index}>
                        <td scope="row">{index+1}</td>
                        <td>{value}</td>
                        <td>
                            <div className="custom-control custom-radio">
                                <input onClick={()=>this.props.setSheetWithOrgs(event)} type="radio" id={`sheet_${value}`} value={value} name="sheetsRadio" className="custom-control-input" />
                                <label className="custom-control-label" htmlFor={`sheet_${value}`}></label>
                            </div>
                        </td>
                    </tr>
                );
            });
        }

        return (
            <React.Fragment>

                {/* Sheet with orgunit selector */}
                <br/>
                <hr/>
                <div className="row">

                    <div className="col-sm-4">
                        <p style={{"fontWeight": "700"}}>Select sheet with org units</p>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Sheet name</th>
                                    <th scope="col">Contains orgunits</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sheets}
                            </tbody>
                        </table>
                    </div>
                </div>

            </React.Fragment>
        );
    }

}

export default SheetSelect;

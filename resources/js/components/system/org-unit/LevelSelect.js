import React from 'react';
import ReactDOM from 'react-dom';
import XLSX from "xlsx";


class LevelSelect extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };

    }

    componentDidMount() {

    }

    render() {
        let sheetHeaders = {};
        let sheetDataPreview = [];
        if (this.props.sheetWithOrgs) {
            let sheetName = this.props.sheetWithOrgs;
            let sheet = this.props.workbook.Sheets[sheetName];
            var range = XLSX.utils.decode_range(sheet['!ref']); // get the range
            let previewMaxRowsCounter = 0;
            for (var R = range.s.r; R <= range.e.r; ++R) {
                if (previewMaxRowsCounter <= 12 && R > 2) {
                    sheetDataPreview.push([]);
                }
                let previewArrLength = sheetDataPreview.length;
                for (var C = range.s.c; C <= range.e.c; ++C) {
                    //console.log('Row : ' + R);
                    //console.log('Column : ' + C);
                    var cellref = XLSX.utils.encode_cell({ c: C, r: R }); // construct A1 reference for cell
                    if (!sheet[cellref]) continue; // if cell doesn't exist, move on
                    var cell = sheet[cellref];
                    if (R == 1) {
                        sheetHeaders[C] = cell.v;
                    }
                    if (previewMaxRowsCounter <= 12 && R > 2) {
                        sheetDataPreview[previewArrLength - 1].push(cell.v);
                    }

                }
                previewMaxRowsCounter += 1;
            }
        }

        let colHeaders = [];
        let tablePreviewElHeaders = [];
        let count = 1;
        for (const [key, value] of Object.entries(sheetHeaders)) {
            colHeaders.push(
                <tr key={key}>
                    <th scope="row">{count}</th>
                    <td data-id={key}>{value}</td>
                    <td><input type="number" size="3" min="1" max="9"></input></td>
                </tr>
            );
            if (key = 0) {
                tablePreviewElHeaders.push(<th scope="col">#</th>);
            } else {
                tablePreviewElHeaders.push(<th scope="col">{value}</th>);
            }

            count += 1;
        }

        let tablePreviewEl = [];
        for (let x = 0; x < sheetDataPreview.length; x++) {
            let rowData = [];
            for (let y = 0; y < sheetDataPreview[x].length; y++) {
                if (y == 0) {
                    rowData.push(<th scope="row">{x}</th>);
                } else {
                    rowData.push(<td>{sheetDataPreview[x][y]}</td>);
                }
            }
            let tableRow = <tr>{rowData}</tr>;
            tablePreviewEl.push(tableRow);
        }

        return (
            <React.Fragment>

                <div className="row">

                    <div className="col-sm-3">
                        <p>Set orgunit hierarchy</p>
                        <table className="table table-bordered ">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Column Name</th>
                                    <th scope="col">Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {colHeaders}
                            </tbody>
                        </table>
                    </div>

                    <div className="col-sm-9">
                        <p>Table Preview</p>
                        <table className="table table-bordered ">
                            <thead className="thead-dark">
                                <tr>
                                    {tablePreviewElHeaders}
                                </tr>

                            </thead>
                            <tbody>
                                {tablePreviewEl}
                            </tbody>
                        </table>
                    </div>
                </div>

            </React.Fragment>
        );
    }

}

export default LevelSelect;

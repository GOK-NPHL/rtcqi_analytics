import React from 'react';
import ReactDOM from 'react-dom';
import XLSX from "xlsx";


class LevelSelect extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            columnHierarchy: {}
        };
        this.columnHierarchyOrderHandler = this.columnHierarchyOrderHandler.bind(this);

    }

    componentDidMount() {
    }

    columnHierarchyOrderHandler(event) {
        let col = event.target.dataset.column;
        let hierValue = event.target.value;
        let hierarMap = this.state.columnHierarchy;
        hierarMap[col] = hierValue; 
        this.setState({
            columnHierarchy: hierarMap,

        });
        this.props.setOrgunitExcelFileHierachy(hierarMap);
    }

    render() {
        window.$(".inputLevel").keypress(function (evt) {
            evt.preventDefault();
        });

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
                    if (previewMaxRowsCounter == 12) { break; }
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
                    <td >{value}</td>
                    <td>
                        <input
                            data-column={key}
                            onInput={() => this.columnHierarchyOrderHandler(event)}
                            type="number"
                            size="3" min="2" max="9"
                            className="inputLevel">
                        </input></td>
                </tr>
            );
            if (key == 0) {
                tablePreviewElHeaders.push(<th key={key} scope="col">#</th>);
            } else {
                tablePreviewElHeaders.push(<th key={key} scope="col">{value}</th>);
            }

            count += 1;
        }

        let tablePreviewEl = [];
        for (let x = 0; x < sheetDataPreview.length; x++) {
            let rowData = [];
            for (let y = 0; y < sheetDataPreview[x].length; y++) {
                if (y == 0) {
                    rowData.push(<th key={y} scope="row">{x + 1}</th>);
                } else {
                    rowData.push(<td key={y}>{sheetDataPreview[x][y]}</td>);
                }
            }
            let tableRow = <tr key={x}>{rowData}</tr>;
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
                        <p>Data Preview</p>
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

import React from 'react';
import ReactDOM from 'react-dom';
import { FetchAuthorities, SaveRole, UpdateRole } from '../../utils/Helpers';
import DualListBox from 'react-dual-listbox';
import XLSX from "xlsx";
import SheetSelect from './SheetSelect';
import LevelSelect from './LevelSelect';

class OrgunitCreate extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            fileName: "Choose orgunit excel",
            sheetWithOrgs: '',
            workbook: [],
        };
        this.handleFile = this.handleFile.bind(this);
        this.setSheetWithOrgs = this.setSheetWithOrgs.bind(this);

    }

    componentDidMount() {

    }

    handleFile(e) {

        var files = e.target.files, f = files[0];
        console.log(files);
        this.setState({ fileName: files[0].name });
        var reader = new FileReader();
        reader.onload = (e) => {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            console.log(workbook);
            this.setState({
                workbook: workbook
            });
        };
        reader.readAsArrayBuffer(f);
    }

    setSheetWithOrgs(event) {
        this.setState({
            sheetWithOrgs: event.target.value,
        });
    }

    render() {

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-sm-4">
                        <div className="input-group mb-3">
                            <div className="custom-file">
                                <input
                                    onChange={() => this.handleFile(event)}
                                    type="file"
                                    className="custom-file-input"
                                    accept=".xls,.xlsx" id="inputGroupFile01"
                                    aria-describedby="inputGroupFileAddon01" />
                                <label className="custom-file-label" htmlFor="inputGroupFile01">{this.state.fileName}</label>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetSelect workbook={this.state.workbook} setSheetWithOrgs={this.setSheetWithOrgs} />
                <hr />
                <LevelSelect workbook={this.state.workbook} sheetWithOrgs={this.state.sheetWithOrgs} />



            </React.Fragment>
        );
    }

}

export default OrgunitCreate;

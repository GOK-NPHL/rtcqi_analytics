import React from 'react';
import ReactDOM from 'react-dom';
import { SaveOrgUnits } from '../../utils/Helpers';
import DualListBox from 'react-dual-listbox';
import XLSX from "xlsx";
import SheetSelect from './SheetSelect';
import LevelSelect from './LevelSelect';
import OrgunitStructureCreate from './OrgunitStructureCreate';

class OrgunitCreate extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            fileName: "Choose orgunit excel",
            sheetWithOrgs: '',
            workbook: [],
            pageNo: 1,
            isSaveOrgs: false,
            orgunitFileHierachy: {}
        };
        this.handleFile = this.handleFile.bind(this);
        this.setSheetWithOrgs = this.setSheetWithOrgs.bind(this);
        this.setOrgunitExcelFileHierachy = this.setOrgunitExcelFileHierachy.bind(this);
        this.incrementDecrementOrgUnitStep = this.incrementDecrementOrgUnitStep.bind(this);
        this.saveOrgUnits = this.saveOrgUnits.bind(this);
    }

    componentDidMount() {

    }

    handleFile(e) {

        var files = e.target.files, f = files[0];
        this.setState({ fileName: files[0].name });
        var reader = new FileReader();
        reader.onload = (e) => {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
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

    setOrgunitExcelFileHierachy(orgunitFileHierachy) {
        this.setState({
            orgunitFileHierachy: orgunitFileHierachy
        });
    }

    incrementDecrementOrgUnitStep(isIncrement) {
        let pageNo = this.state.pageNo;
        if (isIncrement) {
            pageNo = pageNo + 1;
        } else {
            pageNo = pageNo - 1;
        }
        if (pageNo == 0) {
            this.props.setShowOrgunitLanding(true);
        }
        this.setState({
            pageNo: pageNo
        });
    }

    saveOrgUnits(orgUnits) {
        let orgunitMetadata = [];
        console.log(this.state.orgunitFileHierachy);
        for (const [column, level] of Object.entries(this.state.orgunitFileHierachy)) {
            let orgMeta = {
                'sheet': this.state.sheetWithOrgs,
                'column': column,
                'level': level,
            };
            orgunitMetadata.push(orgMeta);
        }

        (async () => {
            let response = await SaveOrgUnits(orgUnits, orgunitMetadata);
            console.log(response);
            if (response['status'] == 200) {
                this.props.setShowOrgunitLanding(true);
            }

        })();

    }

    render() {

        let selectSheetElement = <React.Fragment></React.Fragment>;

        if (this.state.workbook.length != 0 && this.state.pageNo == 1) {
            selectSheetElement = <SheetSelect workbook={this.state.workbook} setSheetWithOrgs={this.setSheetWithOrgs} />
        }

        let selectLevelElement = <React.Fragment></React.Fragment>;
        if (this.state.pageNo == 2) {
            selectLevelElement = <React.Fragment>
                <hr />
                <LevelSelect setOrgunitExcelFileHierachy={this.setOrgunitExcelFileHierachy} workbook={this.state.workbook} sheetWithOrgs={this.state.sheetWithOrgs} />
            </React.Fragment>;
        }

        let orgunitStructureElement = <React.Fragment></React.Fragment>;

        let nextSaveButton = <div className="col-sm-4 .float-right" style={{ "textAlign": "right" }} onClick={() => this.incrementDecrementOrgUnitStep(true)}>
            <button id="nextButton" type="button" className="btn btn-primary">Next <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </button></div>;

        if (this.state.pageNo == 3) {
            orgunitStructureElement = <React.Fragment>
                <hr />
                <OrgunitStructureCreate
                    orgunitExcelFileHierachy={this.state.orgunitFileHierachy}
                    workbook={this.state.workbook}
                    sheetWithOrgs={this.state.sheetWithOrgs}
                    saveOrgUnits={this.saveOrgUnits}
                    isSaveOrgs={this.state.isSaveOrgs}
                />
            </React.Fragment>;

            nextSaveButton = <div className="col-sm-4 .float-right" style={{ "textAlign": "right" }} >
                <button
                    id="saveButton"
                    type="button"
                    onClick={
                        (event) => {
                            this.setState({ isSaveOrgs: true })
                            localStorage.removeItem('orgunitList');
                            localStorage.removeItem('treeStruc');
                            localStorage.removeItem("orgunitTableStruc");
                            $("#saveButton").prop('disabled', true);
                        }
                    }
                    className="btn btn-primary"> Save & Exit <i className="fa fa-floppy-o" aria-hidden="true"></i>
                </button></div>;
        }

        let nextBar = <div className="row">
            <div className="col-sm-4 .float-left" style={{ "textAlign": "left" }}>
                <button id="previousButton" type="button" className="btn btn-primary" onClick={() => this.incrementDecrementOrgUnitStep(false)}><i className="fa fa-arrow-left" aria-hidden="true">
                </i> Prev</button>
            </div>
            <div className="col-sm-4" style={{ "textAlign": "center" }}>Step {this.state.pageNo} of 3</div>
            {nextSaveButton}
        </div>;

        let createOrgsLanding = <>
            <br />
            <div className="row">
                <div className="col-sm-12"><p style={{ "fontWeight": "700" }}>Upload Excel file with ODK central organusation units cascade</p></div>
                <br />
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
        </>;

        if (this.state.pageNo != 1) {
            createOrgsLanding = <></>
        }

        return (
            <React.Fragment>
                {nextBar}
                {createOrgsLanding}
                {selectSheetElement}
                {selectLevelElement}
                {orgunitStructureElement}
            </React.Fragment>
        );
    }

}

export default OrgunitCreate;

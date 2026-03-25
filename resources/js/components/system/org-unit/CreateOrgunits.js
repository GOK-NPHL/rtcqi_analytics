import React, { useState } from 'react';
import { SaveOrgUnits, updateUploadOrgUnits } from '../../utils/Helpers';
import XLSX from 'xlsx';
import SheetSelect from './SheetSelect';
import LevelSelect from './LevelSelect';
import OrgunitStructureCreate from './OrgunitStructureCreate';

function OrgunitCreate({ setShowOrgunitLanding, triggerOrgUnitsFetch, isUpdateOrgunits }) {
    const [fileName, setFileName] = useState('Choose orgunit excel');
    const [sheetWithOrgs, setSheetWithOrgs] = useState('');
    const [workbook, setWorkbook] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [isSaveOrgs, setIsSaveOrgs] = useState(false);
    const [orgunitFileHierachy, setOrgunitFileHierachy] = useState({});

    const handleFile = (e) => {
        const files = e.target.files;
        setFileName(files[0].name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const data = new Uint8Array(ev.target.result);
            setWorkbook(XLSX.read(data, { type: 'array' }));
        };
        reader.readAsArrayBuffer(files[0]);
    };

    const setSheetHandler = (event) => setSheetWithOrgs(event.target.value);

    const incrementDecrementOrgUnitStep = (isIncrement) => {
        const next = isIncrement ? pageNo + 1 : pageNo - 1;
        if (next === 0) setShowOrgunitLanding(true);
        setPageNo(next);
    };

    const saveOrgUnits = async (orgUnits) => {
        const orgunitMetadata = Object.entries(orgunitFileHierachy).map(([column, level]) => ({
            sheet: sheetWithOrgs, column, level,
        }));
        const response = await SaveOrgUnits(orgUnits, orgunitMetadata);
        if (response['status'] === 200) {
            setShowOrgunitLanding(true);
            triggerOrgUnitsFetch();
        }
    };

    const updateUploadOrgs = async (orgUnits) => {
        const orgunitMetadata = Object.entries(orgunitFileHierachy).map(([column, level]) => ({
            sheet: sheetWithOrgs, column, level,
        }));
        const response = await updateUploadOrgUnits(orgUnits, orgunitMetadata);
        if (response['status'] === 200) {
            setShowOrgunitLanding(true);
            triggerOrgUnitsFetch();
        }
    };

    const nextSaveButton = pageNo === 3
        ? (
            <div className="col-sm-4 .float-right" style={{ textAlign: 'right' }}>
                <button
                    id={isUpdateOrgunits ? 'updateButton' : 'saveButton'}
                    type="button"
                    onClick={() => {
                        setIsSaveOrgs(true);
                        localStorage.removeItem('orgunitList');
                        localStorage.removeItem('treeStruc');
                        localStorage.removeItem('orgunitTableStruc');
                        document.getElementById(isUpdateOrgunits ? 'updateButton' : 'saveButton').disabled = true;
                    }}
                    className="btn btn-primary"
                >
                    {isUpdateOrgunits ? 'Update & Exit' : 'Save & Exit'} <i className="fa fa-floppy-o" aria-hidden="true"></i>
                </button>
            </div>
        )
        : (
            <div className="col-sm-4 .float-right" style={{ textAlign: 'right' }} onClick={() => incrementDecrementOrgUnitStep(true)}>
                <button id="nextButton" type="button" className="btn btn-primary">
                    Next <i className="fa fa-arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        );

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-sm-4 .float-left" style={{ textAlign: 'left' }}>
                    <button type="button" className="btn btn-primary" onClick={() => incrementDecrementOrgUnitStep(false)}>
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Prev
                    </button>
                </div>
                <div className="col-sm-4" style={{ textAlign: 'center' }}>Step {pageNo} of 3</div>
                {nextSaveButton}
            </div>

            {pageNo === 1 && (
                <>
                    <br />
                    <div className="row">
                        <div className="col-sm-12">
                            <p style={{ fontWeight: '700' }}>Upload Excel file with ODK central organisation units cascade</p>
                        </div>
                        <div className="col-sm-4">
                            <div className="input-group mb-3">
                                <div className="custom-file">
                                    <input
                                        onChange={handleFile}
                                        type="file"
                                        className="custom-file-input"
                                        accept=".xls,.xlsx"
                                        id="inputGroupFile01"
                                        aria-describedby="inputGroupFileAddon01"
                                    />
                                    <label className="custom-file-label" htmlFor="inputGroupFile01">{fileName}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {workbook.length !== 0 && <SheetSelect workbook={workbook} setSheetWithOrgs={setSheetHandler} />}
                </>
            )}

            {pageNo === 2 && (
                <>
                    <hr />
                    <LevelSelect setOrgunitExcelFileHierachy={setOrgunitFileHierachy} workbook={workbook} sheetWithOrgs={sheetWithOrgs} />
                </>
            )}

            {pageNo === 3 && (
                <>
                    <hr />
                    <OrgunitStructureCreate
                        isUpdateOrgunits={isUpdateOrgunits}
                        orgunitExcelFileHierachy={orgunitFileHierachy}
                        workbook={workbook}
                        sheetWithOrgs={sheetWithOrgs}
                        saveOrgUnits={saveOrgUnits}
                        updateUploadOrgs={updateUploadOrgs}
                        isSaveOrgs={isSaveOrgs}
                    />
                </>
            )}
        </React.Fragment>
    );
}

export default OrgunitCreate;

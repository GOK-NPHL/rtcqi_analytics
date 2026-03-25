import React, { useMemo } from 'react';
import TreeView from '../../utils/TreeView';
import DataTable from 'react-data-table-component';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

function orgUnitStructureMaker(arr, currentOrgName, hierachyColLevel, tableOrgs, uuid4, parentId) {
    const orgsNameToSearch = currentOrgName.split('$');

    if (orgsNameToSearch.length === 1) {
        const orgUnit = { id: uuid4, name: orgsNameToSearch[0], level: hierachyColLevel, parentId, children: [] };
        arr.push(orgUnit);
        tableOrgs.push(orgUnit);
        return arr;
    }

    for (let i = 0; i < orgsNameToSearch.length - 1; i++) {
        if (arr) {
            arr.forEach((item) => {
                if (item.name === orgsNameToSearch[i]) {
                    let nextSubString = '';
                    let firstLoop = true;
                    for (let y = i + 1; y < orgsNameToSearch.length; y++) {
                        nextSubString = firstLoop ? orgsNameToSearch[y] : nextSubString + '$' + orgsNameToSearch[y];
                        firstLoop = false;
                    }
                    orgUnitStructureMaker(item.children, nextSubString, hierachyColLevel, tableOrgs, uuid4, parentId);
                }
            });
        }
    }
}

function createOrgTree(sheetWithOrgs, orgunitExcelFileHierachy, workbook) {
    const root = { id: 0, name: 'Kenya', level: 1, parentId: 0, children: [] };
    const orgUnitStructure = [{ ...root, children: [] }];
    const tableOrgs = [root];

    if (!sheetWithOrgs || !orgunitExcelFileHierachy) return [orgUnitStructure, tableOrgs];

    const sorted = new Map([...Object.entries(orgunitExcelFileHierachy)].sort((a, b) => a[1] - b[1]));
    const sheet = workbook.Sheets[sheetWithOrgs];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const orgUnitsProcessed = [];
    const orgUnitsIdMapping = {};

    for (let R = range.s.r; R <= range.e.r; ++R) {
        const rowValues = new Map();
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellref = XLSX.utils.encode_cell({ c: C, r: R });
            if (!sheet[cellref]) continue;
            const v = sheet[cellref].v.toLowerCase();
            rowValues[C] = (v.charAt(0).toUpperCase() + v.slice(1)).trim();
        }

        for (const [hierachyCol, hierachyColLevel] of sorted.entries()) {
            if (rowValues[hierachyCol] === undefined) continue;

            if (hierachyColLevel == 2) {
                if (!orgUnitsProcessed.includes(rowValues[hierachyCol])) {
                    const uuid4 = uuidv4();
                    const orgUnit = { id: uuid4, name: rowValues[hierachyCol], level: 2, parentId: 0, children: [] };
                    orgUnitStructure[0].children.push(orgUnit);
                    tableOrgs.push(orgUnit);
                    orgUnitsProcessed.push(rowValues[hierachyCol]);
                    orgUnitsIdMapping[rowValues[hierachyCol]] = uuid4;
                }
            } else {
                let currentOrgName = '';
                let initialLoop = true;
                for (const [col] of sorted.entries()) {
                    currentOrgName = initialLoop ? rowValues[col] : currentOrgName + '$' + rowValues[col];
                    initialLoop = false;
                    if (col === hierachyCol) break;
                }
                if (orgUnitsProcessed.includes(currentOrgName)) continue;

                const uuid4 = uuidv4();
                const parentNameLength = currentOrgName.lastIndexOf('$');
                const parentName = currentOrgName.substring(0, parentNameLength);
                const parentId = orgUnitsIdMapping[parentName];
                orgUnitStructureMaker(orgUnitStructure[0].children, currentOrgName, hierachyColLevel, tableOrgs, uuid4, parentId);
                orgUnitsProcessed.push(currentOrgName);
                orgUnitsIdMapping[currentOrgName] = uuid4;
            }
        }
    }

    return [orgUnitStructure, tableOrgs];
}

const columns = [
    { name: 'Org Unit Name', selector: row => row.name, sortable: true },
    { name: 'Org Level', selector: row => row.level, sortable: true },
];

function OrgunitStructureCreate({ sheetWithOrgs, orgunitExcelFileHierachy, workbook, isSaveOrgs, isUpdateOrgunits, saveOrgUnits, updateUploadOrgs }) {
    const [orgUnitStructure, tableOrgs] = useMemo(
        () => createOrgTree(sheetWithOrgs, orgunitExcelFileHierachy, workbook),
        [sheetWithOrgs, orgunitExcelFileHierachy, workbook]
    );

    if (isSaveOrgs && !isUpdateOrgunits) saveOrgUnits(tableOrgs);
    else if (isSaveOrgs && isUpdateOrgunits) updateUploadOrgs(tableOrgs);

    return (
        <React.Fragment>
            <div className="row">
                <div style={{ overflow: 'scroll', maxHeight: '700px', minHeight: '500px', paddingBottom: '6px', paddingRight: '16px' }} className="col-sm-3">
                    <TreeView orgUnits={orgUnitStructure} />
                </div>
                <div className="col-sm-8">
                    <DataTable
                        title="Organisation Units"
                        columns={columns}
                        data={tableOrgs}
                        defaultSortFieldId={1}
                        pagination
                        selectableRows
                    />
                </div>
            </div>
        </React.Fragment>
    );
}

export default OrgunitStructureCreate;

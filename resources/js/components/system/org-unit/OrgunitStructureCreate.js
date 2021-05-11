import React from 'react';
import ReactDOM from 'react-dom';
import TreeView from '../../utils/TreeView';
import DataTable from "react-data-table-component";
import movies from "./movies";
import XLSX from "xlsx";


class OrgunitStructureCreate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnitStructure: []
        }

        this.createOrgTree = this.createOrgTree.bind(this);
        this.orgUnitStructureMaker = this.orgUnitStructureMaker.bind(this);

    }

    componentDidMount() {
        // orgunitExcelFileHierachy

    }

    componentDidUpdate() {

    }

    orgUnitStructureMaker(arr, currentOrgName, hierachyColLevel,tableOrgs) {

        let orgsNameToSearch = currentOrgName.split('$');

        if (orgsNameToSearch.length == 1) {
            let orgUnit = {
                id: orgsNameToSearch[0],
                name: orgsNameToSearch[0],
                level: hierachyColLevel,
                children: [

                ]
            };

            arr.push(orgUnit);
            tableOrgs.push(orgUnit);
            return arr;
        }
        for (let i = 0; i < orgsNameToSearch.length - 1; i++) { //leave out last orgunit name as it is picked by inner loop for adding to tree
            if (arr != undefined) {
                arr.map((item) => {

                    if (item.name == orgsNameToSearch[i]) {

                        let nextSubSring = '';
                        let firstLoop = true;
                        for (let y = i + 1; y < orgsNameToSearch.length; y++) {
                            if (firstLoop) {
                                nextSubSring = orgsNameToSearch[y];
                                firstLoop = false;
                            } else {
                                nextSubSring = nextSubSring + '$' + orgsNameToSearch[y];
                            }

                        }

                        arr = this.orgUnitStructureMaker(item.children, nextSubSring, hierachyColLevel,tableOrgs);
                    }
                });
            }

        }

    }

    createOrgTree() {
        let tableOrgs = [
            {
                id: 0,
                name: "Kenya",
                level: 1,
                children: [

                ]
            },
        ];
        let orgUnitStructure = [
            {
                id: 0,
                name: "Kenya",
                level: 1,
                children: [

                ]
            }
        ];

        if (this.props.sheetWithOrgs && this.props.orgunitExcelFileHierachy) {
            
            let orgunitExcelFileHierachy = this.props.orgunitExcelFileHierachy;
            // console.log(orgunitExcelFileHierachy);
            // const sortedOrgunitExcelFileHierachy = new Map([...Object.entries(orgunitExcelFileHierachy)].sort());
            const sortedOrgunitExcelFileHierachy = new Map([...Object.entries(orgunitExcelFileHierachy)].sort((a, b) => a[1] - b[1]));
            let sheetName = this.props.sheetWithOrgs;
            let sheet = this.props.workbook.Sheets[sheetName];
            let range = XLSX.utils.decode_range(sheet['!ref']); // get the range
            let orgUnitsProcessed = [];
            for (var R = range.s.r; R <= range.e.r; ++R) {

                let rowValues = new Map();

                for (var C = range.s.c; C <= range.e.c; ++C) {
                    var cellref = XLSX.utils.encode_cell({ c: C, r: R }); // construct A1 reference for cell
                    if (!sheet[cellref]) continue; // if cell doesn't exist, move on
                    var cell = sheet[cellref];
                    rowValues[C] = cell.v
                }

                // console.log(sortedOrgunitExcelFileHierachy);
                for (const [hierachyCol, hierachyColLevel] of sortedOrgunitExcelFileHierachy.entries()) {
                    if (rowValues[hierachyCol] != undefined) {
                        if (hierachyColLevel == 2) {
                            if (!orgUnitsProcessed.includes(rowValues[hierachyCol])) { //contains second level org unit hierachy
                                let orgUnit = {
                                    id: rowValues[hierachyCol],
                                    name: rowValues[hierachyCol],
                                    level: 2,
                                    children: [

                                    ]
                                }
                                orgUnitStructure[0].children.push(orgUnit); //second level orgunits
                                tableOrgs.push(orgUnit);
                                orgUnitsProcessed.push(rowValues[hierachyCol]);
                            }
                        } else {

                            let currentOrgName = '';
                            let intialLoop = true;
                            for (const [col, roow] of sortedOrgunitExcelFileHierachy.entries()) { //construct name of current orgunit
                                if (intialLoop) {
                                    intialLoop = false;
                                    currentOrgName = rowValues[col];
                                } else {
                                    currentOrgName = currentOrgName + '$' + rowValues[col];
                                }
                                if (col == hierachyCol) {
                                    break;
                                }
                            }
                            if (orgUnitsProcessed.includes(currentOrgName)) {
                                continue;
                            } else {
                                // console.log("level two =>" + currentOrgName);
                                this.orgUnitStructureMaker(orgUnitStructure[0].children, currentOrgName, hierachyColLevel,tableOrgs);
                                orgUnitsProcessed.push(currentOrgName);
                            }
                        }
                    }
                }
            }
            return [orgUnitStructure,tableOrgs];
            // console.log(orgUnitsProcessed);

        }else{
            return [orgUnitStructure,tableOrgs];
        }
    }

    render() {
        let orgs = this.createOrgTree();
        let orgUnitStructure =orgs[0];
        let tableOrgs = orgs[1];
        const columns = [
            {
                name: "Org Unit Name",
                selector: "name",
                sortable: true
            },
            {
                name: "Org Level",
                selector: "level",
                sortable: true
            }
        ];

        return (
            <React.Fragment>
                <div className="row">
                    <div style={{ "overflow": "scroll", "maxHeight": "700px", "minHeight": "500px", "paddingBottom": "6px", "paddingRight": "16px" }} className="col-sm-3">
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

}

export default OrgunitStructureCreate;

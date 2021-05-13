import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import TreeView from '../../utils/TreeView';
import OrgunitCreate from './CreateOrgunits';
import DataTable from "react-data-table-component";
import { FetchOrgunits, OrgUnitStructureMaker } from '../../utils/Helpers';

let httpOrgUnits = [];

let tableOrgs = [
    {
        id: 0,
        name: "Kenya",
        level: 1,
        parentId: 0,
        children: [

        ]
    }
];

function developOrgStructure(orunitData) {

    orunitData.metadata.levels.map(hierchayLevel => {
        // console.log(orunitData.payload);
        let kenya = orunitData.payload[0].filter(orgUnit => orgUnit.name == 'Kenya');
        tableOrgs[0]['id'] = kenya.org_unit_id;
        let orgUnits = orunitData.payload[0].filter(orgUnit => orgUnit.level == hierchayLevel); //access sorted values by level asc
        orgUnits.map((orgUnitToAdd) => {
            if (orgUnitToAdd.level == 2) {
                let orgUnit = {
                    id: orgUnitToAdd.org_unit_id,
                    name: orgUnitToAdd.odk_unit_name,
                    level: orgUnitToAdd.level,
                    parentId: orgUnitToAdd.parent_id,
                    updatedAt: orgUnitToAdd.updated_at,
                    children: [
                    ]
                };
                tableOrgs[0].children.push(orgUnit);
            } else {
                OrgUnitStructureMaker(tableOrgs, orgUnitToAdd);
            }

        });

    });
}

function Orgunit() {

    const [showOrgunitLanding, setShowOrgunitLanding] = useState(true);
    const [tableOrgsStruct, setTableOrgsStruct] = useState();
    (async () => {
        if (httpOrgUnits.length == 0) {
            httpOrgUnits = await FetchOrgunits();
            developOrgStructure(httpOrgUnits);
            setTableOrgsStruct(httpOrgUnits); ///save to state
        }
    })();

    const imgStyle = {
        width: "100%"
    };

    const rowStle = {
        marginBottom: "5px"
    };

    const columns = [
        {
            name: "Org Unit Name",
            selector: "odk_unit_name",
            sortable: true
        },
        {
            name: "Org Level",
            selector: "level",
            sortable: true
        },
        {
            name: "Last updated",
            selector: "updated_at",
            sortable: true
        }
    ];
   
    let pageContent = '';
    let tableEl = <></>;
    if (httpOrgUnits.length != 0) {
        tableEl = <DataTable
            title="Organisation Unit"
            columns={columns}
            data={httpOrgUnits.payload[0]}
            defaultSortFieldId={1}
            pagination
            selectableRows
        />
    }


    if (showOrgunitLanding) {
        pageContent = <React.Fragment>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h4 mb-0 text-gray-500">Organisation Unit Management</h1>
                <a href="#" onClick={() => setShowOrgunitLanding(false)} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-sitemap fa-sm text-white-50"></i> Create Organisation Unit</a>
            </div>
            <div className="row">
                <div style={{ "overflow": "scroll", "maxHeight": "700px", "minHeight": "500px", "paddingBottom": "6px", "paddingRight": "16px" }} className="col-sm-3">
                    <TreeView orgUnits={tableOrgs} />
                </div>
                <div className="col-sm-9">
                    {tableEl}
                </div>
            </div>

        </React.Fragment>

    } else {
        pageContent = <OrgunitCreate
            setShowOrgunitLanding={setShowOrgunitLanding}
        />;
    }

    return <React.Fragment>
        {pageContent}
    </React.Fragment>
}

export default Orgunit;

if (document.getElementById('orgunits')) {
    ReactDOM.render(<Orgunit />, document.getElementById('orgunits'));
}
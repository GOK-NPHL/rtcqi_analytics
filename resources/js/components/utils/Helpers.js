import { settings } from './Settings'

const axios = require('axios');

let cache = {
    orgunitList: null,
}

export async function FetchOrgunits() {
    if (cache.orgunitList == null) {
        let response;
        try {
            response = await axios.get(`${settings.rtcqiBaseApi}/org_units`);
            const orgunitList = response.data;
            cache.orgunitList = orgunitList;
            return orgunitList;
        } catch (err) {
            console.error(err);
            return response;
        }

    } else {
        return cache.orgunitList;
    }

}

export async function FetchOdkData(orgUnitIds, orgTimeline, siteType) {
    try {
        const response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/odk_data`,
            data: {
                orgUnitIds: orgUnitIds,
                orgTimeline: orgTimeline,
                siteType: siteType
            }
        });
        return response;
    } catch (err) {
        return err.response
    }

}

export async function FetchRoles() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/roles`);
        const rolesList = response.data;
        return rolesList;
    } catch (err) {
        // Handle Error Here
        return err.response
    }

}

export async function FetchAuthorities() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/authorities`);
        const authoritiesList = response.data;
        return authoritiesList;
    } catch (err) {
        // Handle Error Here
        return err.response
    }

}

export async function SaveRole(roleName, authoritiesSelected) {
    try {
        const response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/save_role`,
            data: {
                name: roleName,
                authoritiesSelected: authoritiesSelected
            }
        });
        console.log("saved role");
    } catch (err) {
        // Handle Error Here
        console.log(err);
        return err.response
    }
}

export async function DeleteRole(roleId) {
    let response = '';
    try {
        response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/delete_role`,
            data: {
                role_id: roleId,
            }

        });
        return response;
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}


export async function UpdateRole(role_id, roleName, authoritiesSelected) {
    try {
        const response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/update_role`,
            data: {
                role_id: role_id,
                name: roleName,
                authoritiesSelected: authoritiesSelected
            }
        });
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}

export async function SaveOrgUnits(orgUnits, orgunitMetadata) {
    let response;
    try {
        response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/save_orgunits`,
            data: {
                orgunits: orgUnits,
                orgunit_metadata: orgunitMetadata,
            }
        });
        return response;
    } catch (err) {
        return err.response
    }
}


export async function UpdateOrg(org_unit_id, name) {
    try {
        const response = await axios({
            method: 'put',
            url: `${settings.rtcqiBaseApi}/update_org`,
            data: {
                id: org_unit_id,
                name, name
            }
        });
        return response.data.Message;
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}

export async function DeleteOrg(org) {
    try {
        const response = await axios({
            method: 'delete',
            url: `${settings.rtcqiBaseApi}/delete_org`,
            data: {
                org: org,
            }
        });
        console.log(response);
        return response;
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}

export async function AddSubOrg(org, name) {

    let response;
    try {
        response = await axios({
            method: 'put',
            url: `${settings.rtcqiBaseApi}/add_sub_org`,
            data: {
                parent_org: org,
                child_org: name
            }
        });
        console.log(response);
        return response;
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}

export async function Saveuser(first_name, last_name, email, password, orgunits, role) {
    try {
        let orgsId = [];
        for (const [key, value] in Object.entries(orgunits)) {
            orgsId.push(key);
        }
        const response = await axios({
            method: 'put',
            url: `${settings.rtcqiBaseApi}/save_user`,
            data: {
                name: first_name,
                last_name: last_name,
                email: email,
                password: password,
                orgunits: orgsId,
                role: role
            }
        });
        return response;
    } catch (err) {
        // Handle Error Here
        console.log(err);
        return err.response
    }
}


export async function FetchUsers() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/users`);
        const userList = response.data;
        return userList;
    } catch (err) {
        // Handle Error Here
        return err.response
    }

}

export async function DeleteUser(user) {
    try {
        const response = await axios({
            method: 'delete',
            url: `${settings.rtcqiBaseApi}/delete_user`,
            data: {
                user: user,
            }
        });
        return response;
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}

function OrgUnitStructureMaker(arr, orgUnitToAdd) {
    if (arr != undefined) {

        arr.map((item) => {
            // if (item.level != 1) { //skip country org

            if (item.id == orgUnitToAdd.parent_id) {

                let orgUnit = {
                    id: orgUnitToAdd.org_unit_id,
                    name: orgUnitToAdd.odk_unit_name,
                    level: orgUnitToAdd.level,
                    parentId: orgUnitToAdd.parent_id,
                    updatedAt: orgUnitToAdd.updated_at,
                    children: [
                    ]
                };
                item.children.push(orgUnit);
            } else {
                arr = OrgUnitStructureMaker(item.children, orgUnitToAdd);
            }
            // }
        });
    }
}

export function DevelopOrgStructure(orunitData) {

    let tableOrgs = [
        // {
        //     id: 0,
        //     name: "Kenya",
        //     level: 1,
        //     parentId: 0,
        //     children: [

        //     ]
        // }
    ];

    let kenya = orunitData.payload[0].filter(orgUnit => orgUnit.org_unit_id == 0)[0];
    console.log(kenya);
    let orgUnit = {
        id: kenya.org_unit_id,
        name: kenya.odk_unit_name,
        level: kenya.level,
        parentId: kenya.parent_id,
        updatedAt: kenya.updated_at,
        children: [
        ]
    };
    tableOrgs.push(orgUnit);
    orunitData.metadata.levels.map(hierchayLevel => {
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
            } else if (orgUnitToAdd.level > 2) {
                OrgUnitStructureMaker(tableOrgs, orgUnitToAdd);
            }

        });

    });
    return tableOrgs;
}
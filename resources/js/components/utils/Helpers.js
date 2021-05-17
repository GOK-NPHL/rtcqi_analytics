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


export async function FetchOdkData2(county, subcounty, facility, site) {

    let dataUrl = `${settings.rtcqiBaseApi}/odk_data/${county}/${subcounty}/${facility}/${site}`;
    const _dataObject = await fetch(dataUrl);
    const dataObject = await _dataObject.json();
    return dataObject;

}


export async function FetchOdkData(county, subcounty, facility, site) {

    try {
        const response = await axios({
            method: 'get',
            url: `${settings.rtcqiBaseApi}/odk_data/${county}/${subcounty}/${facility}/${site}`,
            // data: {
            //   firstName: 'Fred',
            //   lastName: 'Flintstone'
            // }
        });
        const dataObject = response.data;
        return dataObject;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }

}

export async function FetchRoles() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/roles`);
        const rolesList = response.data;
        return rolesList;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }

}

export async function FetchAuthorities() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/authorities`);
        const authoritiesList = response.data;
        return authoritiesList;
    } catch (err) {
        // Handle Error Here
        console.error(err);
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
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
}

export async function DeleteRole(roleId) {
    try {
        const response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/delete_role`,
            data: {
                role_id: roleId,
            }
        });
    } catch (err) {
        // Handle Error Here
        console.error(err);
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
        console.error(err);
    }
}

export async function SaveOrgUnits(orgUnits) {
    let response;
    try {
        response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/save_orgunits`,
            data: {
                orgunits: orgUnits,
            }
        });
        return response;
    } catch (err) {
        return response;
    }
}


export async function UpdateOrg(org) {
    try {
        const response = await axios({
            method: 'put',
            url: `${settings.rtcqiBaseApi}/update_org`,
            data: {
                org: org,
            }
        });
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
}


export function OrgUnitStructureMaker(arr, orgUnitToAdd) {
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
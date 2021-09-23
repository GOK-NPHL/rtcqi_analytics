import { settings } from './Settings'

const axios = require('axios');

let cache = {
    orgunitList: null,

}

export async function FetchOrgunits() {
    let cacheOrgUnit = localStorage.getItem("orgunitList");
    if (cacheOrgUnit == null || JSON.parse(cacheOrgUnit).payload[0].length == 0) {
        let response;
        try {
            response = await axios.get(`${settings.rtcqiBaseApi}/org_units`);
            const orgunitList = response.data;
            localStorage.setItem("orgunitList", JSON.stringify(orgunitList));
            return orgunitList;
        } catch (err) {
            console.error(err);
            return response;
        }
    } else {
        return JSON.parse(cacheOrgUnit);
    }
}

export async function FetchOdkData(orgUnitIds, orgTimeline, siteType, startDate, endDate) {
    try {
        const response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/odk_data`,
            data: {
                orgUnitIds: orgUnitIds,
                orgTimeline: orgTimeline,
                siteType: siteType,
                startDate: startDate,
                endDate: endDate
            }
        });
        return response;
    } catch (err) {
        return err.response
    }

}

export async function FetchOdkHTSData(orgUnitIds, siteType, startDate, endDate) {
    try {
        const response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/odk_hts_data`,
            data: {
                orgUnitIds: orgUnitIds,
                siteType: siteType,
                startDate: startDate,
                endDate: endDate
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

export async function FetchUserAuthorities() {

    try {
        let response = await axios.get(`${settings.rtcqiBaseApi}/user_authorities`);
        return response.data;
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
        return response;
        //console.log("saved role");
    } catch (err) {
        // Handle Error Here
        //console.log(err);
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
        return response;
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
export async function updateUploadOrgUnits(orgUnits, orgunitMetadata) {
    let response;
    try {
        response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/update_upload_orgunits`,
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
        localStorage.removeItem('orgunitList');
        localStorage.removeItem('treeStruc');
        return response.data.Message;
    } catch (err) {
        // Handle Error Here
        err.response
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
        //console.log(response);
        return response;
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}

export async function DeleteAllOrgs() {
    try {

        const response = await axios({
            method: 'delete',
            url: `${settings.rtcqiBaseApi}/delete_all_orgs`
        });
        localStorage.removeItem('orgunitList');
        localStorage.removeItem('treeStruc');
        localStorage.removeItem("orgunitTableStruc");
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
        //console.log(response);
        return response;
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}

export async function RequestNewOrgnit(parentOrgunitId, orgunitName) {

    let response;
    try {
        response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/request_new_orgnit`,
            data: {
                parent_orgunit_id: parentOrgunitId,
                orgunit_name: orgunitName
            }
        });
        return response;
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}

export async function FetchRequestedNewOrgs(userId) {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/get_requested_org_units`);
        const requestedNewOrgs = response.data;
        return requestedNewOrgs;
    } catch (err) {
        // Handle Error Here
        return err.response
    }
}

export async function Saveuser(first_name, last_name, email, password, orgunits, role, selectedViewableRoles) {

    try {
        let orgsId = [];
        for (const [key, value] of Object.entries(orgunits)) {
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
                role: role,
                selected_viewable_roles: selectedViewableRoles
            }
        });
        return response;
    } catch (err) {
        // Handle Error Here
        //console.log(err);
        return err.response
    }
}

export async function Updateuser(first_name, last_name, email, password, orgunits, role, userId, selectedViewableRoles) {

    try {
        let orgsId = [];
        for (const [key, value] of Object.entries(orgunits)) {
            orgsId.push(key);
        }

        let data = {
            name: first_name,
            last_name: last_name,
            email: email,
            password: password,
            orgunits: orgsId,
            role: role,
            user_id: userId,
            selected_viewable_roles: selectedViewableRoles
        };
        const response = await axios.put(`${settings.rtcqiBaseApi}/update_user`, data, {});
        return response;

    } catch (err) {
        // Handle Error Here
        //console.log(err);
        return err.response
    }
}


export async function FetchUserDetails(userId) {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/users_details?id=${userId}`);
        const userDetails = response.data;
        return userDetails;
    } catch (err) {
        // Handle Error Here
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

export async function FetchUserProfile() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/get_user_profile`);
        const userProfile = response.data;
        return userProfile;
    } catch (err) {
        // Handle Error Here
        return err.response
    }

}

export async function updateUserProfile(first_name, last_name, email, password) {
    try {
        const response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/update_user_profile`,
            data: {
                name: first_name,
                last_name: last_name,
                email: email,
                password: password
            }
        });
        return response;
    } catch (err) {
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
function uuidCompare(one, c) {
    return one.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function OrgUnitStructureMaker(arr, orgUnitToAdd, processedItems) {

    let orgUnit = {
        id: orgUnitToAdd.org_unit_id,
        name: orgUnitToAdd.odk_unit_name,
        level: orgUnitToAdd.level,
        parentId: orgUnitToAdd.parent_id,
        updatedAt: orgUnitToAdd.updated_at,
        children: [
        ]
    };

    if (arr.length != 0) {

        try {
            let parentOrg = processedItems[orgUnitToAdd.parent_id]
            parentOrg.children.push(orgUnit);
            processedItems[orgUnitToAdd.org_unit_id] = orgUnit;
        } catch (err) {
            arr.push(orgUnit);
            processedItems[orgUnitToAdd.org_unit_id] = orgUnit;
        }

    } else {
        arr.push(orgUnit);
        processedItems[orgUnitToAdd.org_unit_id] = orgUnit;
    }

}

export function DevelopOrgStructure(orunitData) {
    let cacheOrgUnit = localStorage.getItem("orgunitTableStruc");
    if (cacheOrgUnit == null) {
        let tableOrgs = [];
        let processedItems = {};

        orunitData.payload[0].map((orgUnitToAdd) => {
            //console.log("new way")
            OrgUnitStructureMaker(tableOrgs, orgUnitToAdd, processedItems);

        });

        try {
            localStorage.setItem("orgunitTableStruc", JSON.stringify(tableOrgs));
        } catch (err) {

        }
        return tableOrgs;
    } else {
        return JSON.parse(cacheOrgUnit);
    }

}
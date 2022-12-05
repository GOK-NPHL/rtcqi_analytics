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

export async function FetchOdkData(orgUnitIds, orgTimeline, siteType, startDate, endDate, partners
    // , aggregate_partners
    ) {
    try {
        const response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/odk_data`,
            data: {
                orgUnitIds: orgUnitIds,
                orgTimeline: orgTimeline,
                siteType: siteType,
                startDate: startDate,
                endDate: endDate,
                partners: partners,
                // aggregate_partners: aggregate_partners
            }
        });
        return response;
    } catch (err) {
        return err.response
    }

}

// function to split a string by numbers and letters
export function splitByNumbersAndLetters(str) {
    var re = /(\d+|\D+)/g;
    return str.split(re);
}

export function separateOrgUnitAndSite(str, delimiter) {
    let r = str.replace("pmtct", delimiter + "pmtct")
        .replace("lab", delimiter + "lab")
        .replace("vct", delimiter + "vct")
        .replace("opd", delimiter + "opd")
        .replace("ccc", delimiter + "ccc")
        .replace("pitc", delimiter + "pitc")
        .replace("ipd", delimiter + "ipd")
        .replace("vmmc", delimiter + "vmmc")
        .replace("yfc", delimiter + "yfc")
        .replace("psc", delimiter + "psc")
        .replace("pediatric", delimiter + "pediatric")
        .replace("paediatric", delimiter + "paediatric")
    .split(/[^A-Za-z]/).slice(1).join(" ").trim("");
    if(r.includes("      ")){
        return r.split("      ")[1] || r;
    }else{
        return r;
    }
}

export function exportToExcel(bundle, filename) {
    console.log('Exporting to Excel');
    if (!filename || filename == '' || filename == null || filename == undefined) {
        filename = 'data';
    }
    // let bundle = this.state.data
    if (bundle.length > 0) {
        let csv = '';
        filename = filename + '-' + new Date().toLocaleDateString().split('/').join('_') + '.csv'
        let keys = Object.keys(bundle[0])//.map(key => key.split('_').join(' '));
        csv += keys.join(',') + '\r\n';
        bundle.forEach(item => {
            csv += keys.map(key => item[key]).join(',') + '\r\n';
        });
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            if (document && document.createElement) {
                let link = document.createElement("a");
                if (link.download !== undefined) { // feature detection
                    // Browsers that support HTML5 download attribute
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", filename);
                } else {
                    link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
                }
                link.style.visibility = 'hidden';
                // link.textContent = 'Download '+filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } else {
                if (window && window.open) {
                    window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
                }
            }
        }
        console.log('Exported to Excel');
    } else {
        console.log('No data to export');
        alert('No data to export');
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
export async function FetchSubmissions(orgUnitIds, siteType, startDate, endDate, page, perPage) {
    // console.log('Fetching Submissions page: ' + page + ' perPage: ' + perPage);
    try {
        const response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/odk_submissions`,
            data: {
                orgUnitIds: orgUnitIds,
                siteType: siteType,
                startDate: startDate,
                endDate: endDate,
                page: page || 1,
                perPage: perPage || 50
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
export async function FetchAllFiles() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/resources/files_all`);
        const flList = response.data;
        return flList;
    } catch (err) {
        return err.response
    }
}
export async function FetchPublicFiles() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/resources/files_public`);
        const pbFlst = response.data;
        return pbFlst;
    } catch (err) {
        return err.response
    }
}
export async function FetchPrivateFiles() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/resources/files_private`);
        const prvFlst = response.data;
        return prvFlst;
    } catch (err) {
        return err.response
    }
}

export async function SaveFile(payload, isPub = false) {
    let response;
    try {
        const formData = new FormData();
        formData.append('file', payload);
        formData.append('isPublic', isPub);
        response = await axios.post(`${settings.rtcqiBaseApi}/resources/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (err) {
        return err.response
    }
}

export async function DeleteFile(fileId) {
    let response;
    try {
        response = await axios({
            method: 'delete',
            url: `${settings.rtcqiBaseApi}/resources/files/${fileId}`,
        });
        return response;
    } catch (err) {
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



export async function FetchPartners() {

    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/partners`);
        const partners = response.data;
        return partners;
    } catch (err) {
        return err.response
    }
}
export async function FetchPartner(id) {
    try {
        const response = await axios.get(`${settings.rtcqiBaseApi}/partners/${id}`);
        const partner = response.data;
        return partner;
    } catch (err) {
        return err.response
    }
}
export async function SavePartner(partner) {
    let response;
    try {
        response = await axios({
            method: 'post',
            url: `${settings.rtcqiBaseApi}/partners`,
            data: {
                ...partner
            }
        });
        return response;
    } catch (err) {
        return err.response
    }
}

export async function UpdatePartner(partner) {
    let response;
    try {
        response = await axios({
            method: 'put',
            url: `${settings.rtcqiBaseApi}/partners/${partner.id}`,
            data: {
                ...partner
            }
        });
        return response;
    } catch (err) {
        return err.response
    }
}

export async function DeletePartner(id) {
    let response;
    try {
        response = await axios({
            method: 'delete',
            url: `${settings.rtcqiBaseApi}/partners/${id}`,
        });
        return response;
    } catch (err) {
        return err.response
    }
}

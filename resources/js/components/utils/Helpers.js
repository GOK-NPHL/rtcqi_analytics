import { settings } from './Settings'

const axios = require('axios');

let cache = {
    orgunitList: null,
}

export async function FetchOrgunits() {
    if (cache.orgunitList == null) {

        try {
            const response = await axios.get(`${settings.rtcqiBaseApi}/org_units`);
            const orgunitList = response.data;
            cache.orgunitList = orgunitList;
            return orgunitList;
        } catch (err) {
            // Handle Error Here
            console.error(err);
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
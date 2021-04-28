import { settings } from './Settings'


let cache = {
    orgunitList: null,
}

export async function FetchOrgunits() {
    if (cache.orgunitList == null) {
        let orgunitListUrl = `${settings.rtcqiBaseApi}/org_units`;
        const _orgunitList = await fetch(orgunitListUrl);
        const orgunitList = await _orgunitList.json();
        cache.orgunitList = orgunitList;
        return orgunitList;
    } else {
        return cache.orgunitList;
    }
}

export async function FetchOdkData(county, subcounty, facility, site) {

    let dataUrl = `${settings.rtcqiBaseApi}/get_odk_data/${county}/${subcounty}/${facility}/${site}`;
    const _dataObject = await fetch(dataUrl);
    const dataObject = await __dataObject.json();
    return dataObject;

}
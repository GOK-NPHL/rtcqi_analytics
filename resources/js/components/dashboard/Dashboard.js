import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import LineGraph from '../utils/charts/LineGraph';
import RTCard from '../utils/RTCard';
import StackedHorizontal from '../utils/charts/StackedHorizontal'
import TopLabels from './TopLabels'
import { FetchUserAuthorities, FetchOrgunits, FetchOdkData } from '../utils/Helpers';
import SiteLevelBarColumnCharts from '../reports/spi/SiteLevelBarColumnCharts';
import SiteLevelBarCharts from '../reports/spi/SiteLevelBarCharts';
import OverallPerformanceRadar from '../reports/spi/OverallPerformanceRadar';
import CompletenessSummary from '../reports/spi/CompletenessSummary';
import StatsLabel from '../utils/stats/StatsLabel';

function Dashboard(props) {
    const [siteList, setSiteList] = useState([]);
    const [orgUnits, setOrgUnits] = useState([]);
    const [orgUnitDataIds, setOrgUnitDataIds] = useState([0]);
    const [orgUnitTimeline, setOrgUnitTimeline] = useState([]);
    const [siteType, setSiteType] = useState([]);
    const [echartsMinHeight, setEchartsMinHeight] = useState('');
    const [odkData, setOdkData] = useState([]);
    const [facilityCount, setFacilityCount] = useState(0);
    const [siteCount, setSiteCount] = useState(0);
    const [allowedPermissions, setAllowedPermissions] = useState([]);
    const [dataset1] = useState({
        dimensions: ['indicator', 'Baseline(Round 13)', 'Y1_Q4(round 14)', 'Y2_Q1(round 15)', 'Y2_Q2(round 16)'],
        source: [
            { indicator: 'Providers Enrolled', 'Baseline(Round 13)': 43.3, 'Y1_Q4(round 14)': 85.8, 'Y2_Q1(round 15)': 93.7, 'Y2_Q2(round 16)': 73.7 },
            { indicator: 'Providers With PT Results', 'Baseline(Round 13)': 83.1, 'Y1_Q4(round 14)': 73.4, 'Y2_Q1(round 15)': 55.1, 'Y2_Q2(round 16)': 78.7 },
            { indicator: 'Providers With Satisfactory Results', 'Baseline(Round 13)': 86.4, 'Y1_Q4(round 14)': 65.2, 'Y2_Q1(round 15)': 82.5, 'Y2_Q2(round 16)': 89.7 },
            { indicator: 'Providers That Received Corrective', 'Baseline(Round 13)': 72.4, 'Y1_Q4(round 14)': 53.9, 'Y2_Q1(round 15)': 39.1, 'Y2_Q2(round 16)': 47.7 }
        ]
    });
    const [series1] = useState([
        { type: 'bar' },
        { type: 'bar' },
        { type: 'bar' },
        { type: 'bar' }
    ]);
    const [series2] = useState([
        {
            name: 'Level 0 (<40%)',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [24, 23, 56, 34, 32]
        },
        {
            name: 'Level 1  (40-59%)',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [55, 67, 22, 76, 67]
        },
        {
            name: 'Level 2 (60-79%)',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [66, 32, 56, 87, 32]
        },
        {
            name: 'Level 3 (80-89%)',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [78, 11, 34, 75, 23]
        },
        {
            name: 'Level 4 (>90%)',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [10, 45, 56, 76, 32]
        }
    ]);
    const [unfilteredOrgUnits, setUnfilteredOrgUnits] = useState(null);
    const [orgLevel, setOrgLevel] = useState(null);
    const [orgId, setOrgId] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    function fetchOdkDataServer(orgUnitIds, orgTimeline, siteTypeArg, startDateArg, endDateArg) {
        if (orgUnitIds) {
            if (orgUnitIds.length != 0) {
                (async () => {
                    let returnedData = await FetchOdkData(orgUnitIds, orgTimeline, siteTypeArg, startDateArg, endDateArg);
                    if (returnedData.status == 200) {
                        setOdkData(returnedData.data);
                        setFacilityCount(returnedData?.data[orgUnitIds[0]]?.facilityCount || 0);
                        setSiteCount(returnedData?.data[orgUnitIds[0]]?.siteCount || 0);
                    }
                })();
            }
        }
    }

    function updateSites(sites) {
        if (sites && sites.length > 0) {
            setSiteList(sites);
            if (typeof window != 'undefined') {
                document.getElementById('siteListTrigger').click();
            }
        }
    }

    useEffect(() => {
        (async () => {
            let perms = await FetchUserAuthorities();
            let returnedData = await FetchOrgunits();
            let orgs = [];
            try {
                orgs = returnedData.payload[0];
            } catch (err) {
            }
            setUnfilteredOrgUnits(returnedData);
            setOrgUnits(orgs);
            setOdkData([]);
            setOrgLevel(1);
            setOrgId(1);
            setAllowedPermissions(perms);

            let defaultOrg = -1;
            try {
                defaultOrg = [returnedData.payload[0][0]['org_unit_id']];
            } catch (err) {
            }

            fetchOdkDataServer(defaultOrg, [], [], null, null);
        })();
    }, []);

    let dashBoardContent = '';
    if (allowedPermissions.length > 0 &&
        allowedPermissions.includes('view_dashboard')) {

        dashBoardContent = <React.Fragment>

            {/* Page Heading */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4 w-100">
                <div className="row w-100">
                    <div className="col-md-6 p-0">
                        <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
                    </div>
                    <div className="col-md-3 p-0 text-center px-2">
                        <div className="card" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <label className='mb-0'> Facilities: </label> &nbsp; &nbsp;
                                <b style={{color: 'black', fontSize: '1.3em'}}>{Intl.NumberFormat().format(facilityCount)}</b>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 p-0 text-center px-2">
                        <div className="card" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <label className='mb-0'> Sites: </label> &nbsp; &nbsp;
                                <b style={{color: 'black', fontSize: '1.3em'}}>{Intl.NumberFormat().format(siteCount)}</b>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-download fa-sm text-white-50"></i> Generate Report</a> */}
            </div>

            <div className="row">
                <div className="col-md-12 p-0">
                    <TopLabels serverData={odkData} />
                </div>
            </div>
            <div className="row">
                <OverallPerformanceRadar singleItem={true} minHeight={500} setMinHeight={true} serverData={odkData} siteType={siteType} />
                <SiteLevelBarColumnCharts singleItem={true} minHeight={510} serverData={odkData} siteType={siteType} />
                {/* ------- <completeness ------- */}
                <div className='col-md-12'>
                    {odkData.length > 0 && odkData.map((j, k) => {
                        let dataObject = j;
                        if (dataObject && Object.keys(dataObject).length < 1) {
                            return (<React.Fragment key={j}></React.Fragment>)
                        } else {
                            let orgName = dataObject['orgName'];
                            let overallSitesLvl = dataObject["OverallSitesLevel"];
                            let fllow = Object.keys(overallSitesLvl).sort((a, b) => {
                                // reverse alphabetical order
                                if (a < b) return 1;
                                if (a > b) return -1;
                                return 0;
                            });
                            let data = [];
                            fllow.forEach((fl) => {
                                let fl_lower_levels = fllow.filter((f) => fllow.indexOf(f) > fllow.indexOf(fl))
                                let fl_sites = overallSitesLvl[fl]?.sites;
                                let fl_sites_found_in_lower_levels = [];
                                let fl_sites_not_found_in_lower_levels = [];
                                if (fl_sites && fl_sites.length > 0) {
                                    fl_sites.forEach((fl_site) => {
                                        let found = false;
                                        fl_lower_levels.forEach((fl_lower_level) => {
                                            if (overallSitesLvl[fl_lower_level].sites.find((site) => site.mfl == fl_site.mfl && site.site == fl_site.site)) {
                                                found = true;
                                            }
                                        });
                                        if (found) {
                                            fl_sites_found_in_lower_levels.push(fl_site);
                                        } else {
                                            fl_sites_not_found_in_lower_levels.push(fl_site);
                                            // TODO: add attribute to fl_site to indicate the level it was not found in
                                        }
                                    });
                                }
                                let d = {
                                    followup: fl,
                                    sites: fl_sites,
                                    fl_sites_found_in_lower_levels: fl_sites_found_in_lower_levels,
                                    fl_sites_not_found_in_lower_levels: fl_sites_not_found_in_lower_levels
                                };
                                data.push(d);
                            });
                            return (
                                <React.Fragment key={k}>
                                    {/* <ReactJson src={data} displayDataTypes={false} indentWidth={4} /> */}
                                    <CompletenessSummary data={data} />
                                </React.Fragment>
                            )
                        }
                    })}
                </div>
                {/* ------- completeness/> ------- */}
                <SiteLevelBarCharts singleItem={true} minHeight={510} serverData={odkData} siteType={siteType} />
            </div>
        </React.Fragment>
    }

    return (
        <React.Fragment>
            {dashBoardContent}
            {unfilteredOrgUnits ? '' : <p style={{ "color": "red" }}>You have no orgunits attached</p>}
        </React.Fragment>
    );
}

export default Dashboard;

if (document.getElementById('dashboard')) {
    createRoot(document.getElementById('dashboard')).render(<Dashboard />);
}

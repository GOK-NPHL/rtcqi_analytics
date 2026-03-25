import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { FetchOrgunits, FetchOdkData, exportToExcel, FetchPartners } from '../../utils/Helpers';
import OrgUnitButton from '../../utils/orgunit/orgunit_button';
import OrgDate from '../../utils/orgunit/OrgDate';
import { v4 as uuidv4 } from 'uuid';
import OrgTimeline from '../../utils/orgunit/OrgTimeline';
import OrgUnitType from '../../utils/orgunit/OrgUnitType';
import SiteLevelBarColumnCharts from './SiteLevelBarColumnCharts';
import OverallPerformanceRadar from './OverallPerformanceRadar';
import { CSVLink } from "react-csv";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SpiOrgUnitIndicator from '../../utils/orgunit/SpiOrgUnitIndicator';

const orgUnitIndicators = [
    'Average Performance per QA element',
    'Overall Site Levels during Assessment',
];

function getTimelineAndOrgunits(orgUnitSpiData) {
    let timeLines = [];
    let orgunitName = '';
    for (let [key, val] of Object.entries(orgUnitSpiData)) {
        if (key !== 'OverallSitesLevel' && key !== 'orgName' && key !== 'OrgUniType') {
            for (let [timeline] of Object.entries(val)) {
                if (!timeLines.includes(timeline)) timeLines.push(timeline);
            }
        } else if (key === 'orgName') {
            orgunitName = val.toUpperCase();
        }
    }
    return [timeLines, orgunitName];
}

function SpiReport() {
    const [orgUnitDataIds, setOrgUnitDataIds] = useState([0]);
    const [partners, setPartners] = useState([]);
    const [aggregatePartners, setAggregatePartners] = useState(false);
    const [orgUnitTimeline, setOrgUnitTimeline] = useState([]);
    const [siteType, setSiteType] = useState([]);
    const [echartsMinHeight, setEchartsMinHeight] = useState('');
    const [indicatorIndexToDisplay, setIndicatorIndexToDisplay] = useState(0);
    const [allPartners, setAllPartners] = useState([]);
    const [odkData, setOdkData] = useState({});
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [nModal, setNModal] = useState(null);

    const aggregateDataForPartners = useCallback((data, currentPartners, currentAllPartners) => {
        if (currentPartners && currentPartners.length > 0) {
            let partner_name = '';
            if (currentAllPartners.length > 0) {
                partner_name = currentAllPartners.find(p => p.id == currentPartners[0])?.name || '';
            }
            let aggregated_data = { "orgName": partner_name };
            let org_count = Object.keys(data).length || 1;
            Object.keys(data).forEach((orgId, ky) => {
                let org_data = data[orgId];
                Object.keys(org_data).forEach((indicator) => {
                    if (indicator === 'orgName') return;
                    let indicator_data = org_data[indicator];
                    if (aggregated_data[indicator] === undefined) {
                        aggregated_data[indicator] = indicator_data;
                    } else {
                        if (typeof indicator_data === 'object') {
                            Object.keys(indicator_data).forEach((key) => {
                                if (aggregated_data[indicator][key] === undefined) {
                                    aggregated_data[indicator][key] = indicator_data[key];
                                } else {
                                    if (typeof aggregated_data[indicator][key] === 'number') {
                                        aggregated_data[indicator][key] = parseInt(aggregated_data[indicator][key]) + parseInt(indicator_data[key]);
                                        if (org_count === ky + 1) {
                                            aggregated_data[indicator][key] = aggregated_data[indicator][key] / org_count;
                                        }
                                    } else if (typeof aggregated_data[indicator][key] === 'string') {
                                        if (isNaN(aggregated_data[indicator][key])) {
                                            aggregated_data[indicator][key] = aggregated_data[indicator][key] + ', ' + indicator_data[key];
                                        } else {
                                            aggregated_data[indicator][key] = parseInt(aggregated_data[indicator][key]) + parseInt(indicator_data[key]);
                                            if (org_count === ky + 1) {
                                                aggregated_data[indicator][key] = aggregated_data[indicator][key] / org_count;
                                            }
                                        }
                                    } else if (typeof aggregated_data[indicator][key] === 'object') {
                                        let new_val = {};
                                        Object.keys(aggregated_data[indicator][key]).forEach((k) => {
                                            new_val[k] = parseInt(aggregated_data[indicator][key][k]) + parseInt(indicator_data[key][k]);
                                            if (org_count === ky + 1) {
                                                new_val[k] = new_val[k] / org_count;
                                            }
                                        });
                                        aggregated_data[indicator][key] = new_val;
                                    }
                                }
                            });
                        } else if (typeof indicator_data === 'number') {
                            aggregated_data[indicator] = parseInt(aggregated_data[indicator]) + parseInt(indicator_data);
                            if (org_count === ky + 1) {
                                aggregated_data[indicator] = aggregated_data[indicator] / org_count;
                            }
                        }
                    }
                });
            });
            setOdkData({
                [currentPartners[0] || 'partner_' + Math.floor(Math.random() * 80)]: aggregated_data
            });
        }
    }, []);

    const fetchOdkDataServer = useCallback(async (orgUnitIds, orgTimeline, stType, sd, ed, currentPartners, currentAggregatePartners, currentAllPartners) => {
        if (!orgUnitIds || orgUnitIds.length === 0) return;
        const returnedData = await FetchOdkData(orgUnitIds, orgTimeline, stType, sd, ed, currentPartners, currentAggregatePartners);
        if (returnedData.status === 200) {
            if (currentAggregatePartners) {
                aggregateDataForPartners(returnedData.data, currentPartners, currentAllPartners);
            } else {
                setOdkData(returnedData.data);
            }
        }
    }, [aggregateDataForPartners]);

    useEffect(() => {
        (async () => {
            const [returnedData, fetchedPartners] = await Promise.all([FetchOrgunits(), FetchPartners()]);
            const defaultOrg = [returnedData.payload[0][0]['org_unit_id']];
            setOrgUnitDataIds(defaultOrg);
            setAllPartners(fetchedPartners);
            fetchOdkDataServer(defaultOrg, [], [], '', '', [], false, fetchedPartners);
        })();
    }, []);

    const onFilterButtonClick = () => {
        fetchOdkDataServer(orgUnitDataIds, orgUnitTimeline, siteType, startDate, endDate, partners, aggregatePartners, allPartners);
    };

    const addTableRows = useCallback((tableData, overaRowllSiteLevels, dataToParse, tableDataExport, tableOverallDataExport) => {
        for (let [, orgUnitSpiData] of Object.entries(dataToParse)) {
            let [timeLines, orgunitName] = getTimelineAndOrgunits(orgUnitSpiData);
            tableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={4} scope="row">
                        <strong>{orgunitName} {partners && partners.length === 1 && aggregatePartners && " (Aggregate)"}</strong>
                    </td>
                </tr>
            );
            tableDataExport.push([orgunitName, "", "", ""]);

            timeLines.forEach((timeline) => {
                let row = [];
                let exportRow = [];
                row.push(<td key={uuidv4()} scope="row">{timeline}</td>);
                exportRow.push(timeline);

                if (siteType != null && siteType.length !== 0) {
                    try {
                        row.push(<td key={uuidv4()} scope="row">{orgUnitSpiData['OrgUniType']}</td>);
                        exportRow.push(orgUnitSpiData['OrgUniType']);
                    } catch {}
                }

                for (let [indicator, data] of Object.entries(orgUnitSpiData)) {
                    if (indicator !== 'orgName' && indicator !== 'OverallSitesLevel') {
                        row.push(<td key={uuidv4()} scope="row">{data[timeline]}</td>);
                        exportRow.push(data[timeline]);
                    }
                }
                tableDataExport.push(exportRow);
                tableData.push(<tr key={uuidv4()}>{row}</tr>);
            });

            // Overall site levels rows
            try {
                overaRowllSiteLevels.push(
                    <tr key={uuidv4()}>
                        <td colSpan={5} style={{ wordWrap: "break-word", maxWidth: "150px" }}>
                            <strong>{orgUnitSpiData['orgName'].toUpperCase()}</strong>
                        </td>
                    </tr>
                );
            } catch {}

            try {
                tableOverallDataExport.push([orgUnitSpiData['orgName'].toUpperCase(), "", "", ""]);
            } catch {}

            timeLines.forEach((timeline) => {
                let row = [];
                let tableOverallDataExportRow = [];
                const sting = `${timeline} (N=${orgUnitSpiData["OverallSitesLevel"][timeline]['counter']})`;
                row.push(<td key={uuidv4()}>{sting}</td>);
                tableOverallDataExportRow.push(timeline);

                if (siteType != null && siteType.length !== 0) {
                    row.push(<td key={uuidv4()} scope="row">{orgUnitSpiData['OrgUniType']}</td>);
                    tableOverallDataExportRow.push(orgUnitSpiData['OrgUniType']);
                }

                for (let [key] of Object.entries(orgUnitSpiData)) {
                    if (key === "OverallSitesLevel") {
                        const level0 = orgUnitSpiData["OverallSitesLevel"][timeline]['level0'];
                        const level1 = orgUnitSpiData["OverallSitesLevel"][timeline]['level1'];
                        const level2 = orgUnitSpiData["OverallSitesLevel"][timeline]['level2'];
                        const level3 = orgUnitSpiData["OverallSitesLevel"][timeline]['level3'];
                        const level4 = orgUnitSpiData["OverallSitesLevel"][timeline]['level4'];
                        row.push(<td key={uuidv4()}>{level0}</td>);
                        row.push(<td key={uuidv4()}>{level1}</td>);
                        row.push(<td key={uuidv4()}>{level2}</td>);
                        row.push(<td key={uuidv4()}>{level3}</td>);
                        row.push(<td key={uuidv4()}>{level4}</td>);
                        tableOverallDataExportRow.push(level0, level1, level2, level3, level4);
                    }
                }
                tableOverallDataExport.push(tableOverallDataExportRow);
                overaRowllSiteLevels.push(
                    <tr className='hover-pointer' key={uuidv4()} onClick={() => {
                        setNModal({
                            title: <>
                                <h5>{sting || "Details"}</h5>
                                <button type="button" className="btn btn-success btn-sm mx-1" onClick={() => {
                                    if (orgUnitSpiData["OverallSitesLevel"][timeline]['sites'].length > 0) {
                                        exportToExcel(
                                            Array.from(orgUnitSpiData["OverallSitesLevel"][timeline]['sites'], sp => ({
                                                "mfl": sp.mfl.toUpperCase(),
                                                "facility": sp.facility.toUpperCase(),
                                                "site": sp.site.toUpperCase(),
                                            })),
                                            'Sites - ' + sting
                                        );
                                    } else {
                                        alert('No data to export');
                                    }
                                }}>
                                    <i className='fa fa-download'></i>&nbsp;Excel/CSV
                                </button>
                            </>,
                            content: (
                                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                    <table className='table table-condensed table-striped'>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>MFL Code</th>
                                                <th>Site</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orgUnitSpiData["OverallSitesLevel"][timeline]['sites'].map((st, indx) => (
                                                <tr key={uuidv4()}>
                                                    <td>{indx + 1}.</td>
                                                    <td>{st.mfl || ''}</td>
                                                    <td>{(st.facility + ' - ' + st.site).toUpperCase() || ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        });
                        $('#nModal').modal('toggle');
                    }}>{row}</tr>
                );
            });
        }
        return [tableData, overaRowllSiteLevels, tableDataExport, tableOverallDataExport];
    }, [siteType, partners, aggregatePartners]);

    const exportAveragePerformancePDFData = () => {
        const doc = new jsPDF();
        doc.autoTable({ html: '#averagePerformance' });
        doc.save('Average_performance.pdf');
    };

    const exportOverallSiteLevelsPDFData = () => {
        const doc = new jsPDF();
        doc.autoTable({ html: '#overallSiteLevelPerformance' });
        doc.save('Overall_Site_Levels.pdf');
    };

    // Build table data
    let overaRowllSiteLevels = [];
    let tableData = [];
    let tableDataExport = [];
    let tableOverallDataExport = [];

    let tableHeaders = (
        <tr>
            <th scope="col">___</th>
            <th scope="col">Personnel Training &amp; Certification</th>
            <th scope="col">QA in Counselling</th>
            <th scope="col">Physical Facility</th>
            <th scope="col">Safety</th>
            <th scope="col">Pre-testing phase</th>
            <th scope="col">Testing Phase</th>
            <th scope="col">Post-testing Phase</th>
            <th scope="col">External Quality Assessment</th>
            <th scope="col">Overall Performance</th>
        </tr>
    );
    tableDataExport.push(['___', 'Personnel Training & Certification', 'QA in Counselling', 'Physical Facility',
        'Safety', 'Pre-testing phase', 'Testing Phase', 'Post-testing Phase', 'External Quality Assessment', 'Overall Performance'
    ]);
    let overallSitesHeaders = (
        <tr>
            <th scope="col">___</th>
            <th scope="col">Level 0 (&lt;40%)</th>
            <th scope="col">Level 1 (40-59%)</th>
            <th scope="col">Level 2 (60-79%)</th>
            <th scope="col">Level 3 (80-89%)</th>
            <th scope="col">Level 4 (&gt;90%)</th>
        </tr>
    );
    tableOverallDataExport.push(['___', 'Level 0 (<40%)', 'Level 1 (40-59%)', 'Level 2 (60-79%)', 'Level 3 (80-89%)', 'Level 4 (>90%)']);

    if (siteType != null && siteType.length !== 0) {
        tableHeaders = (
            <tr>
                <th scope="col">___</th>
                <th scope="col">Programme</th>
                <th scope="col">Personnel Training &amp; Certification</th>
                <th scope="col">QA in Counselling</th>
                <th scope="col">Physical Facility</th>
                <th scope="col">Safety</th>
                <th scope="col">Pre-testing phase</th>
                <th scope="col">Testing Phase</th>
                <th scope="col">Post-testing Phase</th>
                <th scope="col">External Quality Assessment</th>
                <th scope="col">Overall Performance</th>
            </tr>
        );
        tableDataExport = [['___', 'Programme', 'Personnel Training & Certification', 'QA in Counselling', 'Physical Facility',
            'Safety', 'Pre-testing phase', 'Testing Phase', 'Post-testing Phase', 'External Quality Assessment', 'Overall Performance'
        ]];
        overallSitesHeaders = (
            <tr>
                <th scope="col">___</th>
                <th scope="col">Programme</th>
                <th scope="col">Level 0 (&lt;40%)</th>
                <th scope="col">Level 1 (40-59%)</th>
                <th scope="col">Level 2 (60-79%)</th>
                <th scope="col">Level 3 (80-89%)</th>
                <th scope="col">Level 4 (&gt;90%)</th>
            </tr>
        );
        tableOverallDataExport = [['___', 'Programme', 'Level 0 (<40%)', 'Level 1 (40-59%)', 'Level 2 (60-79%)', 'Level 3 (80-89%)', 'Level 4 (>90%)']];
    }

    if (odkData && Object.keys(odkData).length > 0) {
        if (siteType.length !== 0) {
            (Array.isArray(odkData) ? odkData : [odkData]).forEach((displayData) => {
                [tableData, overaRowllSiteLevels, tableDataExport, tableOverallDataExport] = addTableRows(tableData, overaRowllSiteLevels, displayData, tableDataExport, tableOverallDataExport);
            });
        } else {
            [tableData, overaRowllSiteLevels, tableDataExport, tableOverallDataExport] = addTableRows(tableData, overaRowllSiteLevels, odkData, tableDataExport, tableOverallDataExport);
        }
    }

    const currentIndicator = orgUnitIndicators[indicatorIndexToDisplay];

    return (
        <React.Fragment>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h4 mb-0 text-gray-500">SPI REPORT: {currentIndicator}</h1>
            </div>

            <div className="row">
                <div className="col-sm-12 col-lg-2 col-md-4 mb-sm-1 mb-1">
                    <SpiOrgUnitIndicator
                        orgUnitIndicators={orgUnitIndicators}
                        orgUnitTypeChangeHandler={setSiteType}
                        filterDisplayedIndicator={setIndicatorIndexToDisplay}
                    />
                </div>

                <div className="col-sm-12 col-lg-2 col-md-4 mb-sm-1 mb-1">
                    <OrgUnitButton orgUnitChangeHandler={setOrgUnitDataIds} />
                </div>
                <div className="col-sm-12 col-lg-2 col-md-4 mb-sm-1 mb-1">
                    <OrgTimeline onOrgTimelineChange={setOrgUnitTimeline} />
                </div>
                <div className="col-sm-12 col-lg-2 col-md-4 mb-sm-1 mb-1">
                    <OrgUnitType orgUnitTypeChangeHandler={setSiteType} />
                </div>
                <div className="col-sm-12 col-lg-4 col-md-6 mb-sm-1 mb-1">
                    <OrgDate orgDateChangeHandler={(sd, ed) => { setStartDate(sd); setEndDate(ed); }} />
                </div>

                <div className="col-sm-12 col-lg-2 col-md-4 mb-sm-1 mb-1">
                    <div className="btn-group">
                        <button type="button" className="btn btn-sm btn-outline-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {partners && partners.length > 0
                                ? (allPartners.find(p => p.id == partners[0])?.name || 'Partner')
                                : "Select Partner"}
                        </button>
                        <div className="dropdown-menu">
                            <div>
                                <div className="form-check" style={{ padding: '3px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                                    <input className="ml-2" type="checkbox" checked={aggregatePartners} id="aggregate_partners" onChange={ev => setAggregatePartners(ev.target.checked)} />
                                    <label className="mb-0 ml-1" htmlFor="aggregate_partners">Aggregate?</label>
                                </div>
                            </div>
                            <hr />
                            <a key={uuidv4()} className="dropdown-item text-center" href="#" onClick={() => setPartners([])}>
                                &mdash; None &mdash; <i className="fa fa-check" style={{ display: partners.length === 0 ? "inline" : "none", color: "green" }} />
                            </a>
                            {allPartners.map((partner) => (
                                <a key={uuidv4()} className="dropdown-item" href="#" data-id={partner.id}
                                    onClick={() => {
                                        if (!partners.includes(partner.id)) {
                                            setPartners([partner.id]);
                                        } else {
                                            setPartners(partners.filter(item => item !== partner.id));
                                        }
                                    }}
                                >
                                    {partner.name} <i className="fa fa-check" style={{ display: partners.includes(partner.id) ? "inline" : "none", color: "green" }} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-sm-12 col-lg-2 col-md-4 mb-sm-1 mb-1">
                    <button onClick={onFilterButtonClick} type="button" style={{ display: "inlineBlock" }} className="btn btn-sm btn-primary font-weight-bold mr-2">Filter</button>
                    <button onClick={() => location.reload()} type="button" style={{ display: "inlineBlock" }} className="btn btn-sm btn-secondary font-weight-bold">Reset</button>
                </div>
            </div>

            <br />
            <div style={{ marginBottom: "10px" }} className="row">
                <div className="col-sm-12 col-xm-12 col-md-12">
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <a className="nav-link active" id="tablesTab" data-toggle="tab" href="#tables" role="tab" aria-controls="home" aria-selected="true">
                                <i className="fas fa-chart-bar"></i> Data View
                            </a>
                        </li>
                    </ul>
                    <div className="tab-content" id="myTabContent">
                        <div className="tab-pane fade show active" id="tables" role="tablesTab" aria-labelledby="home-tab">
                            <br />
                            <div className="col-sm-12 col-xm-12 col-md-12">
                                {currentIndicator === 'Average Performance per QA element' && (
                                    <React.Fragment>
                                        <div className="row">
                                            <div className="col-sm-6 col-xm-6 col-md-6">
                                                <p style={{ fontWeight: "900" }}>Average Performance per QA element</p>
                                            </div>
                                            <div className="col-sm-3 col-xm-3 col-md-3">
                                                <span style={{ color: "blue" }}><i className="fas fa-download"></i></span>
                                                <CSVLink data={tableDataExport}> Csv</CSVLink>
                                            </div>
                                            <div className="col-sm-3 col-xm-3 col-md-3">
                                                <a style={{ color: "blue" }} onClick={exportAveragePerformancePDFData}><i className="fas fa-download"></i> PDF</a>
                                            </div>
                                        </div>
                                        <table id="averagePerformance" className="table table-responsive">
                                            <thead className="thead-dark">{tableHeaders}</thead>
                                            <tbody>{tableData}</tbody>
                                        </table>
                                    </React.Fragment>
                                )}

                                {currentIndicator === 'Overall Site Levels during Assessment' && (
                                    <React.Fragment>
                                        <div className="row">
                                            <div className="col-sm-6 col-xm-6 col-md-6">
                                                <p style={{ fontWeight: "900" }}>Overall Site Levels during Assessment</p>
                                            </div>
                                            <div className="col-sm-3 col-xm-3 col-md-3">
                                                <span><i className="fas fa-download"></i></span>
                                                <CSVLink data={tableOverallDataExport}> Csv</CSVLink>
                                            </div>
                                            <div className="col-sm-3 col-xm-3 col-md-3">
                                                <a style={{ color: "blue" }} onClick={exportOverallSiteLevelsPDFData}><i className="fas fa-download"></i> PDF</a>
                                            </div>
                                        </div>
                                        <table id="overallSiteLevelPerformance" className="table table-responsive">
                                            <thead className="thead-dark">{overallSitesHeaders}</thead>
                                            <tbody>{overaRowllSiteLevels}</tbody>
                                        </table>
                                    </React.Fragment>
                                )}
                            </div>

                            {currentIndicator === 'Average Performance per QA element' && (
                                <div>
                                    <br />
                                    <p style={{ fontWeight: "900" }}>Average Performance per QA element spider chart(s)</p>
                                    <OverallPerformanceRadar minHeight={echartsMinHeight} setMinHeight={true} serverData={odkData} siteType={siteType} />
                                </div>
                            )}
                            {currentIndicator === 'Overall Site Levels during Assessment' && (
                                <div>
                                    <br />
                                    <p style={{ fontWeight: "900" }}>Overall Site Levels during Assessment charts(s)</p>
                                    <SiteLevelBarColumnCharts singleItem={false} minHeight={510} serverData={odkData} siteType={siteType} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <React.Fragment>
                <div className="modal fade" id="nModal" tabIndex="-1" role="dialog" aria-labelledby="nModalTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-xl" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }} id="nModalTitle">
                                    {nModal?.title || <h5>Details</h5>}
                                </div>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {nModal?.content || ''}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        </React.Fragment>
    );
}

export default SpiReport;

const el = document.getElementById('SpiReport');
if (el) ReactDOM.createRoot(el).render(<SpiReport />);

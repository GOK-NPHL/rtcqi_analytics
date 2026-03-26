import React from 'react';
import ReactDOM from 'react-dom';
// import DataTable from 'frappe-datatable';
import LineGraph from '../../utils/charts/LineGraph';
import StackedHorizontal from '../../utils/charts/StackedHorizontal'

import { FetchOrgunits, FetchOdkHTSData, FetchDwhSummaryLinelist, separateOrgUnitAndSite, exportToExcel } from '../../utils/Helpers'
import OrgUnitButton from '../../utils/orgunit/orgunit_button';
import OrgDate from '../../utils/orgunit/OrgDate';
import { v4 as uuidv4 } from 'uuid';
import OrgUnitType from '../../utils/orgunit/OrgUnitType';
import AgreementRateColumnCharts from './AgreementRateColumnCharts';
import PositiveConcordanceRateColumnCharts from './PositiveConcordanceRateColumnCharts';
import Positive3TConcordanceRateColumnCharts from './Positive3TConcordanceRateColumnCharts';
import SimpleRateColumnChart from './SimpleRateColumnChart';
import EHTSDistributionChart from './EHTSDistributionChart';
import TestKitDistributionChart from './TestKitDistributionChart';

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { CSVLink, CSVDownload } from "react-csv";
import OrgUnitIndicator from '../../utils/orgunit/OrgUnitIndicator';
import { over } from 'lodash';


class LogbookReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnits: [],
            orgUnitDataIds: [0],
            siteType: [],
            emrs: [],
            echartsMinHeight: '',
            orgUnitIndicators: [
                // 'Site agreement Rates',
                'Overall Agreement Rates',
                'Positive concordance rate',
                // 'Completeness rate',
                'Consistency rate',
                'Invalid rate',
                'Inconclusive rate',
                // 'Supervisory Signature rate',
                // 'Algorithm Followed rate',
                // 'Sites using eHTS register',
                'eHTS Distribution',
                'Test Kit Distribution',
            ],
            indicatorIndexToDisplay: 0,
            isLoading: false,
        }
        this.fetchOdkDataServer = this.fetchOdkDataServer.bind(this);
        this.fetchLinelistData = this.fetchLinelistData.bind(this);
        this.orgUnitChangeHandler = this.orgUnitChangeHandler.bind(this);
        this.onFilterButtonClickEvent = this.onFilterButtonClickEvent.bind(this);
        this.orgUnitTypeChangeHandler = this.orgUnitTypeChangeHandler.bind(this);
        this.addTableRows = this.addTableRows.bind(this);
        this.orgDateChangeHandler = this.orgDateChangeHandler.bind(this);
        this.exportAgreementsRatesPDFData = this.exportAgreementsRatesPDFData.bind(this);
        this.filterDisplayedIndicator = this.filterDisplayedIndicator.bind(this);
        this.resetFilters = this.resetFilters.bind(this);
    }

    componentDidMount() {
        (async () => {
            this.setState({ isLoading: true });
            let returnedData = await FetchOrgunits();

            let subCountyList = [];
            // returnedData.forEach((val) => {
            // });
            let defaultOrg = [returnedData.payload[0][0]['org_unit_id']];//get first orgunit of in list of authorized orgs
            this.setState({
                unfilteredOrgUnits: returnedData,
                orgUnits: returnedData.payload[0],
                odkData: {},
                orgLevel: 1,
                orgId: 1,
                orgUnitDataIds: [defaultOrg[0]],
                startDate: '',
                endDate: '',
                linelistMode: false,
                linelistData: null,
            });

            this.fetchOdkDataServer(defaultOrg,
                this.state.siteType,
                this.state.startDate,
                this.state.endDate
            );

        })();

    }

    fetchOdkDataServer(orgUnitIds, siteType, startDate, endDate) {
        if (orgUnitIds) {
            if (orgUnitIds.length != 0) {
                (async () => {
                    this.setState({ isLoading: true });
                    let returnedData = await FetchOdkHTSData(orgUnitIds, siteType, startDate, endDate);
                    if (returnedData.status == 200) {
                        this.setState({
                            odkData: returnedData.data,
                            isLoading: false,
                        });
                    } else {
                        this.setState({ isLoading: false, });
                    }

                })();
            }
        }
    }

    fetchLinelistData(orgUnitIds, siteType, startDate, endDate) {
        try {
            if (orgUnitIds) {
                if (orgUnitIds.length != 0) {
                    (async () => {
                        this.setState({ isLoading: true });
                        let returnedData = await FetchDwhSummaryLinelist(orgUnitIds, siteType, startDate, endDate);
                        if (returnedData.status == 200) {
                            this.setState({
                                linelistData: returnedData,
                                isLoading: false,
                                linelistMode: true,
                            });
                            const cols = [
                                "Org unit",
                                "Test Month",
                                "Total Tests",
                                "Total Sites",
                                "Total T1 Reactive",
                                "Total T1 Non-reactive",
                                "Total T1 Invalid",
                                "Total T1 No_Result",

                                "Total T2 Reactive",
                                "Total T2 Non-reactive",
                                "Total T2 Invalid",
                                // "Total T2 No_Result",

                                "Total T3 Reactive",
                                "Total T3 Non-reactive",
                                "Total T3 Invalid",
                                // "Total T3 No_Result",

                                "Total Final Positive",
                                "Total Final Negative",
                                "Total Final No_Result",
                                "Total Final Inconclusive",

                                "Test Kit 1 Trinscreen",
                                "Test Kit 1 Standard Q",
                                "Test Kit 1 Determine",
                                "Test Kit 1 Dual Kit",
                                // "Test Kit 1 First Response",
                                "Test Kit 1 Bioline Duo",
                                "Test Kit 1 Other (+empty)",

                                "Test Kit 2 Onestep",
                                "Test Kit 2 Trinscreen",
                                "Test Kit 2 First Response",
                                // "Test Kit 2 Standard Q",
                                // "Test Kit 2 Dual Kit",
                                // "Test Kit 2 Bioline Duo",
                                "Test Kit 2 Other (+empty)",

                                // "Test Kit 3 Trinscreen",
                                // "Test Kit 3 Standard Q",
                                // "Test Kit 3 Dual Kit",
                                "Test Kit 3 First Response",
                                // "Test Kit 3 Bioline Duo",
                                // "Test Kit 3 Onestep",
                                "Test Kit 3 Other (+empty)"
                            ];
                            const data = returnedData.data.map((item) => {
                                return [
                                    item?.org_unit_name,
                                    item?.test_month,
                                    Intl.NumberFormat().format(item?.total_tests),
                                    Intl.NumberFormat().format(item?.total_sites),

                                    Intl.NumberFormat().format(item?.t1_reactive),
                                    Intl.NumberFormat().format(item?.t1_non_reactive),
                                    Intl.NumberFormat().format(item?.t1_invalid),
                                    Intl.NumberFormat().format(item?.t1_null),

                                    Intl.NumberFormat().format(item?.t2_reactive),
                                    Intl.NumberFormat().format(item?.t2_non_reactive),
                                    Intl.NumberFormat().format(item?.t2_invalid),
                                    // Intl.NumberFormat().format(item?.t2_null),

                                    Intl.NumberFormat().format(item?.t3_reactive),
                                    Intl.NumberFormat().format(item?.t3_non_reactive),
                                    Intl.NumberFormat().format(item?.t3_invalid),
                                    // Intl.NumberFormat().format(item?.t3_null),

                                    Intl.NumberFormat().format(item?.final_positive),
                                    Intl.NumberFormat().format(item?.final_negative),
                                    Intl.NumberFormat().format(item?.final_null),
                                    Intl.NumberFormat().format(item?.final_inconclusive),

                                    Intl.NumberFormat().format(item?.kit1_trinscreen),
                                    Intl.NumberFormat().format(item?.kit1_standardq),
                                    Intl.NumberFormat().format(item?.kit1_determine),
                                    Intl.NumberFormat().format(item?.kit1_dualkit),
                                    // Intl.NumberFormat().format(item?.kit1_firstresponse),
                                    Intl.NumberFormat().format(item?.kit1_bioline),
                                    Intl.NumberFormat().format(item?.kit1_other),

                                    Intl.NumberFormat().format(item?.kit2_onestep),
                                    Intl.NumberFormat().format(item?.kit2_trinscreen),
                                    Intl.NumberFormat().format(item?.kit2_firstresponse),
                                    // Intl.NumberFormat().format(item?.kit2_standardq),
                                    // Intl.NumberFormat().format(item?.kit2_dualkit),
                                    // Intl.NumberFormat().format(item?.kit2_bioline),
                                    Intl.NumberFormat().format(item?.kit2_other),

                                    // Intl.NumberFormat().format(item?.kit3_trinscreen),
                                    // Intl.NumberFormat().format(item?.kit3_standardq),
                                    // Intl.NumberFormat().format(item?.kit3_dualkit),
                                    Intl.NumberFormat().format(item?.kit3_firstresponse),
                                    // Intl.NumberFormat().format(item?.kit3_bioline),
                                    // Intl.NumberFormat().format(item?.kit3_onestep),
                                    Intl.NumberFormat().format(item?.kit3_other),
                                ];
                            }) || [];
                            // Transpose: metrics become rows, each org+month becomes a column
                            const transposedCols = [
                                "Metric",
                                ...data.map(row => `${row[0]} — ${row[1]}`),
                            ];
                            const transposedData = cols.map((colName, i) => [
                                colName,
                                ...data.map(row => row[i]),
                            ]);

                            const datatable = new DataTable('#linelist-table', {
                                columns: transposedCols,
                            });
                            setTimeout(() => {
                                document.querySelector('.graphstab').classList.remove('active');
                                document.querySelector('.tbltab').classList.add('active');
                                document.querySelector('#tablesTabBtn').classList.remove('active');
                                document.querySelector('#linelistTabBtn').classList.add('active');
                                datatable.style.setStyle('.data-table-cell', {color: '#000', backgroundColor: '#fff'});
                                datatable.refresh(transposedData);
                            }, 100);
                        } else {
                            this.setState({ isLoading: false, });
                        }

                    })();
                }
            }


        } catch (err) {
            console.error(err);
        }
    }

    orgUnitChangeHandler(orgUnitIds) {
        this.setState({
            orgUnitDataIds: orgUnitIds
        });
    }

    orgUnitTypeChangeHandler(siteType) {
        this.setState({
            siteType: siteType
        });
    }

    orgDateChangeHandler(startDate, endDate) {
        this.setState({
            startDate: startDate,
            endDate: endDate
        });
    }

    onFilterButtonClickEvent() {
        // this.setState({ isLoading: true });
        if (this.state.linelistMode) {
            this.fetchLinelistData(
                this.state.orgUnitDataIds,
                this.state.siteType,
                this.state.startDate,
                this.state.endDate
            );
        } else {
            this.fetchOdkDataServer(
                this.state.orgUnitDataIds,
                this.state.siteType,
                this.state.startDate,
                this.state.endDate
            );
        }
    }

    filterDisplayedIndicator(indicatorIndex) {
        this.setState({ indicatorIndexToDisplay: indicatorIndex });
    }

    resetFilters() {
        location.reload();
    }

    shouldComponentUpdate(nextProps, nextState) {

        if (
            this.state.orgUnitDataIds != nextState.orgUnitDataIds ||
            this.state.siteType != nextState.siteType ||
            this.state.startDate != nextState.startDate ||
            this.state.endDate != nextState.endDate ||
            this.state.echartsMinHeight !== nextState.echartsMinHeight
        ) {
            return false;
        } else {
            return true;
        }

    }

    addTableRows(
        overallTableData, overallTableDataExport,
        tableData, dataToParse, tableDataExport,
        positiveConcordanceTableData, positiveConcordanceTableDataExport,
        completenessTableData, completenessExportData,
        consistencyTableData, consistencyExportData,
        invalidRateTableData, invalidRateExportData,
        inconclusiveRateTableData, inconclusiveRateExportData,
        supervisorySignatureTableData, supervisorySignatureExportData,
        algorithmFollowedTableData, algorithmFollowedExportData,
        htsTypeTableData, htsTypeExportData

    ) {

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        try {
            // overall agreement
            overallTableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={4} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            overallTableDataExport.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }

        try {
            // site agreement
            tableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={4} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            tableDataExport.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }

        try {
            // positive Concordance
            positiveConcordanceTableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={3} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            positiveConcordanceTableDataExport.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }

        try {
            // completeness
            completenessTableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={3} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            completenessExportData.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }
        try {
            // consistency
            consistencyTableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={3} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            consistencyExportData.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }
        try {
            // Invalid Rate
            invalidRateTableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={3} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            invalidRateExportData.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }
        try {
            // Inconclusive Rate
            inconclusiveRateTableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={3} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            inconclusiveRateExportData.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }
        try {
            // Supervisory Signature rates
            supervisorySignatureTableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={3} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            supervisorySignatureExportData.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }
        try {

            // Algorithm followed rates
            algorithmFollowedTableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={3} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            algorithmFollowedExportData.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }
        try {
            // hts Type rates
            htsTypeTableData.push(
                <tr key={uuidv4()}>
                    <td colSpan={dataToParse?.emrs?.length + 1} scope="row">
                        <strong>{dataToParse.orgName.toUpperCase()}</strong>
                    </td>
                </tr>);
            htsTypeExportData.push([dataToParse.orgName.toUpperCase()]);
        } catch (err) {

        }


        // overall agreement data loop
        for (let [period, totals] of Object.entries(dataToParse.overall_agreement_rate)) {

            let overallRow = [];
            let overallExportData = [];

            let row = [];
            let exportData = [];
            const d = new Date(period);

            overallRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()}
                {/* (S={totals['totals']['total_sites']}, T={totals['totals']['total_tests']}) */}
            </td>);
            overallExportData.push(sting);

            row.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()}
                {/* (S={totals['totals']['total_sites']}, T={totals['totals']['total_tests']}) */}
            </td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (S=" + totals['totals']['total_sites'] + ", T=" + totals['totals']['total_tests'] + ")"
            exportData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    overallRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    overallExportData.push(dataToParse['OrgUniType']);

                    row.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    exportData.push(dataToParse['OrgUniType']);
                }
            }

            // overall agreement rate = (test_3_positive + test_1_negative) / (test_1_positive + test_1_negative) * 100
            let overallAgreementRate = (
                (Number(totals['totals']['total_t3_positive']) + Number(totals['totals']['total_t1_negative'])) /
                (Number(totals['totals']['total_t1_positive']) + Number(totals['totals']['total_t1_negative'])) * 100
            ) || 0;

            let percent1 = ((Number(totals['totals']["<95"]) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);
            let percent2 = ((Number(totals['totals']["95-98"]) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);
            let percent3 = ((Number(totals['totals'][">98"]) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);

            if (isNaN(percent1)) percent1 = 0;
            if (isNaN(percent2)) percent2 = 0;
            if (isNaN(percent3)) percent3 = 0;

            row.push(<td key={uuidv4()} scope="row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <small style={{ fontSize: '0.7em', color: 'gray' }}>SitesRate: ({totals['totals']["<95"]}/{totals['totals']["total_sites"]})</small>
                    <span style={{ fontWeight: 'semibold', color: 'black' }}>{percent1}%</span>

                    <small style={{ fontSize: '0.7em', color: 'gray' }}>TestsRate: ({totals['totals']["<95_tests"]}/{totals['totals']["total_tests"]})</small>
                    <span style={{ fontWeight: 'semibold', color: 'black' }}>
                        {totals['totals']["<95_tests"] > 0 ? ((Number(totals['totals']["<95_tests"]) / Number(totals['totals']["total_tests"])) * 100).toFixed(1) + "%" : "0%"}
                    </span>
                </div>
            </td>);
            exportData.push(percent1);
            row.push(<td key={uuidv4()} scope="row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <small style={{ fontSize: '0.7em', color: 'gray' }}>SitesRate: ({totals['totals']["95-98"]}/{totals['totals']["total_sites"]})</small>
                    <span style={{ fontWeight: 'semibold', color: 'black' }}>{percent2}%</span>

                    <small style={{ fontSize: '0.7em', color: 'gray' }}>TestsRate: ({totals['totals']["95-98_tests"]}/{totals['totals']["total_tests"]})</small>
                    <span style={{ fontWeight: 'semibold', color: 'black' }}>
                        {totals['totals']["95-98_tests"] > 0 ? ((Number(totals['totals']["95-98_tests"]) / Number(totals['totals']["total_tests"])) * 100).toFixed(1) + "%" : "0%"}
                    </span>
                </div>
            </td>);
            exportData.push(percent2);
            row.push(<td key={uuidv4()} scope="row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <small style={{ fontSize: '0.7em', color: 'gray' }}>SitesRate: ({totals['totals'][">98"]}/{totals['totals']["total_sites"]})</small>
                    <span style={{ fontWeight: 'semibold', color: 'black' }}>{percent3}%</span>

                    <small style={{ fontSize: '0.7em', color: 'gray' }}>TestsRate: ({totals['totals'][">98_tests"]}/{totals['totals']["total_tests"]})</small>
                    <span style={{ fontWeight: 'semibold', color: 'black' }}>
                        {totals['totals'][">98_tests"] > 0 ? ((Number(totals['totals'][">98_tests"]) / Number(totals['totals']["total_tests"])) * 100).toFixed(1) + "%" : "0%"}
                    </span>
                </div>
            </td>);
            exportData.push(percent3);

            overallRow.push(<td key={uuidv4()} scope="row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', color: 'black' }}>{overallAgreementRate.toFixed(1)}%</span>
                </div>
            </td>);
            overallExportData.push(overallAgreementRate.toFixed(1));

            overallTableData.push(<tr key={uuidv4()} scope="row">{overallRow}</tr>);
            overallTableDataExport.push(overallExportData);
            tableData.push(<tr className='hover-pointer' key={uuidv4()} onClick={() => {
                this.setState({
                    nModal: {
                        title: <>
                            <h5>{sting || "Details"}</h5>
                            <button type="button" className="btn btn-success btn-sm mx-1" onClick={() => {
                                if (Object.keys(totals.sitenames).length > 0 && totals != null) {
                                    let final_data = [];
                                    Object.keys(totals.sitenames).map((dx, indx) => {
                                        return totals.sitenames[dx].map((siteName, index) => {
                                            final_data.push(
                                                {
                                                    "Rate": dx + '%',
                                                    "MFL Code": parseInt(siteName.match(/\d+/), 10),
                                                    "Site": separateOrgUnitAndSite(siteName, "_").split('_').join(' ').toLocaleUpperCase()
                                                });
                                        })
                                    })
                                    exportToExcel(final_data, 'Sites - ' + sting);
                                } else {
                                    console.error('No data to export');
                                    alert('No data to export')
                                }
                            }}>
                                <i className='fa fa-download'></i>&nbsp;
                                Excel/CSV
                            </button>
                        </>,
                        content: (<div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                            <table className='table table-condensed table-striped'>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Rate</th>
                                        <th>MFL Code</th>
                                        <th>Site</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(totals.sitenames).map((dx, indx) => {
                                        return totals.sitenames[dx].map((siteName, index) => {
                                            return (<tr key={uuidv4()}>
                                                <td>{index + 1}.</td>
                                                <td>{dx}%</td>
                                                <td>{parseInt(siteName.match(/\d+/), 10)}</td>
                                                <td>{separateOrgUnitAndSite(siteName, "_").split('_').join(' ').toLocaleUpperCase()}</td>
                                            </tr>);
                                        })
                                    })}
                                </tbody>
                            </table>
                        </div>)
                    }
                });
                $('#nModal').modal('toggle');
            }}>{row}</tr>);
            tableDataExport.push(exportData);
        }
        // end overall agreement data loop






        // positive concordance data loop
        // for (let [period, totals] of Object.entries(dataToParse.overall_concordance_totals)) {
        //     let positiveConcordanceRow = [];
        //     let positiveConcordanceExportData = [];
        //     const d = new Date(period);
        //     let no = dataToParse.overall_agreement_rate[period]['totals']['total_sites'];
        //     positiveConcordanceRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()} (N={no})</td>);
        //     let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (N=" + no + ")"
        //     positiveConcordanceExportData.push(sting);
        //     if (this.state.siteType != null) {
        //         if (this.state.siteType.length != 0) {
        //             positiveConcordanceRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
        //             positiveConcordanceExportData.push(dataToParse['OrgUniType']);
        //         }
        //     }
        //     positiveConcordanceRow.push(<td key={uuidv4()} scope="row">{totals}</td>);
        //     positiveConcordanceExportData.push(totals);
        //     positiveConcordanceTableData.push(<tr key={uuidv4()}>{positiveConcordanceRow}</tr>);
        //     positiveConcordanceTableDataExport.push(positiveConcordanceExportData);
        // }
        // end positive concordance data loop

        // positive agreement data loop - t3/t1
        // console.log(dataToParse);
        let range_ = ['>98', '95-98', '<95'];
        // console.log('dataToParse', dataToParse);
        let overallDataObject = dataToParse.overall_agreement_rate;
        for (let [period, dataObjectT3T1] of Object.entries(dataToParse.positive_agreement_rate_t3_t1)) {
            let dataObjectT3T2 = dataToParse.positive_agreement_rate_t3_t2[period];
            let dataObjectT2T1 = dataToParse.positive_agreement_rate_t2_t1[period];
            // range_.map((range, index) => {
            let row = [];
            const d = new Date(period);
            row.push(<td key={uuidv4()} scope="row">{
                monthNames[d.getMonth()]} {d.getFullYear()}
                {/* <b>({range})</b> */}
                {/* (N={dataObjectT3T1['totals']['total_sites']}) */}
                {" (S=" + overallDataObject[period]['totals']['total_sites'] + ", T=" + overallDataObject[period]['totals']['total_tests'] + ")"}
            </td>);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    row.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                }
            }
            let ttl = monthNames[d.getMonth()] + "-" + d.getFullYear() + ")";
            // row.push(<td key={uuidv4()} scope="row">{dataObjectT3T1[range]?.totals}</td>);
            // row.push(<td key={uuidv4()} scope="row">{dataObjectT3T2[range]?.totals}</td>);
            // row.push(<td key={uuidv4()} scope="row">{dataObjectT2T1[range]?.totals}</td>);
            row.push(<td key={uuidv4()} scope="row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* <span style={{textDecoration: 'line-through', color: '#ff6d6d'}}>{dataObjectT3T1?.avg}%</span> */}
                    <span>{dataObjectT3T1?.totalTests > 0 ? ((dataObjectT3T1?.totalT3Reactive * 100) / dataObjectT3T1?.totalT1Reactive).toFixed(2) + '%' : '0%'}</span>
                    <small style={{ color: 'gray' }}>({dataObjectT3T1?.totalT3Reactive} / {dataObjectT3T1?.totalT1Reactive})</small>
                    {/* <pre style={{whiteSpace: 'pre-wrap', backgroundColor: 'burlywood'}}>{JSON.stringify(dataObjectT3T1,null,1)}</pre> */}
                </div>
            </td>);
            row.push(<td key={uuidv4()} scope="row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* <span style={{textDecoration: 'line-through', color: '#ff6d6d'}}>{dataObjectT3T2?.avg}%</span> */}
                    <span>{dataObjectT3T1?.totalTests > 0 ? ((dataObjectT3T1?.totalT3Reactive * 100) / dataObjectT3T1?.totalT2Reactive).toFixed(2) + '%' : '0%'}</span>
                    <small style={{ color: 'gray' }}>({dataObjectT3T1?.totalT3Reactive} / {dataObjectT3T1?.totalT2Reactive})</small>
                    {/* <pre style={{whiteSpace: 'pre-wrap', backgroundColor: 'burlywood'}}>{JSON.stringify(dataObjectT3T2,null,1)}</pre> */}
                </div>
            </td>);
            row.push(<td key={uuidv4()} scope="row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* <span style={{textDecoration: 'line-through', color: '#ff6d6d'}}>{dataObjectT2T1?.avg}%</span> */}
                    <span>{dataObjectT3T1?.totalTests > 0 ? ((dataObjectT3T1?.totalT2Reactive * 100) / dataObjectT3T1?.totalT1Reactive).toFixed(2) + '%' : '0%'}</span>
                    <small style={{ color: 'gray' }}>({dataObjectT3T1?.totalT2Reactive} / {dataObjectT3T1?.totalT1Reactive})</small>
                    {/* <pre style={{whiteSpace: 'pre-wrap', backgroundColor: 'burlywood'}}>{JSON.stringify(dataObjectT2T1,null,1)}</pre> */}
                </div>
            </td>);
            positiveConcordanceTableData.push(<tr className='hover-pointer' key={uuidv4()}
                onClick={() => {
                    this.setState({
                        nModal: {
                            title: <>
                                <h5>{ttl || "Details"}</h5>
                                {/* Add export button here */}
                            </>,
                            content: (<div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                <table className='table table-condensed table-striped'>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Indicator</th>
                                            <th>MFL Code</th>
                                            <th>Site</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataObjectT3T1[range]?.sites.map((siteName, index) => {
                                            let site = siteName.split('_').slice(1).join(' ').toLocaleUpperCase();
                                            let mfl = siteName.split('___')[1]?.split('_')[0];
                                            return (<tr key={uuidv4()}>
                                                <td>{index + 1}.</td>
                                                <td>T3/T1</td>
                                                <td>{mfl}</td>
                                                <td>{site}</td>
                                            </tr>);
                                        })}
                                        {dataObjectT3T2[range]?.sites.map((siteName, index) => {
                                            let site = siteName.split('_').slice(1).join(' ').toLocaleUpperCase();
                                            let mfl = siteName.split('___')[1]?.split('_')[0];
                                            return (<tr key={uuidv4()}>
                                                <td>{index + 1}.</td>
                                                <td>T3/T2</td>
                                                <td>{mfl}</td>
                                                <td>{site}</td>
                                            </tr>);
                                        })}
                                        {dataObjectT2T1[range]?.sites.map((siteName, index) => {
                                            let site = siteName.split('_').slice(1).join(' ').toLocaleUpperCase();
                                            let mfl = siteName.split('___')[1]?.split('_')[0];
                                            return (<tr key={uuidv4()}>
                                                <td>{index + 1}.</td>
                                                <td>T2/T1</td>
                                                <td>{mfl}</td>
                                                <td>{site}</td>
                                            </tr>);
                                        })}
                                    </tbody>
                                </table>
                            </div>)
                        }
                    });
                    $('#nModal').modal('toggle');
                }}
            >{row}</tr>);
            // });
        }

        // completeness data
        for (let [period, totals] of Object.entries(dataToParse.completeness)) {

            let completenessRow = [];
            let completenessExportTableData = [];
            const d = new Date(period);
            let no = dataToParse.overall_agreement_rate[period]['totals']['total_sites'];
            let tsts = dataToParse.overall_agreement_rate[period]['totals']['total_tests'];
            completenessRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()}
                {/* (S={no}, T={tsts}) */}
            </td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (S=" + no + ", T=" + tsts + ")"
            completenessExportTableData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    completenessRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    completenessExportTableData.push(dataToParse['OrgUniType']);
                }
            }
            let rate = (totals / no) * 100;
            if (!rate) rate = 0;
            rate = Math.round(rate * 10) / 10; //round off to one decimal place
            completenessRow.push(<td key={uuidv4()} scope="row">{rate}</td>);
            completenessExportTableData.push(rate);

            completenessTableData.push(<tr key={uuidv4()}>{completenessRow}</tr>);

            completenessExportData.push(completenessExportTableData);
        }

        // end completeness data loop


        // consistency data
        for (let [period, totals] of Object.entries(dataToParse.consistency)) {

            let consistencyRow = [];
            let consistencyExportTableData = [];
            const d = new Date(period);
            let no = dataToParse.overall_agreement_rate[period]['totals']['total_sites'];
            let tsts = dataToParse.overall_agreement_rate[period]['totals']['total_tests'];
            consistencyRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()}
                {/* (S={no}, T={tsts}) */}
            </td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (S=" + no + ", T=" + tsts + ")"
            consistencyExportTableData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    consistencyRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    consistencyExportTableData.push(dataToParse['OrgUniType']);
                }
            }
            let rate = (totals / no) * 100;
            if (!rate) rate = 0;
            rate = Math.round(rate * 10) / 10; //round off to one decimal place

            consistencyRow.push(<td key={uuidv4()} scope="row">{rate}</td>);
            consistencyExportTableData.push(rate);

            consistencyTableData.push(<tr key={uuidv4()}>{consistencyRow}</tr>);

            consistencyExportData.push(consistencyExportTableData);
        }

        // end consistency data loop

        // invalid rate data loop
        for (let [period, totals] of Object.entries(dataToParse.invalid_rates)) {
            let total_invalid_count = dataToParse?.invalid_count[period] || 0;
            // console.log('total_invalid_count', total_invalid_count);

            let invalidRateRow = [];
            let invalidRateExportTableData = [];
            const d = new Date(period);
            let no = dataToParse.overall_agreement_rate[period]['totals']['total_sites'];
            let tsts = dataToParse.overall_agreement_rate[period]['totals']['total_tests'];
            invalidRateRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()}
                {/* (S={no}, T={tsts}) */}
            </td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (S=" + no + ", T=" + tsts + ")"
            invalidRateExportTableData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    invalidRateRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    invalidRateExportTableData.push(dataToParse['OrgUniType']);
                }
            }

            invalidRateRow.push(<td key={uuidv4()} scope="row">{total_invalid_count}</td>);
            invalidRateRow.push(<td key={uuidv4()} scope="row">{totals}</td>);
            invalidRateExportTableData.push(total_invalid_count);
            invalidRateExportTableData.push(totals);

            invalidRateTableData.push(<tr key={uuidv4()}>{invalidRateRow}</tr>);

            invalidRateExportData.push(invalidRateExportTableData);
        }

        // inconclusive rate data loop
        for (let [period, totals] of Object.entries(dataToParse.inconclusive_rates)) {
            let inconclusives_count = dataToParse?.inconclusives_count[period] || 0;

            let inconclusiveRateRow = [];
            let inconclusiveRateExportTableData = [];
            const d = new Date(period);
            let no = dataToParse.overall_agreement_rate[period]['totals']['total_sites'];
            let tsts = dataToParse.overall_agreement_rate[period]['totals']['total_tests'];
            inconclusiveRateRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()}
                {/* (S={no}, T={tsts}) */}
            </td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (S=" + no + ", T=" + tsts + ")"
            inconclusiveRateExportTableData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    inconclusiveRateRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    inconclusiveRateExportTableData.push(dataToParse['OrgUniType']);
                }
            }

            inconclusiveRateRow.push(<td key={uuidv4()} scope="row">{inconclusives_count}</td>);
            inconclusiveRateRow.push(<td key={uuidv4()} scope="row">{totals}</td>);
            inconclusiveRateExportTableData.push(inconclusives_count);
            inconclusiveRateExportTableData.push(totals);

            inconclusiveRateTableData.push(<tr key={uuidv4()}>{inconclusiveRateRow}</tr>);

            inconclusiveRateExportData.push(inconclusiveRateExportTableData);
        }

        // end inconclusive rate data loop

        // supervisory_signature data loop
        for (let [period, totals] of Object.entries(dataToParse.supervisory_signature)) {
            let supervisorySignatureRow = [];
            let supervisorySignatureExportTableData = [];
            const d = new Date(period);
            let no = dataToParse.overall_agreement_rate[period]['totals']['total_sites'];
            let tsts = dataToParse.overall_agreement_rate[period]['totals']['total_tests'];
            supervisorySignatureRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()}
                {/* (S={no}, T={tsts}) */}
            </td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (S=" + no + ", T=" + tsts + ")"
            supervisorySignatureExportTableData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    supervisorySignatureRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    supervisorySignatureExportTableData.push(dataToParse['OrgUniType']);
                }
            }
            let signed = (totals.signed / no) * 100;
            if (!signed) signed = 0;
            signed = Math.round(signed * 10) / 10; //round off to one decimal place


            let notSigned = (totals.not_signed / no) * 100;
            if (!notSigned) notSigned = 0;
            notSigned = Math.round(notSigned * 10) / 10; //round off to one decimal place

            supervisorySignatureRow.push(<td key={uuidv4()} scope="row">{signed}</td>);
            supervisorySignatureRow.push(<td key={uuidv4()} scope="row">{notSigned}</td>);

            supervisorySignatureExportTableData.push(signed);
            supervisorySignatureExportTableData.push(notSigned);

            supervisorySignatureTableData.push(<tr key={uuidv4()}>{supervisorySignatureRow}</tr>);

            supervisorySignatureExportData.push(supervisorySignatureExportTableData);
        }

        // end supervisory_signature rate data loop


        // algorithm_followed data loop
        for (let [period, totals] of Object.entries(dataToParse.algorithm_followed)) {
            let algorithmFollowedRow = [];
            let algorithmFollowedExportTableData = [];
            const d = new Date(period);
            let no = dataToParse.overall_agreement_rate[period]['totals']['total_sites'];
            let tsts = dataToParse.overall_agreement_rate[period]['totals']['total_tests'];
            algorithmFollowedRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()}
                {/* (S={no}, T={tsts}) */}
            </td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (S=" + no + ", T=" + tsts + ")"
            algorithmFollowedExportTableData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    algorithmFollowedRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    algorithmFollowedExportTableData.push(dataToParse['OrgUniType']);
                }
            }

            let followed = (totals.followed / no) * 100;
            if (!followed) followed = 0;
            followed = Math.round(followed * 10) / 10; //round off to one decimal place

            let notFollowed = (totals.not_followed / no) * 100;
            if (!notFollowed) notFollowed = 0;
            notFollowed = Math.round(notFollowed * 10) / 10; //round off to one decimal place

            algorithmFollowedRow.push(<td key={uuidv4()} scope="row">{followed}</td>);
            algorithmFollowedRow.push(<td key={uuidv4()} scope="row">{notFollowed}</td>);

            algorithmFollowedExportTableData.push(followed);
            algorithmFollowedExportTableData.push(notFollowed);

            algorithmFollowedTableData.push(<tr key={uuidv4()}>{algorithmFollowedRow}</tr>);

            algorithmFollowedExportData.push(algorithmFollowedExportTableData);
        }
        // end algorithm_followed rate data loop

        // hts_type data loop
        for (let [period, totals] of Object.entries(dataToParse.hts_type)) {
            let htsTypeRow = [];
            let htsTypeExportTableData = [];
            const d = new Date(period);
            let no = dataToParse.overall_agreement_rate[period]['totals']['total_sites'];
            let tsts = dataToParse.overall_agreement_rate[period]['totals']['total_tests'];
            htsTypeRow.push(<td key={uuidv4()} scope="row">{monthNames[d.getMonth()]} {d.getFullYear()}
                {/* (S={no}, T={tsts}) */}
            </td>);
            let sting = monthNames[d.getMonth()] + "-" + d.getFullYear() + " (S=" + no + ", T=" + tsts + ")"
            htsTypeExportTableData.push(sting);
            if (this.state.siteType != null) {
                if (this.state.siteType.length != 0) {
                    htsTypeRow.push(<td key={uuidv4()} scope="row">{dataToParse['OrgUniType']}</td>);
                    htsTypeExportTableData.push(dataToParse['OrgUniType']);
                }
            }


            // let ehts = (totals.ehts / no) * 100;
            // if (!ehts) ehts = 0;
            // ehts = Math.round(ehts * 10) / 10; //round off to one decimal place

            // let hardcopy = (totals.hardcopy / no) * 100;
            // if (!hardcopy) hardcopy = 0;
            // hardcopy = Math.round(hardcopy * 10) / 10; //round off to one decimal place

            // htsTypeRow.push(<td key={uuidv4()} scope="row">{ehts}</td>);
            // htsTypeRow.push(<td key={uuidv4()} scope="row">{hardcopy}</td>);
            // htsTypeExportTableData.push(ehts);
            // htsTypeExportTableData.push(hardcopy);


            let month_emr_totals = Object.values(totals).reduce((a, b) => a + b, 0);
            dataToParse?.emrs?.forEach((emr) => {
                let curr = totals[emr] || 0;
                let rate = (curr / month_emr_totals) * 100;
                if (!rate) rate = 0;
                rate = Math.round(rate * 10) / 10; //round off to one decimal place
                htsTypeRow.push(<td key={uuidv4()} scope="row">{rate}%</td>);
                htsTypeExportTableData.push(rate);
            });

            htsTypeTableData.push(<tr key={uuidv4()}>{htsTypeRow}</tr>);

            htsTypeExportData.push(htsTypeExportTableData);
        }
        // end hts_type rate data loop


        return [
            overallTableData, overallTableDataExport,

            tableData, tableDataExport,
            positiveConcordanceTableData, positiveConcordanceTableDataExport,
            completenessTableData, completenessExportData,
            consistencyTableData, consistencyExportData,
            invalidRateTableData, invalidRateExportData,
            inconclusiveRateTableData, inconclusiveRateExportData,
            supervisorySignatureTableData, supervisorySignatureExportData,
            algorithmFollowedTableData, algorithmFollowedExportData,
            htsTypeTableData, htsTypeExportData
        ];
    }

    exportOverallAgreementsRatesPDFData() {
        const doc = new jsPDF();
        doc.autoTable({ html: '#overallAgreementRates' });
        doc.save('overall_agreement_rates.pdf')
    }

    exportAgreementsRatesPDFData() {
        const doc = new jsPDF();
        doc.autoTable({ html: '#agreementRates' });
        doc.save('agreement_rates.pdf')
    }

    exportPositiveConcordancePDFData() {
        const doc = new jsPDF();
        doc.autoTable({ html: '#positiveConcordanceRates' });
        doc.save('positive_concordance_rates.pdf')
    }

    render() {
        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "10px"
        };
        // Site agreement Rates
        let overallTableData = [];
        let overallTableHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">Overall</th>
        </tr>;
        let overallTableDataExport = [];

        let tableData = [];
        let tableHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">&#60;95%</th>
            <th scope="col">95-98%</th>
            <th scope="col">&#62;98%</th>
            {/* <th scope="col">Overall</th> */}
        </tr>;

        let tableDataExport = [];

        tableDataExport.push(['___', '<95%', '95%-98%', '>98%' //, 'Overall'
        ]);
        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                overallTableHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">Overall</th>
                </tr>;
                overallTableDataExport = [];
                overallTableDataExport.push(['___', 'Programme', 'Overall'
                ]);

                tableHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">&#60;95%</th>
                    <th scope="col">95%-98%</th>
                    <th scope="col">&#62;98%</th>
                    {/* <th scope="col">Overall</th> */}

                </tr>;
                tableDataExport = [];
                tableDataExport.push(['___', 'Programme', '<95%', '95%-98%', '>98%' //, 'Overall'
                ]);
            }

        }
        // End Site agreement Rates


        // Positive concordance rate
        let positiveConcordanceTableData = [];
        let positiveConcordanceTableHeaders = <tr>
            <th scope="col">___</th>
            <th scope="col">T3/T1</th>
            <th scope="col">T3/T2</th>
            <th scope="col">T2/T1</th>
            {/* <th scope="col">Positive concordance rate</th> */}
        </tr>;

        let positiveConcordanceTableDataExport = [];

        positiveConcordanceTableDataExport.push(['___', 'Positive concordance rate']);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                positiveConcordanceTableHeaders = <tr>
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">T3/T1</th>
                    <th scope="col">T3/T2</th>
                    <th scope="col">T2/T1</th>
                    {/* <th scope="col">Positive concordance rate</th> */}

                </tr>;
                positiveConcordanceTableDataExport = [];
                positiveConcordanceTableDataExport.push(['___', 'Programme', 'Positive concordance rate']);
            }

        }
        // end Positive concordance rate


        // completeness rate
        let completenessTableData = [];
        let completenessTableDataHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">Completeness rate</th>

        </tr>;

        let completenessExportData = [];

        completenessExportData.push(['___', 'Completeness rate']);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                completenessTableDataHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">Completeness rate</th>

                </tr>;
                completenessExportData = [];
                completenessExportData.push(['___', 'Programme', 'Completeness rate']);
            }
        }
        // end completeness rate


        // consistency rate
        let consistencyTableData = [];
        let consistencyTableDataHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">Consistency rate</th>

        </tr>;

        let consistencyExportData = [];

        consistencyExportData.push(['___', 'Consistency rate']);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                consistencyTableDataHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">Consistency rate</th>

                </tr>;
                consistencyExportData = [];
                consistencyExportData.push(['___', 'Programme', 'Consistency rate']);
            }
        }
        // end consistency rate


        // invalid rate
        let invalidRateTableData = [];
        let invalidRateTableDataHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col"># Invalid tests</th>
            <th scope="col">Invalid rate</th>

        </tr>;

        let invalidRateExportData = [];

        invalidRateExportData.push(['___', 'Invalid rate']);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                invalidRateTableDataHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <           th scope="col"># Invalid tests</th>
                    <th scope="col">Invalid rate</th>

                </tr>;
                invalidRateExportData = [];
                invalidRateExportData.push(['___', 'Programme', 'Count', 'Invalid rate']);
            }
        }
        // end invalid rate


        // inconclusive rate
        let inconclusiveRateTableData = [];
        let inconclusiveRateTableDataHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col"># Sites</th>
            <th scope="col">Inconclusive rate</th>

        </tr>;

        let inconclusiveRateExportData = [];

        inconclusiveRateExportData.push(['___', 'Inconclusive rate']);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                inconclusiveRateTableDataHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col"># Sites</th>
                    <th scope="col">Inconclusive rate</th>

                </tr>;
                inconclusiveRateExportData = [];
                inconclusiveRateExportData.push(['___', 'Programme', 'Inconclusive rate']);
            }
        }
        // end inconclusive rate

        //  Supervisory Signature rate
        let supervisorySignatureTableData = [];
        let supervisorySignatureTableDataHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">signed</th>
            <th scope="col">not signed</th>

        </tr>;

        let supervisorySignatureExportData = [];

        supervisorySignatureExportData.push(['___', 'signed', 'not signed']);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                supervisorySignatureTableDataHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">signed</th>
                    <th scope="col">not signed</th>

                </tr>;
                supervisorySignatureExportData = [];
                supervisorySignatureExportData.push(['___', 'Programme', 'signed', 'not signed']);
            }
        }
        // end Supervisory Signature rate


        //  Algorithm followed rate
        let algorithmFollowedTableData = [];
        let algorithmFollowedTableDataHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            <th scope="col">followed</th>
            <th scope="col">not followed</th>

        </tr>;

        let algorithmFollowedExportData = [];

        algorithmFollowedExportData.push(['___', 'followed', 'not followed']);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                algorithmFollowedTableDataHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    <th scope="col">followed</th>
                    <th scope="col">not followed</th>
                </tr>;
                algorithmFollowedExportData = [];
                algorithmFollowedExportData.push(['___', 'Programme', 'followed', 'not followed']);
            }
        }
        // end Algorithm followed rate

        //  hts Type rate
        let htsTypeTableData = [];
        let htsTypeTableDataHeaders = <tr>
            {/* <th scope="col">#</th> */}
            <th scope="col">___</th>
            {/* <th scope="col">ehts</th>
            <th scope="col">hardcopy</th> */}
        </tr>;

        let htsTypeExportData = [];

        htsTypeExportData.push(['___', 'ehts', 'hardcopy']);

        if (this.state.siteType != null) {
            if (this.state.siteType.length != 0) {
                htsTypeTableDataHeaders = <tr>
                    {/* <th scope="col">#</th> */}
                    <th scope="col">___</th>
                    <th scope="col">Programme</th>
                    {/* <th scope="col">ehts</th>
                    <th scope="col">hardcopy</th> */}

                </tr>;
                htsTypeExportData = [];
                htsTypeExportData.push(['___', 'Programme', 'ehts', 'hardcopy']);
            }
        }
        // end hts Type  rate

        //process data tables with values and prepare export objects with data
        if (this.state.odkData && this.state.odkData.length) {
            // console.log('this.state.odkData', this.state.odkData);
            this.state.odkData.map(displayData => {
                for (let [key, payload] of Object.entries(displayData)) {
                    try {
                        // //console.log(displayData);
                        if (key == 0 && payload?.emrs && payload?.emrs.length > 0) {
                            //////
                            htsTypeTableDataHeaders = <tr>
                                <th scope="col">___</th>
                                {payload?.emrs.map((emr, emrIndex) => {
                                    return <th scope="col" key={uuidv4()}>{emr}</th>
                                })}
                            </tr>;

                            htsTypeExportData = [];
                            htsTypeExportData.push(['___', ...payload?.emrs]);

                            if (this.state.siteType != null) {
                                if (this.state.siteType.length != 0) {
                                    htsTypeTableDataHeaders = <tr>
                                        <th scope="col">___</th>
                                        <th scope="col">Programme</th>
                                        {payload?.emrs.map((emr, emrIndex) => {
                                            return <th scope="col" key={uuidv4()}>{emr}</th>
                                        })}
                                    </tr>;
                                    htsTypeExportData = [];
                                    htsTypeExportData.push(['___', 'Programme', ...payload?.emrs]);
                                }
                            }
                            //////
                        }

                        [
                            overallTableData, overallTableDataExport,
                            tableData,
                            tableDataExport,
                            positiveConcordanceTableData, positiveConcordanceTableDataExport,
                            completenessTableData, completenessExportData,
                            consistencyTableData, consistencyExportData,
                            invalidRateTableData, invalidRateExportData,
                            inconclusiveRateTableData, inconclusiveRateExportData,
                            supervisorySignatureTableData, supervisorySignatureExportData,
                            algorithmFollowedTableData, algorithmFollowedExportData,
                            htsTypeTableData, htsTypeExportData
                        ]
                            = this.addTableRows(
                                overallTableData, overallTableDataExport,
                                tableData,
                                payload,
                                tableDataExport,
                                positiveConcordanceTableData, positiveConcordanceTableDataExport,
                                completenessTableData, completenessExportData,
                                consistencyTableData, consistencyExportData,
                                invalidRateTableData, invalidRateExportData,
                                inconclusiveRateTableData, inconclusiveRateExportData,
                                supervisorySignatureTableData, supervisorySignatureExportData,
                                algorithmFollowedTableData, algorithmFollowedExportData,
                                htsTypeTableData, htsTypeExportData
                            );
                    } catch (err) {

                    }

                }
            })

        }
        //End process data tables with values and prepare export objects with data

        let agreementRateColumnCharts = <AgreementRateColumnCharts minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} />
        // let positiveConcordanceRateColumnCharts = <PositiveConcordanceRateColumnCharts minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} />
        let positive3tConcordanceRateColumnCharts = <><Positive3TConcordanceRateColumnCharts minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} /></>

        let completenessChart = <SimpleRateColumnChart minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} dataKey="completeness" chartLabel="Completeness Rate %" yAxisName="% completeness rate" isDirect={false} color={['#91cc75']} />
        let consistencyChart = <SimpleRateColumnChart minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} dataKey="consistency" chartLabel="Consistency Rate %" yAxisName="% consistency rate" isDirect={false} color={['#5470c6']} />
        let invalidRateChart = <SimpleRateColumnChart minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} dataKey="invalid_rates" chartLabel="Invalid Rate %" yAxisName="% invalid rate" isDirect={true} color={['#ee6666']} />
        let inconclusiveRateChart = <SimpleRateColumnChart minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} dataKey="inconclusive_rates" chartLabel="Inconclusive Rate %" yAxisName="% inconclusive rate" isDirect={true} color={['#fc8452']} />
        let ehtsDistributionChart = <EHTSDistributionChart minHeight={500} serverData={this.state.odkData} siteType={this.state.siteType} />
        let testKitDistributionChart = <TestKitDistributionChart minHeight={400} serverData={this.state.odkData} siteType={this.state.siteType} />

        // Data Tables for all the indicators
        let tablesTab = <div className="col-sm-12  col-xm-12 col-md-12">
            <div className="row">

                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Overall Agreement Rates' ?
                        <React.Fragment>
                            {/* overall agreement rates */}
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-12">

                                <div className="row">
                                    <div className="col-sm-12  col-xm-8 col-md-8">
                                        <p style={{ fontWeight: "900" }}>Overall Agreement Rates</p>
                                        <small className="text-muted">Percentage of tests where T1 and T3 results agree (overall concordance).</small>
                                    </div>
                                    <div className="col-sm-3  col-xm-3 col-md-3">
                                        <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={overallTableDataExport}> Csv</CSVLink>
                                        <span style={{ "color": "blue" }} onClick={() => this.exportOverallAgreementsRatesPDFData()}><i className="fas fa-download"></i><strong> PDF</strong></span>
                                    </div>
                                    <div className="col-sm-12">
                                        <table id="overallAgreementRates" className="table">
                                            <thead className="thead-dark">
                                                {overallTableHeaders}
                                            </thead>
                                            <tbody>
                                                {overallTableData}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* end overall agreement rates */}
                        </React.Fragment> : ''}
                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Site agreement Rates' ?
                        <React.Fragment>
                            {/* Site agreement rates */}
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-12">
                                <div className="row">
                                    <div className="col-sm-6  col-xm-5 col-md-5">
                                        <p style={{ fontWeight: "900" }}>Site agreement Rates</p>
                                        <small className="text-muted">Percentage of sites where T1 and T3 results agree, categorised as &lt;95%, 95–98%, and &gt;98%. Sites scoring &lt;95% require targeted supportive supervision.</small>
                                    </div>
                                    <div className="col-sm-3  col-xm-3 col-md-3">
                                        <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={tableDataExport}> Csv</CSVLink>
                                        <span style={{ "color": "blue" }} onClick={() => this.exportAgreementsRatesPDFData()}><i className="fas fa-download"></i><strong> PDF</strong></span>
                                    </div>
                                    <div className="col-sm-3  col-xm-3 col-md-3">
                                    </div>

                                    <table id="agreementRates" className="table table-responsive">
                                        <thead className="thead-dark">
                                            {tableHeaders}
                                        </thead>
                                        <tbody>
                                            {tableData}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* chart */}
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-12">
                                <p style={{ fontWeight: "900" }}>Site agreement Rate Chart:</p>
                                {agreementRateColumnCharts}
                            </div>
                            {/* end site agreement rates */}
                        </React.Fragment> : ''}
                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Positive concordance rate' ?
                        <React.Fragment>
                            <React.Fragment>
                                <div className="col-sm-12  col-xm-12 col-md-12 col-lg-12">
                                    <div className="row">
                                        {/* Begin Positive concordance rate  */}
                                        <div className="col-sm-9">
                                            <p style={{ fontWeight: "900" }}>Positive concordance rates</p>
                                            <small className="text-muted">Agreement between reactive (positive) results across the three tests. <strong>T3/T1</strong>; <strong>T3/T2</strong>; <strong>T2/T1</strong>. High concordance indicates consistent test performance.</small>
                                        </div>
                                        <table id="positiveConcordanceRates" className="table">
                                            <thead className="thead-dark">
                                                {positiveConcordanceTableHeaders}
                                            </thead>
                                            <tbody>
                                                {positiveConcordanceTableData}
                                            </tbody>
                                        </table>
                                        {/* End Positive concordance rate  */}
                                    </div>
                                </div>
                                <div className="col-sm-12  col-xm-12 col-md-12 col-lg-12">
                                    <p style={{ fontWeight: "900" }}>Positive Concordance Rate Chart</p>
                                    {positive3tConcordanceRateColumnCharts}
                                </div>
                            </React.Fragment>
                            {/*
                            <React.Fragment>
                                <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6">
                                    <div className="row">
                                        <div className="col-sm-6  col-xm-6 col-md-6">
                                            <p style={{ fontWeight: "900" }}>Positive concordance rate</p>

                                        </div>
                                        <div className="col-sm-3  col-xm-3 col-md-3">
                                            <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={positiveConcordanceTableDataExport}> Csv</CSVLink>
                                        </div>
                                        <div className="col-sm-3  col-xm-3 col-md-3">
                                            <span style={{ "color": "blue" }} onClick={() => this.exportPositiveConcordancePDFData()}><i className="fas fa-download"></i><strong> PDF</strong></span>
                                        </div>

                                        <table id="positiveConcordanceRates" className="table table-responsive">
                                            <thead className="thead-dark">
                                                {positiveConcordanceTableHeaders}
                                            </thead>
                                            <tbody>
                                                {positiveConcordanceTableData}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6">
                                    <p style={{ fontWeight: "900" }}>Positive Concordance Rate Chart</p>
                                    {positiveConcordanceRateColumnCharts}
                                </div>
                            </React.Fragment>
                        */}
                        </React.Fragment> : ''
                }
            </div>

            <div className="row">

                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Completeness rate' ?
                        <React.Fragment>
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <div className="row">
                                    {/* Begin completeness rate  */}
                                    <div className="col-sm-6  col-xm-6 col-md-6">
                                        <p style={{ fontWeight: "900" }}>Completeness rate</p>
                                        <small className="text-muted">Proportion of expected HTS logbook registers submitted for the reporting period. Low completeness may indicate missing data or non-submission of registers.</small>
                                    </div>
                                    <div className="col-sm-3  col-xm-3 col-md-3">
                                        <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={completenessExportData}> Csv</CSVLink>
                                    </div>
                                    <table id="positiveConcordanceRates" className="table table-responsive">
                                        <thead className="thead-dark">
                                            {completenessTableDataHeaders}
                                        </thead>
                                        <tbody>
                                            {completenessTableData}
                                        </tbody>
                                    </table>
                                    {/* End completeness  rate  */}
                                </div>
                            </div>
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <p style={{ fontWeight: "900" }}>Completeness Rate Chart:</p>
                                {completenessChart}
                            </div>
                        </React.Fragment> : ''
                }

                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Consistency rate' ?
                        <React.Fragment>
                            {/* Begin  Consistency rate  */}
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <div className="row">

                                    <div className="col-sm-6  col-xm-6 col-md-6">
                                        <p style={{ fontWeight: "900" }}>Consistency rate</p>
                                        <small className="text-muted">Proportion of testing sessions where results follow the expected algorithm sequence without contradictory or out-of-order outcomes. Low consistency may signal procedural errors or transcription mistakes.</small>
                                    </div>
                                    <div className="col-sm-3  col-xm-3 col-md-3">
                                        <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={consistencyExportData}> Csv</CSVLink>
                                    </div>
                                    <table id="positiveConcordanceRates" className="table table-responsive">
                                        <thead className="thead-dark">
                                            {consistencyTableDataHeaders}
                                        </thead>
                                        <tbody>
                                            {consistencyTableData}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <p style={{ fontWeight: "900" }}>Consistency Rate Chart:</p>
                                {consistencyChart}
                            </div>
                            {/* End Consistency  rate  */}
                        </React.Fragment> : ''
                }
            </div>


            <div className="row">

                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Inconclusive rate' ?
                        <React.Fragment>
                            {/* Begin  Inconclusive rate  */}
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <div className="row">

                                    <div className="col-sm-6  col-xm-6 col-md-6">
                                        <p style={{ fontWeight: "900" }}>Inconclusive rate</p>
                                        <small className="text-muted">Proportion of HIV tests with a discordant/inconclusive outcome where T1 and T2 results conflict, requiring a T3. Persistently high rates may indicate test kit performance issues or operator technique problems.</small>
                                    </div>
                                    <div className="col-sm-3  col-xm-3 col-md-3">
                                        <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={inconclusiveRateExportData}> Csv</CSVLink>
                                    </div>
                                    <table id="positiveConcordanceRates" className="table table-responsive">
                                        <thead className="thead-dark">
                                            {inconclusiveRateTableDataHeaders}
                                        </thead>
                                        <tbody>
                                            {inconclusiveRateTableData}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <p style={{ fontWeight: "900" }}>Inconclusive Rate Chart:</p>
                                {inconclusiveRateChart}
                            </div>
                            {/* End Inconclusive  rate  */}
                        </React.Fragment> : ''
                }

                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Invalid rate' ?
                        <React.Fragment>
                            {/* Begin  Invalid rate  */}
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <div className="row">

                                    <div className="col-sm-6  col-xm-6 col-md-6">
                                        <p style={{ fontWeight: "900" }}>Invalid rate</p>
                                        <small className="text-muted">Proportion of HIV tests that returned an invalid result due to test kit failure, inadequate sample volume, or procedural error. High invalid rates warrant investigation into cold-chain management and tester competency.</small>
                                    </div>
                                    <div className="col-sm-3  col-xm-3 col-md-3">
                                        <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={invalidRateExportData}> Csv</CSVLink>
                                    </div>
                                    <table id="positiveConcordanceRates" className="table table-responsive">
                                        <thead className="thead-dark">
                                            {invalidRateTableDataHeaders}
                                        </thead>
                                        <tbody>
                                            {invalidRateTableData}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <p style={{ fontWeight: "900" }}>Invalid Rate Chart:</p>
                                {invalidRateChart}
                            </div>
                            {/* End Invalid  rate  */}
                        </React.Fragment> : ''
                }

                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Supervisory Signature rate' ?
                        <React.Fragment>
                            {/* Begin  Supervisory Signature rate  */}
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <div className="row">

                                    <div className="col-sm-6  col-xm-6 col-md-6">
                                        <p style={{ fontWeight: "900" }}>Supervisory Signature rate</p>

                                    </div>
                                    <div className="col-sm-3  col-xm-3 col-md-3">
                                        <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={supervisorySignatureExportData}> Csv</CSVLink>
                                    </div>
                                    <table id="positiveConcordanceRates" className="table table-responsive">
                                        <thead className="thead-dark">
                                            {supervisorySignatureTableDataHeaders}
                                        </thead>
                                        <tbody>
                                            {supervisorySignatureTableData}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* End Supervisory Signature  rate  */}
                        </React.Fragment> : ''
                }
            </div>

            <div className="row">
                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Algorithm Followed rate' ?
                        <React.Fragment>
                            {/* Begin  algorithm followed rate  */}
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-6 mt-3">
                                <div className="row">

                                    <div className="col-sm-6  col-xm-6 col-md-6">
                                        <p style={{ fontWeight: "900" }}>Algorithm Followed rate</p>
                                        <small className="text-muted">Proportion of testing sessions where the HIV 3-test algorithm sequence (T1 → T2 → T3) was correctly applied as per national guidelines. Deviations may result in misclassification of HIV status.</small>
                                    </div>
                                    <div className="col-sm-3  col-xm-3 col-md-3">
                                        <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={algorithmFollowedExportData}> Csv</CSVLink>
                                    </div>
                                    <table id="positiveConcordanceRates" className="table table-responsive">
                                        <thead className="thead-dark">
                                            {algorithmFollowedTableDataHeaders}
                                        </thead>
                                        <tbody>
                                            {algorithmFollowedTableData}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* End algorithm followed  rate  */}
                        </React.Fragment> : ''
                }

                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'eHTS Distribution' /*'Sites using eHTS register'*/ ?
                        <React.Fragment>
                            {/* Begin hts type rate  */}
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-12 mt-3">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <p style={{ fontWeight: "900" }}>eHTS Distribution</p>
                                        <small className="text-muted">Breakdown of HTS registers used by sites — Electronic HTS (eHTS): distribution of EMR / HMIS systems. Tracks progress towards digital register adoption across testing sites.</small>
                                    </div>
                                    <div className="col-sm-2">
                                        <span style={{ "color": "blue" }}><i className="fas fa-download"></i></span><CSVLink data={htsTypeExportData}> Csv</CSVLink>
                                    </div>
                                    <table id="positiveConcordanceRatesz" className="table">
                                        <thead className="thead-dark">
                                            {htsTypeTableDataHeaders}
                                        </thead>
                                        <tbody>
                                            {htsTypeTableData}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="col-sm-12  col-xm-12 col-md-12 col-lg-12 mt-3">
                                <p style={{ fontWeight: "900" }}>eHTS Distribution Chart:</p>
                                {ehtsDistributionChart}
                            </div>
                            {/* End hts type  rate  */}
                        </React.Fragment> : ''
                }

                {
                    this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay] == 'Test Kit Distribution' ?
                        <React.Fragment>
                            {/* Begin Test Kit Distribution */}
                            <div className="col-sm-12 col-xm-12 col-md-12 col-lg-12 mt-3">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <p style={{ fontWeight: "900" }}>Test Kit Distribution</p>
                                        <small className="text-muted">Distribution of test kits used across the three HIV testing rounds (T1, T2, T3). Shows proportion of each kit type (Trinscreen, Standard Q, Dual Kit, First Response, Bioline, Other) per test.</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-xm-12 col-md-12 col-lg-12 mt-3">
                                <p style={{ fontWeight: "900" }}>Test Kit Distribution Charts:</p>
                                {testKitDistributionChart}
                            </div>
                            <div className="col-sm-12 col-xm-12 col-md-12 col-lg-12 mt-3">
                                <p style={{ fontWeight: "900" }}>Test Kit Summary Tables:</p>
                                {(() => {
                                    const kitTypes = ['trinscreen', 'standardq', 'dualkit', 'firstresponse', 'bioline', 'other'];
                                    const kitLabels = { trinscreen: 'Trinscreen', standardq: 'Standard Q', dualkit: 'Dual Kit', firstresponse: 'First Response', bioline: 'Bioline', other: 'Other' };
                                    const totals = { kit1: {}, kit2: {}, kit3: {} };
                                    kitTypes.forEach(kt => { totals.kit1[kt] = 0; totals.kit2[kt] = 0; totals.kit3[kt] = 0; });

                                    if (this.state.odkData && this.state.odkData.length) {
                                        this.state.odkData.forEach(displayData => {
                                            Object.values(displayData).forEach(payload => {
                                                try {
                                                    Object.values(payload.kit_distribution || {}).forEach(monthData => {
                                                        kitTypes.forEach(kt => {
                                                            totals.kit1[kt] += monthData[`kit1_${kt}`] || 0;
                                                            totals.kit2[kt] += monthData[`kit2_${kt}`] || 0;
                                                            totals.kit3[kt] += monthData[`kit3_${kt}`] || 0;
                                                        });
                                                    });
                                                } catch (e) {}
                                            });
                                        });
                                    }

                                    const csvData = [['Kit Type', 'T1 Count', 'T2 Count', 'T3 Count']];
                                    kitTypes.forEach(kt => {
                                        csvData.push([kitLabels[kt], totals.kit1[kt], totals.kit2[kt], totals.kit3[kt]]);
                                    });

                                    return (
                                        <div className="row">
                                            <div className="col-sm-3">
                                                <span style={{ color: 'blue' }}><i className="fas fa-download"></i></span>
                                                <CSVLink data={csvData}> Csv</CSVLink>
                                            </div>
                                            <div className="col-sm-12 mt-2">
                                                <div className="row">
                                                    {[
                                                        { label: 'Test 1 (T1) Kit Totals', kitKey: 'kit1' },
                                                        { label: 'Test 2 (T2) Kit Totals', kitKey: 'kit2' },
                                                        { label: 'Test 3 (T3) Kit Totals', kitKey: 'kit3' },
                                                    ].map(({ label, kitKey }) => (
                                                        <div key={label} className="col-sm-12 col-md-4">
                                                            <p style={{ fontWeight: '700', marginBottom: '4px' }}>{label}</p>
                                                            <table className="table table-sm table-bordered table-striped">
                                                                <thead className="thead-dark">
                                                                    <tr>
                                                                        <th>Kit Type</th>
                                                                        <th>Count</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {kitTypes.map(kt => (
                                                                        <tr key={kt}>
                                                                            <td>{kitLabels[kt]}</td>
                                                                            <td>{Intl.NumberFormat().format(totals[kitKey][kt])}</td>
                                                                        </tr>
                                                                    ))}
                                                                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fc' }}>
                                                                        <td>Total</td>
                                                                        <td>{Intl.NumberFormat().format(kitTypes.reduce((sum, kt) => sum + totals[kitKey][kt], 0))}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                            {/* End Test Kit Distribution */}
                        </React.Fragment> : ''
                }
            </div>
        </div>;
        // End  Data Tables for all the indicators

        if (this.state.isLoading) {
            return (
                <React.Fragment>
                    <div className="d-sm-flex align-items-center justify-content-between mb-4">
                        <h1 className="h4 mb-0 text-gray-900">Logbook REPORT: {
                            this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay]
                        }</h1>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </React.Fragment>
            )
        }
        return (
            <React.Fragment>
                {/* <details open>
                    <summary>this.state.odkData</summary>
                    <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', marginBottom: '3em', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                        <pre>
                            {JSON.stringify(this.state.odkData, null, 1)}
                        </pre>
                    </div>
                </details> */}

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-900">Logbook REPORT: {
                        this.state.orgUnitIndicators[this.state.indicatorIndexToDisplay]
                    }</h1>

                    {/* <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-download fa-sm text-white-50"></i> Generate Report</a> */}
                </div>

                {/* Filter bar */}
                <div className="row">
                    <div className="col-sm-12  col-lg-2 col-md-4 mb-sm-1 mb-1">
                        <OrgUnitIndicator orgUnitIndicators={this.state.orgUnitIndicators}
                            orgUnitTypeChangeHandler={this.orgUnitTypeChangeHandler}
                            filterDisplayedIndicator={this.filterDisplayedIndicator}
                        ></OrgUnitIndicator>
                    </div>

                    <div className="col-sm-12  col-lg-2 col-md-4 mb-sm-1 mb-1">
                        <OrgUnitButton orgUnitChangeHandler={this.orgUnitChangeHandler}></OrgUnitButton>
                    </div>

                    <div className="col-sm-12   col-lg-2  col-md-4 mb-sm-1 mb-1">
                        <OrgUnitType orgUnitTypeChangeHandler={this.orgUnitTypeChangeHandler}></OrgUnitType>
                    </div>

                    <div className="col-sm-12 col-lg-4 col-md-6 mb-sm-1 mb-1">
                        <OrgDate orgDateChangeHandler={this.orgDateChangeHandler}></OrgDate>
                    </div>

                    <div className="col-sm-12  col-lg-2 col-md-4 mb-sm-1 mb-1">
                        <button
                            onClick={() => this.onFilterButtonClickEvent()}
                            type="button"
                            style={{ "display": "inlineBlock" }}
                            className="btn btn-sm btn-primary font-weight-bold mr-2">Filter
                        </button>
                        <button
                            onClick={() => {
                                this.resetFilters();
                            }}
                            type="button"
                            style={{ "display": "inlineBlock" }}
                            className="btn btn-sm btn-secondary font-weight-bold">Reset
                        </button>
                    </div>


                </div>
                {/* end filter bar */}

                {/* loading indicator */}
                <div className="row">
                    <div className="col-sm-12  col-xm-12 col-md-12 col-lg-12 p-0">
                        <div className="row">
                            <div className="col-sm-12 col-xm-12 col-md-12 col-lg-12 p-1" style={{ textAlign: 'center' }}>
                                {this.state.isLoading ? <div className="spinner-border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
                {/* end loading indicator */}

                <br />
                <div style={rowStle} className="row">

                    {/* tab headers */}
                    <div className="col-sm-12  col-xm-12 col-md-12">
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <a className="nav-link active" id="tablesTabBtn" data-toggle="tab" href="#tables" role="tab" aria-controls="tables" aria-selected="true" onClick={() => {
                                    console.log('linelist mode OFF');
                                    this.setState({
                                        linelistMode: false
                                    })
                                }}>
                                    <i className="fas fa-chart-bar"></i> Analytics
                                </a>
                            </li>
                            <li className="nav-item" role="presentation">
                                <a className="nav-link" id="linelistTabBtn" data-toggle="tab" href="#linelist" role="tab" aria-controls="linelist" aria-selected="false" onClick={() => {
                                    console.log('linelist mode ON');
                                    this.setState({
                                        linelistMode: false
                                    })
                                    this.fetchLinelistData(this.state.orgUnitDataIds,
                                        this.state.siteType,
                                        this.state.startDate,
                                        this.state.endDate
                                    );
                                }}>
                                    <i className="fas fa-list"></i> Aggregates
                                </a>
                            </li>
                        </ul>
                        {/* end tab headers */}

                        <div className="tab-content" id="myTabContent">
                            {/* Site agreement rates */}
                            <div className="tab-pane graphstab active" id="tables" role="tabpanel" aria-labelledby="tables">
                                <br />
                                {tablesTab}
                            </div>
                            <div className="tab-pane tbltab" id="linelist" role="tabpanel" aria-labelledby="linelist">
                                <br />
                                <h4>Linelist</h4>
                                <div className="row">
                                    <div className="col-md-12">
                                        {/* <pre style={{whiteSpace: 'pre-wrap', backgroundColor: 'burlywood', padding: '1em'}}>
                                            {JSON.stringify(this.state.linelistData, null, 2)}
                                        </pre> */}
                                        <div id="linelist-table">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>



                <React.Fragment>
                    <div className="modal fade" id="nModal" tabIndex="-1" role="dialog" aria-labelledby="nModalTitle" aria-hidden="true" >
                        <div className="modal-dialog modal-dialog-centered modal-xl" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div className="modal-title" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }} id="nModalTitle">
                                        {this.state.nModal?.title || <h5>Details</h5>}
                                    </div>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {
                                        this.state.nModal?.content ? this.state.nModal?.content : ''
                                    }
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div >
                </React.Fragment>
            </React.Fragment>
        );
    }

}

export default LogbookReport;

if (document.getElementById('LogbookReport')) {
    // find element by id
    let domValues = [];
    let domValuesMap = {};
    const dataChart1 = document.getElementById('data-chart1');
    const dataChart2 = document.getElementById('data-chart2');
    const dataChart3 = document.getElementById('data-chart3');
    const dataChart4 = document.getElementById('data-chart4');
    const dataChart5 = document.getElementById('data-chart5');
    const dataChart6 = document.getElementById('data-chart6');

    // create new props object with element's data-attributes
    // result: {chart1: "data"}
    domValues.push(dataChart1.dataset);
    domValues.push(dataChart2.dataset);
    domValues.push(dataChart3.dataset);
    domValues.push(dataChart4.dataset);
    domValues.push(dataChart5.dataset);
    domValues.push(dataChart6.dataset);
    // domValues.push({'f':10})
    domValues.forEach(element => {
        for (const property in element) {
            domValuesMap[property] = element[property];
        }
    });

    const props = Object.assign({}, domValuesMap);
    ReactDOM.render(<LogbookReport {...props} />, document.getElementById('LogbookReport'));
}

import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedVertical from '../../utils/charts/StackedVertical'
import { v4 as uuidv4 } from 'uuid';

function EHTSDistributionChart(props) {

    function prepareOverallLevelSiteData(dataObject) {
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let orgName = dataObject.orgName;
        if (dataObject.orgName) orgName += ' ' + (dataObject['OrgUniType'] != undefined ? dataObject['OrgUniType'] : '');
        orgName = orgName.toUpperCase();

        let emrs = dataObject.emrs || [];
        let htsTypeData = dataObject.hts_type || {};
        let overallDataObject = dataObject.overall_agreement_rate;

        let category = [];
        // Initialize data arrays for each EMR type
        let emrDataMap = {};
        emrs.forEach(emr => {
            emrDataMap[emr] = [];
        });

        for (let [period, totals] of Object.entries(htsTypeData)) {
            const d = new Date(period);
            let totalSites = 0;
            let totalTests = 0;
            if (overallDataObject && overallDataObject[period] && overallDataObject[period]['totals']) {
                totalSites = overallDataObject[period]['totals']['total_sites'];
                totalTests = overallDataObject[period]['totals']['total_tests'];
            }

            let label = monthNames[d.getMonth()] + '\n' + d.getFullYear() + '\n (S=' + totalSites + ', T=' + totalTests + ')';
            if (!category.includes(label)) {
                category.push(label);
            }

            let monthEmrTotals = Object.values(totals).reduce((a, b) => a + b, 0);

            emrs.forEach(emr => {
                let curr = totals[emr] || 0;
                let rate = (curr / monthEmrTotals) * 100;
                if (isNaN(rate) || !isFinite(rate)) rate = 0;
                rate = Math.round(rate * 10) / 10;
                emrDataMap[emr].push(rate);
            });
        }

        let seriesData = emrs.map(emr => ({
            name: emr,
            type: 'bar',
            stack: 'total',
            label: {
                show: true
            },
            emphasis: {
                focus: 'series'
            },
            data: emrDataMap[emr]
        }));

        return (
            <RTCard header={orgName} minHeight={props.minHeight}>
                <StackedVertical
                    yAxisGap={43}
                    yAxisName="eHTS Distribution %"
                    formatter="%"
                    color={['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']}
                    minHeight={props.minHeight}
                    legend={emrs}
                    category={category}
                    series={seriesData}
                />
            </RTCard>
        );
    }

    function addGraphsToArray(counter, row, columns, overLay, singChart) {
        if (counter % 2 == 0) {
            overLay.push(row);
            columns = [];
            row = <div key={uuidv4()} className="row">
                {columns}
            </div>;
        }
        columns.push(<div key={uuidv4()} className="col-sm-12 col-xm-12">
            {singChart}
        </div>);
        counter += 1;
        return [counter, row, columns, overLay];
    }

    let overLay = [];
    let counter = 0;
    let columns = [];
    let row = <div key={uuidv4()} className="row">
        {columns}
    </div>;
    if (props.serverData) {

        if (props.siteType != null && props.siteType.length != 0) {
            props.serverData.map((dataObjectParent) => {
                for (let [orgId, orgUnitDataObject] of Object.entries(dataObjectParent)) {
                    try {
                        let singChart = prepareOverallLevelSiteData(orgUnitDataObject);
                        [counter, row, columns, overLay] = addGraphsToArray(counter, row, columns, overLay, singChart);
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
            if (columns.length > 0) {
                overLay.push(row);
            }

        } else {
            let dataSrc = Array.isArray(props.serverData) ? props.serverData[0] : props.serverData;

            if (Array.isArray(props.serverData) && props.serverData.length > 0) {
                dataSrc = props.serverData[0];
            }

            if (dataSrc) {
                for (let [key, dataObject] of Object.entries(dataSrc)) {
                    try {
                        let singChart = prepareOverallLevelSiteData(dataObject);
                        [counter, row, columns, overLay] = addGraphsToArray(counter, row, columns, overLay, singChart);
                    } catch (err) {
                        console.error(err);
                    }
                }
            }

            if (columns.length > 0) {
                overLay.push(row);
            }
        }

    }

    return (
        <React.Fragment>
            {props.singleItem ? columns : overLay}
        </React.Fragment>
    );
}

export default EHTSDistributionChart;

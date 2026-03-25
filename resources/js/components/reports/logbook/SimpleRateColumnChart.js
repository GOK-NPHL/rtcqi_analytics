import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedVertical from '../../utils/charts/StackedVertical'
import { v4 as uuidv4 } from 'uuid';

function SimpleRateColumnChart(props) {

    function prepareOverallLevelSiteData(dataObject) {
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let orgName = dataObject.orgName;
        if (dataObject.orgName) orgName += ' ' + (dataObject['OrgUniType'] != undefined ? dataObject['OrgUniType'] : '');
        orgName = orgName.toUpperCase();

        let rateData = dataObject[props.dataKey];
        let overallDataObject = dataObject.overall_agreement_rate;

        let category = [];
        let dataArray = [];

        for (let [period, value] of Object.entries(rateData)) {
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

            let rate;
            if (props.isDirect) {
                rate = Number(value);
                if (isNaN(rate)) rate = 0;
                rate = Math.round(rate * 10) / 10;
            } else {
                rate = ((Number(value) / Number(totalSites)) * 100);
                if (isNaN(rate) || !isFinite(rate)) rate = 0;
                rate = Math.round(rate * 10) / 10;
            }
            dataArray.push(rate);
        }

        let seriesData = [{
            name: props.chartLabel,
            type: 'bar',
            label: {
                show: true,
                position: 'top',
                formatter: '{c}%'
            },
            emphasis: {
                focus: 'series'
            },
            data: dataArray
        }];

        return (
            <RTCard header={orgName} minHeight={props.minHeight}>
                <StackedVertical
                    yAxisGap={43}
                    yAxisName={props.yAxisName || props.chartLabel}
                    formatter="%"
                    color={props.color || ['#5470c6']}
                    minHeight={props.minHeight}
                    legend={[props.chartLabel]}
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

export default SimpleRateColumnChart;

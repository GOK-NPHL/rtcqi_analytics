import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedVertical from '../../utils/charts/StackedVertical'
import { v4 as uuidv4 } from 'uuid';

function Positive3TConcordanceRateColumnCharts(props) {

    function prepareOverallLevelSiteData(dataObject) {
        // Mapping of keys in the JSON to Display Names
        let levelsMap = {
            // 'Positive_Concordance': 'Overall',
            'T3T1': 'T3 / T1',
            'T3T2': 'T3 / T2',
            'T2T1': 'T2 / T1',
        };

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let orgName = dataObject.orgName;
        if (dataObject.orgName) orgName += ' ' + (dataObject['OrgUniType'] != undefined ? dataObject['OrgUniType'] : '');
        orgName = orgName.toUpperCase();

        // 1. Get a distinct list of all periods (months) from the main dataset to align the X-Axis
        let overallDataObject = dataObject.overall_concordance_totals || {};
        let periods = Object.keys(overallDataObject).sort();

        // 2. Prepare the X-Axis Categories (Month names + N value from Overall data)
        let category = periods.map(period => {
            const d = new Date(period);
            // Get N value from overall_agreement_rate for the label
            let nVal = 0;
            let tVal = 0;
            if (dataObject.overall_agreement_rate &&
                dataObject.overall_agreement_rate[period] &&
                dataObject.overall_agreement_rate[period]['totals']) {
                nVal = dataObject.overall_agreement_rate[period]['totals']['total_sites'];
                tVal = dataObject.overall_agreement_rate[period]['totals']['total_tests'];
            }
            return monthNames[d.getMonth()] + '\n' + d.getFullYear() + "\n (S=" + nVal + ", T=" + tVal + ")";
        });

        // 3. Prepare Series Data
        let seriesData = [];

        // Iterate through our 4 Metrics (Overall, T3T1, etc)
        Object.keys(levelsMap)?.filter(k=>{
            // skip overall concordance for now
            return k.toLocaleLowerCase() != 'positive_concordance';
        })?.forEach(key => {
            let dataArray = [];

            periods.forEach(period => {
                let value = 0;

                // if (key === 'Positive_Concordance') {
                //     // Overall is already a percentage string in the JSON
                //     value = parseFloat(overallDataObject[period] || 0);
                // } else {
                    // All three ratios are derived from the t3_t1 data object (matching table calculation)
                    let t3t1Data = dataObject['positive_agreement_rate_t3_t1']?.[period];
                    if (t3t1Data?.totalTests > 0) {
                        if (key === 'T3T1') {
                            value = parseFloat(((t3t1Data.totalT3Reactive * 100) / t3t1Data.totalT1Reactive).toFixed(2));
                        } else if (key === 'T3T2') {
                            value = parseFloat(((t3t1Data.totalT3Reactive * 100) / t3t1Data.totalT2Reactive).toFixed(2));
                        } else if (key === 'T2T1') {
                            value = parseFloat(((t3t1Data.totalT2Reactive * 100) / t3t1Data.totalT1Reactive).toFixed(2));
                        }
                    }
                // }
                dataArray.push(value);
            });

            // Create the series object
            seriesData.push({
                name: levelsMap[key],
                type: 'bar',
                label: {
                    show: true,
                    position: 'top', // Better for grouped bars
                    formatter: '{c}%'
                },
                emphasis: {
                    focus: 'series'
                },
                data: dataArray
            });
        });

        return (
            <RTCard header={orgName} minHeight={props.minHeight}>
                <StackedVertical
                    yAxisGap={35}
                    yAxisName="Concordance %"
                    formatter="%"
                    // formatter="{value} %"
                    // color={['#58bc77', '#8c3070', '#ba5899', '#ea87ac', '#fc8452',  '#d19f71', '#8fa840']}
                    // 4 distinct colors for the 4 metrics
                    color={['#4caf50', '#2196f3', '#ff9800', '#9c27b0']}
                    minHeight={props.minHeight}
                    legend={Object.values(levelsMap)}
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
            // Handling for Single Site/Default view
            let dataSrc = Array.isArray(props.serverData) ? props.serverData[0] : props.serverData;

            // If serverData is an array of objects
            if(Array.isArray(props.serverData) && props.serverData.length > 0){
                 dataSrc = props.serverData[0];
            }

            if(dataSrc){
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

export default Positive3TConcordanceRateColumnCharts;

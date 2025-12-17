import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedVertical from '../../utils/charts/StackedVertical'
import { v4 as uuidv4 } from 'uuid';

class Positive3TConcordanceRateColumnCharts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.addGraphsToArray = this.addGraphsToArray.bind(this);
        this.prepareOverallLevelSiteData = this.prepareOverallLevelSiteData.bind(this);
    }

    componentDidMount() {
    }

    prepareOverallLevelSiteData(dataObject) {
        // Mapping of keys in the JSON to Display Names
        let levelsMap = {
            'Positive_Concordance': 'Overall',
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

        // Helper function to calculate percentage from the nested T3/T2/T1 objects
        const calculatePercentage = (periodData) => {
            if (!periodData) return 0;

            // Sum totals from all buckets (>98, 95-98, <95)
            let totalSites = 0;
            let passingSites = 0; // Assuming Concordance means >98 bucket, or >98 + 95-98

            // Loop through buckets provided in JSON (e.g., ">98", "<95")
            Object.keys(periodData).forEach(bucketKey => {
                let val = periodData[bucketKey]?.totals || 0;
                totalSites += val;

                // Logic: What counts as "Concordant"? usually >98.
                // Adjust if you need to include "95-98"
                if(bucketKey === '>98') {
                    passingSites += val;
                }
            });

            if (totalSites === 0) return 0;
            return ((passingSites / totalSites) * 100).toFixed(1);
        };

        // Iterate through our 4 Metrics (Overall, T3T1, etc)
        // console.log(levelsMap);
        Object.keys(levelsMap).forEach(key => {
            let dataArray = [];

            periods.forEach(period => {
                let value = 0;

                if (key === 'Positive_Concordance') {
                    // Overall is already a percentage string in the JSON
                    value = parseFloat(overallDataObject[period] || 0);
                } else {
                    // For T3T1, T3T2, T2T1, we need to dig into the objects
                    let lookupKey = '';
                    if (key === 'T3T1') lookupKey = 'positive_agreement_rate_t3_t1';
                    if (key === 'T3T2') lookupKey = 'positive_agreement_rate_t3_t2';
                    if (key === 'T2T1') lookupKey = 'positive_agreement_rate_t2_t1';

                    let periodData = dataObject[lookupKey] ? dataObject[lookupKey][period] : null;
                    value = calculatePercentage(periodData);
                }
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
            <RTCard header={orgName} minHeight={this.props.minHeight}>
                <StackedVertical
                    yAxisGap={35}
                    yAxisName="Concordance %"
                    formatter="%"
                    // formatter="{value} %"
                    color={['#58bc77', '#8c3070', '#ba5899', '#ea87ac', '#fc8452',  '#d19f71', '#8fa840']}
                    minHeight={this.props.minHeight}
                    legend={Object.values(levelsMap)}
                    category={category}
                    series={seriesData}
                />
            </RTCard>
        );
    }

    addGraphsToArray(counter, row, columns, overLay, singChart) {
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

    render() {
        let overLay = [];
        let counter = 0;
        let columns = [];
        let row = <div key={uuidv4()} className="row">
            {columns}
        </div>;
        if (this.props.serverData) {

            if (this.props.siteType != null && this.props.siteType.length != 0) {
                this.props.serverData.map((dataObjectParent) => {
                    for (let [orgId, orgUnitDataObject] of Object.entries(dataObjectParent)) {
                        try {
                            let singChart = this.prepareOverallLevelSiteData(orgUnitDataObject);
                            [counter, row, columns, overLay] = this.addGraphsToArray(counter, row, columns, overLay, singChart);
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
                let dataSrc = Array.isArray(this.props.serverData) ? this.props.serverData[0] : this.props.serverData;

                // If serverData is an array of objects
                if(Array.isArray(this.props.serverData) && this.props.serverData.length > 0){
                     dataSrc = this.props.serverData[0];
                }

                if(dataSrc){
                     for (let [key, dataObject] of Object.entries(dataSrc)) {
                        try {
                            let singChart = this.prepareOverallLevelSiteData(dataObject);
                            [counter, row, columns, overLay] = this.addGraphsToArray(counter, row, columns, overLay, singChart);
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
                {this.props.singleItem ? columns : overLay}
            </React.Fragment>
        );
    }
}

export default Positive3TConcordanceRateColumnCharts;

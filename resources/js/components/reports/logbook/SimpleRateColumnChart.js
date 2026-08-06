import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedVertical from '../../utils/charts/StackedVertical'
import { v4 as uuidv4 } from 'uuid';

class SimpleRateColumnChart extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.addGraphsToArray = this.addGraphsToArray.bind(this);
        this.prepareOverallLevelSiteData = this.prepareOverallLevelSiteData.bind(this);
    }

    componentDidMount() {
    }

    prepareOverallLevelSiteData(dataObject) {
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let orgName = dataObject.orgName;
        if (dataObject.orgName) orgName += ' ' + (dataObject['OrgUniType'] != undefined ? dataObject['OrgUniType'] : '');
        orgName = orgName.toUpperCase();

        // A payload that predates the indicator carries no series under this key. Chart it as
        // empty rather than throwing, so one missing indicator cannot blank the whole report.
        let rateData = dataObject[this.props.dataKey] || {};
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
            if (this.props.isDirect) {
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
            name: this.props.chartLabel,
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
            <RTCard header={orgName} minHeight={this.props.minHeight}>
                <StackedVertical
                    yAxisGap={43}
                    yAxisName={this.props.yAxisName || this.props.chartLabel}
                    formatter="%"
                    color={this.props.color || ['#5470c6']}
                    minHeight={this.props.minHeight}
                    legend={[this.props.chartLabel]}
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
                let dataSrc = Array.isArray(this.props.serverData) ? this.props.serverData[0] : this.props.serverData;

                if (Array.isArray(this.props.serverData) && this.props.serverData.length > 0) {
                    dataSrc = this.props.serverData[0];
                }

                if (dataSrc) {
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

export default SimpleRateColumnChart;

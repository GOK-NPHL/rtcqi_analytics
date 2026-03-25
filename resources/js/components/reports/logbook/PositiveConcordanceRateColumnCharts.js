import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedVertical from '../../utils/charts/StackedVertical'
import { v4 as uuidv4 } from 'uuid';

function PositiveConcordanceRateColumnCharts(props) {

    function prepareOverallLevelSiteData(dataObject) {
        //console.log(dataObject);
        let overallSiteGraphsData = {};
        let levelsMap = {
            'Positive_Concordance': 'Positive Concordance'
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let orgName = dataObject.orgName;

        if (dataObject.orgName) orgName += ' ' + (dataObject['OrgUniType'] != undefined ? dataObject['OrgUniType'] : '');
        orgName = orgName.toUpperCase();
        let overallDataObject = dataObject.overall_concordance_totals;

        let levelData = {
            'Positive_Concordance': []
        };
        let category = [];
        let seriesData = [];

        for (let [period, totals] of Object.entries(overallDataObject)) {
            let row = [];
            const d = new Date(period);

            let no = dataObject.overall_agreement_rate[period]['totals']['total_sites'];
            let tsts = dataObject.overall_agreement_rate[period]['totals']['total_tests'];
            let val = monthNames[d.getMonth()] + '\n' + d.getFullYear() + "\n (S=" + no + ", T=" + tsts + ")"

            if (!category.includes(val)) {
                category.push(val);
            }

            levelData['Positive_Concordance'].push(totals);
        }

        for (let [level, dataArray] of Object.entries(levelData)) {
            let seriesEntry = {
                name: '',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: ''
            };
            seriesEntry['data'] = dataArray;
            seriesEntry['name'] = levelsMap[level];
            seriesData.push(seriesEntry);
        }

        overallSiteGraphsData[orgName] = [category, seriesData];

        return <RTCard header={orgName} minHeight={props.minHeight}>
            <StackedVertical
                yAxisGap={35}
                yAxisName="concordance" formatter="" color={['#004dc9', '#ffc100']}
                minHeight={props.minHeight} legend={['Positive Concordance']} category={category} series={seriesData} />
        </RTCard>
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

                    }

                }
            });
            if (columns.length > 0) {
                overLay.push(row); //push remaining graphs in display
            }

        } else {
            for (let [key, dataObject] of Object.entries(props.serverData[0])) {
                try {
                    let singChart = prepareOverallLevelSiteData(dataObject);
                    [counter, row, columns, overLay] = addGraphsToArray(counter, row, columns, overLay, singChart);
                } catch (err) {

                }

            }
            if (columns.length > 0) {
                overLay.push(row); //push remaining graphs in display
            }
        }

    } else {

    }

    return (
        <React.Fragment>
            {props.singleItem ? columns : overLay}
        </React.Fragment>
    );
}

export default PositiveConcordanceRateColumnCharts;

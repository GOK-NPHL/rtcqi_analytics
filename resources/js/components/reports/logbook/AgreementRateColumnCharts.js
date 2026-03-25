import React from 'react';
import RTCard from '../../utils/RTCard'
import StackedVertical from '../../utils/charts/StackedVertical'
import { v4 as uuidv4 } from 'uuid';

function AgreementRateColumnCharts(props) {

    function prepareOverallLevelSiteData(dataObject) {
        let overallSiteGraphsData = {};
        let levelsMap = {
            '<95': '<95%',
            '95-98': '95%-98%',
            '>98': '>98%'
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let orgName = dataObject.orgName;

        if (dataObject.orgName) orgName += ' ' + (dataObject['OrgUniType'] != undefined ? dataObject['OrgUniType'] : '');
        orgName = orgName.toUpperCase();
        let overallDataObject = dataObject.overall_agreement_rate;

        let levelData = { '<95': [], '95-98': [], '>98': [] };
        let category = [];
        let seriesData = [];

        for (let [period, totals] of Object.entries(overallDataObject)) {
            let row = [];
            const d = new Date(period);

            let val = monthNames[d.getMonth()] + '\n' + d.getFullYear() + '\n (N=' + totals['totals']['total_sites'] + ') ';

            if (!category.includes(val)) {
                category.push(val);
            }

            for (let [name, value] of Object.entries(totals['totals'])) {
                if (name in levelData) {
                    let val = ((Number(value) / Number(totals['totals']["total_sites"])) * 100).toFixed(1);
                    if (isNaN(val)) val = 0;
                    levelData[name].push(val);
                }
            }
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
                yAxisGap={43}
                yAxisName="% agreement rates" formatter="%" minHeight={props.minHeight} legend={['<95%', '95%-98%', '>98%']} category={category} series={seriesData} />
        </RTCard>
    }

    function addGraphsToArray(counter, row, columns, overLay, singChart) {
        // console.log("adding to chart")
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
            // console.log("hunt bug 3");
            // console.log(props.serverData);
            for (let [key, dataObject] of Object.entries(props.serverData[0])) {
                try {
                    let singChart = prepareOverallLevelSiteData(dataObject);
                    [counter, row, columns, overLay] = addGraphsToArray(counter, row, columns, overLay, singChart);
                } catch (err) {

                }
            }
            // console.log("hunt bug 3-");
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

export default AgreementRateColumnCharts;

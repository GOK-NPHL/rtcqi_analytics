import React from 'react';
import RTCard from '../../utils/RTCard';
import StackedHorizontal from '../../utils/charts/StackedHorizontal';
import { v4 as uuidv4 } from 'uuid';

const levelsMap = {
    level0: 'Level 0 (<40%)', level1: 'Level 1 (40-59%)',
    level2: 'Level 2 (60-79%)', level3: 'Level 3 (80-89%)', level4: 'Level 4 (>90%)',
};

function prepareOverallLevelSiteData(dataObject, minHeight) {
    let orgName = dataObject['orgName'];
    if (dataObject['OrgUniType']) orgName += ' ' + dataObject['OrgUniType'];
    orgName = orgName.toUpperCase();

    const overallSitesObject = dataObject['OverallSitesLevel'];
    const levelData = { level0: [], level1: [], level2: [], level3: [], level4: [] };
    const category = [];

    for (const [timeline, timeLineObjectValue] of Object.entries(overallSitesObject)) {
        if (timeline !== 'sites') {
            if (!category.includes(timeline)) category.push(timeline + ' (N=' + overallSitesObject[timeline]['counter'] + ') ');
            for (const [levelName, levelValue] of Object.entries(timeLineObjectValue)) {
                if (levelName !== 'counter' && levelName !== 'sites') levelData[levelName].push(levelValue);
            }
        }
    }

    const letSeriesData = Object.entries(levelData).map(([level, dataArray]) => ({
        name: levelsMap[level], type: 'bar', stack: 'total',
        label: { show: true }, emphasis: { focus: 'series' }, data: dataArray,
    }));

    return (
        <RTCard header={'OVERALL PERFORMANCE SUMMARY -' + orgName} minHeight={minHeight}>
            <StackedHorizontal minHeight={minHeight} category={category} series={letSeriesData} />
        </RTCard>
    );
}

function addGraphsToArray(counter, row, columns, overLay, singChart) {
    if (counter % 2 === 0) {
        overLay.push(row);
        columns = [];
        row = <div key={uuidv4()} className="row">{columns}</div>;
    }
    columns.push(<div key={uuidv4()} className="col-sm-6 col-xm-12">{singChart}</div>);
    return [counter + 1, row, columns, overLay];
}

function SiteLevelBarCharts({ serverData, siteType, minHeight, singleItem }) {
    let overLay = [], counter = 0, columns = [];
    let row = <div key={uuidv4()} className="row">{columns}</div>;

    if (serverData) {
        if (siteType != null && siteType.length !== 0) {
            if (Array.isArray(serverData[0])) {
                serverData.forEach((dataObjectParent) => {
                    try {
                        const singChart = prepareOverallLevelSiteData(dataObjectParent[0], minHeight);
                        [counter, row, columns, overLay] = addGraphsToArray(counter, row, columns, overLay, singChart);
                    } catch {}
                });
            } else {
                serverData.forEach((dataObjectParent) => {
                    for (const [, orgUnitDataObject] of Object.entries(dataObjectParent)) {
                        try {
                            const singChart = prepareOverallLevelSiteData(orgUnitDataObject, minHeight);
                            [counter, row, columns, overLay] = addGraphsToArray(counter, row, columns, overLay, singChart);
                        } catch {}
                    }
                });
            }
        } else {
            for (const [, dataObject] of Object.entries(serverData)) {
                try {
                    const singChart = prepareOverallLevelSiteData(dataObject, minHeight);
                    [counter, row, columns, overLay] = addGraphsToArray(counter, row, columns, overLay, singChart);
                } catch {}
            }
        }
        if (columns.length > 0) overLay.push(row);
    }

    return <React.Fragment>{singleItem ? columns : overLay}</React.Fragment>;
}

export default SiteLevelBarCharts;

import React, { useEffect } from 'react';
import RTCard from '../../utils/RTCard';
import AvgPerformanceSpider from '../../utils/charts/AvgPerformanceSpider';
import { v4 as uuidv4 } from 'uuid';
import './spi.css';

const indicators = [
    { text: "Personnel\nTraining\n& Certification", max: 100 },
    { text: "QA in\nCounselling", max: 100 },
    { text: "Physical\nFacility", max: 100 },
    { text: "Safety", max: 100 },
    { text: 'Pre-testing\nphase', max: 100 },
    { text: 'Testing\nPhase', max: 100 },
    { text: 'Post-testing\nPhase', max: 100 },
    { text: 'External\nQuality\nAssessment', max: 100 },
];

const dataKeys = ["PersonellTrainingAndCertification", "QACounselling", "PhysicalFacility", "Safety",
    "PreTestingPhase", "TestingPhase", "PostTestingPhase", "ExternalQualityAssessment"];

function prepareOverallLevelSiteData(dataObject, minHeight) {
    let orgName = dataObject['orgName'];
    if (dataObject['OrgUniType']) orgName += ' ' + dataObject['OrgUniType'];
    orgName = orgName.toUpperCase();

    const legend = [];
    const timelineData = {};
    dataKeys.forEach((key) => {
        const valueObj = dataObject[key];
        for (const [timeLine, data] of Object.entries(valueObj)) {
            if (!legend.includes(timeLine)) legend.push(timeLine);
            if (timeLine in timelineData) timelineData[timeLine].push(data);
            else timelineData[timeLine] = [data];
        }
    });

    const letSeriesData = Object.entries(timelineData).map(([timeline, dataArray]) => ({
        value: dataArray,
        name: timeline,
        symbol: 'rect',
        symbolSize: 12,
        label: { show: true, formatter: (params) => params.value },
    }));

    return (
        <RTCard style={{ padding: '0px', minHeight: '500px' }} header={'PERFORMANCE DISTRIBUTION - ' + orgName}>
            <AvgPerformanceSpider indicators={indicators} legend={legend} series={letSeriesData} />
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

function buildOverlay(serverData, siteType, minHeight) {
    let overLay = [], counter = 0, columns = [];
    let row = <div key={uuidv4()} className="row">{columns}</div>;

    if (!serverData) return [overLay, columns];

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
            const singChart = prepareOverallLevelSiteData(dataObject, minHeight);
            [counter, row, columns, overLay] = addGraphsToArray(counter, row, columns, overLay, singChart);
        }
    }

    if (columns.length > 0) overLay.push(row);
    return [overLay, columns];
}

function OverallPerformanceRadar({ serverData, siteType, setMinHeight, minHeight, singleItem }) {
    useEffect(() => {
        if (setMinHeight) {
            $('.echarts-for-react').css('min-height', minHeight);
        } else {
            $('.echarts-for-react').css('min-height', '');
        }
    }, [setMinHeight, minHeight]);

    const [overLay, columns] = buildOverlay(serverData, siteType, minHeight);

    return <React.Fragment>{singleItem ? columns : overLay}</React.Fragment>;
}

export default OverallPerformanceRadar;

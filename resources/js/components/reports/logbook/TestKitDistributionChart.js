import React from 'react';
import EchartsForReact from 'echarts-for-react';
import RTCard from '../../utils/RTCard';
import { v4 as uuidv4 } from 'uuid';

const KIT_LABELS = {
    trinscreen: 'Trinscreen',
    standardq: 'Standard Q',
    dualkit: 'Dual Kit',
    firstresponse: 'First Response',
    bioline: 'Bioline',
    other: 'Other',
};

const KIT_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'];

class TestKitDistributionChart extends React.Component {

    constructor(props) {
        super(props);
        this.prepareOrgData = this.prepareOrgData.bind(this);
    }

    prepareOrgData(dataObject) {
        const orgName = (dataObject.orgName || '').toUpperCase();
        if (dataObject['OrgUniType']) {
            // orgName already set
        }
        const kitDist = dataObject.kit_distribution || {};

        // Aggregate totals across all periods
        const totals = {
            kit1: { trinscreen: 0, standardq: 0, dualkit: 0, firstresponse: 0, bioline: 0, other: 0 },
            kit2: { trinscreen: 0, standardq: 0, dualkit: 0, firstresponse: 0, bioline: 0, other: 0 },
            kit3: { trinscreen: 0, standardq: 0, dualkit: 0, firstresponse: 0, bioline: 0, other: 0 },
        };

        Object.values(kitDist).forEach(monthData => {
            Object.keys(KIT_LABELS).forEach(kitType => {
                totals.kit1[kitType] += monthData[`kit1_${kitType}`] || 0;
                totals.kit2[kitType] += monthData[`kit2_${kitType}`] || 0;
                totals.kit3[kitType] += monthData[`kit3_${kitType}`] || 0;
            });
        });

        const makePieData = (kitTotals) =>
            Object.entries(KIT_LABELS)
                .map(([key, name]) => ({ name, value: kitTotals[key] }))
                .filter(item => item.value > 0);

        const makeOption = (title, pieData) => ({
            title: { text: title, left: 'center', textStyle: { fontSize: 13, fontWeight: 'bold' } },
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { orient: 'vertical', left: 'left', top: 'middle', textStyle: { fontSize: 11 } },
            color: KIT_COLORS,
            toolbox: { right: 10, top: 0, feature: { saveAsImage: {} } },
            series: [{
                type: 'pie',
                radius: ['35%', '62%'],
                center: ['62%', '55%'],
                label: { formatter: '{d}%', fontSize: 11 },
                data: pieData,
            }],
        });

        const tests = [
            { label: 'Test 1 (T1)', kitKey: 'kit1' },
            { label: 'Test 2 (T2)', kitKey: 'kit2' },
            { label: 'Test 3 (T3)', kitKey: 'kit3' },
        ];

        return (
            <RTCard header={orgName} minHeight={this.props.minHeight || 400}>
                <div className="row">
                    {tests.map(({ label, kitKey }) => {
                        const pieData = makePieData(totals[kitKey]);
                        return (
                            <div key={uuidv4()} className="col-sm-12 col-md-4" style={{ minHeight: 320 }}>
                                {pieData.length > 0
                                    ? <EchartsForReact option={makeOption(label, pieData)} style={{ height: '300px' }} />
                                    : <div style={{ textAlign: 'center', paddingTop: '80px', color: 'gray' }}>
                                        <strong>{label}</strong><br /><em>No data</em>
                                    </div>
                                }
                            </div>
                        );
                    })}
                </div>
            </RTCard>
        );
    }

    render() {
        let charts = [];

        if (this.props.serverData) {
            if (this.props.siteType != null && this.props.siteType.length != 0) {
                this.props.serverData.forEach(dataObjectParent => {
                    for (let [orgId, orgUnitDataObject] of Object.entries(dataObjectParent)) {
                        try {
                            charts.push(
                                <div key={uuidv4()} className="row">
                                    <div className="col-sm-12">{this.prepareOrgData(orgUnitDataObject)}</div>
                                </div>
                            );
                        } catch (err) {
                            console.error(err);
                        }
                    }
                });
            } else {
                const dataSrc = Array.isArray(this.props.serverData) && this.props.serverData.length > 0
                    ? this.props.serverData[0]
                    : this.props.serverData;

                if (dataSrc) {
                    for (let [key, dataObject] of Object.entries(dataSrc)) {
                        try {
                            charts.push(
                                <div key={uuidv4()} className="row">
                                    <div className="col-sm-12">{this.prepareOrgData(dataObject)}</div>
                                </div>
                            );
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
            }
        }

        return <React.Fragment>{charts}</React.Fragment>;
    }
}

export default TestKitDistributionChart;

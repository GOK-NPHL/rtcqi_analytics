import React, { useState, useEffect } from 'react';
import EchartsForReact from 'echarts-for-react';

function AvgPerformanceSpider(props) {
    const [option, setOption] = useState({
        color: ['#5470c6', '#91cc75', '#fac858', '#d24dff', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        tooltip: {
            trigger: 'axis'
        },
        toolbox: {
            right: 20,
            top: 0,
            feature: {
                saveAsImage: {}
            }
        },
        radar: {
            center: ['50%', '55%'],
            radius: 150,
            name: {
                textStyle: {
                    color: '#fff',
                    backgroundColor: '#666',
                    borderRadius: 3,
                    padding: [3, 5]
                }
            }
        },
        series: [
            {
                name: 'one',
                type: 'radar',
            }
        ]
    });

    useEffect(() => {
        setOption({
            series: [
                {
                    name: 'one',
                    type: 'radar',
                    tooltip: {
                        trigger: 'item'
                    },
                    data: props.series
                }
            ],
            legend: {
                data: props.legend
            },
            radar: {
                indicator: props.indicators
            }
        });
    }, []);

    useEffect(() => {
        setOption({
            series: [
                {
                    name: 'one',
                    type: 'radar',
                    data: props.series
                }
            ],
            legend: {
                data: props.legend
            },
            indicator: props.indicators,
        });
    }, [props.series, props.legend, props.indicator]);

    return (
        <EchartsForReact
            option={option}
        />
    );
}

export default AvgPerformanceSpider;

import React, { useState, useEffect } from 'react';
import EchartsForReact from 'echarts-for-react';

function StackedHorizontal(props) {
    const [option, setOption] = useState({
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        legend: {
            data: []
        },
        grid: {
            left: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: []
        },
        yAxis: {
            axisLabel: {
                formatter: '{value}' + props.formatter
            },
            name: props.yAxisName,
            nameLocation: 'middle',
            nameGap: props.yAxisGap,
            type: 'value'
        },
        toolbox: {
            right: 20,
            top: 0,
            feature: {
                saveAsImage: {}
            }
        },
        dataZoom: [{
            type: 'inside',
        }, {
        }],
        height: props.minHeight - ((30 / 100) * props.minHeight),
        color: props.color ? props.color : ['#ff2d00', '#ffc100', '#fff000', '#73e502', '#5ba216', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
    });

    useEffect(() => {
        setOption(prevOption => ({
            ...prevOption,
            series: props.series,
            xAxis: {
                data: props.category
            },
            legend: {
                data: props.legend
            }
        }));
    }, []);

    useEffect(() => {
        setOption(prevOption => ({
            ...prevOption,
            series: props.series,
            xAxis: {
                data: props.category
            }
        }));
    }, [props.series, props.category]);

    return (
        <EchartsForReact
            option={option}
        />
    );
}

export default StackedHorizontal;

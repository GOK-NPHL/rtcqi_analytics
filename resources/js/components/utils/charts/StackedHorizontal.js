import React, { useState, useEffect } from 'react';
import EchartsForReact from 'echarts-for-react';

function StackedHorizontal(props) {
    const [option, setOption] = useState({
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['Level 0 (<40%)', 'Level 1 (40-59%)', 'Level 2 (60-79%)', 'Level 3 (80-89%)', 'Level 4 (>90%)']
        },
        grid: {
            left: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            max: 102,
        },
        toolbox: {
            right: 20,
            top: 0,
            feature: {
                saveAsImage: {}
            }
        },
        height: props.minHeight - ((30 / 100) * props.minHeight),
        yAxis: {
            type: 'category',
            data: ['baseline(Y1_Q4)', 'follow-up(Y2_Q1)', 'follow-up(Y2_Q1)', 'follow-up(Y2_Q1)']
        },
        color: ['#ff2d00', '#ffc100', '#fff000', '#73e502', '#5ba216', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
    });

    useEffect(() => {
        setOption(prevOption => ({
            ...prevOption,
            series: props.series,
            yAxis: {
                data: props.category
            }
        }));
    }, []);

    useEffect(() => {
        setOption(prevOption => ({
            ...prevOption,
            series: props.series,
            yAxis: {
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

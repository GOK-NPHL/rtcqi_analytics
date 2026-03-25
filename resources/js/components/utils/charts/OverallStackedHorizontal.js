import React, { useState, useEffect } from 'react';
import EchartsForReact from 'echarts-for-react';

function OverallStackedHorizontal(props) {
    const [option, setOption] = useState({
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['Level 0', 'Level 1 (40-59%)', 'Level 2 (60-79%)', 'Level 3 (80-89%)', 'Level 4 (>90%)']
        },
        grid: {
            left: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        toolbox: {
            right: 20,
            top: 0,
            feature: {
                saveAsImage: {}
            }
        },
        yAxis: {
            type: 'category',
            data: ['baseline(Y1_Q4)', 'follow-up(Y2_Q1)', 'follow-up(Y2_Q1)', 'follow-up(Y2_Q1)']
        },
        color: ['#5470c6', '#91cc75', '#fac858', '#d24dff', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
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

export default OverallStackedHorizontal;

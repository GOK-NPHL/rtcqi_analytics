import React, { useState, useEffect } from 'react';
import EchartsForReact from 'echarts-for-react';

function LineGraph(props) {
    const [option, setOption] = useState({
        legend: {},
        tooltip: {},
        dataset: '',
        xAxis: { type: 'category' },
        yAxis: {},
        series: ''
    });

    useEffect(() => {
        setOption(prevOption => ({
            ...prevOption,
            dataset: props.dataset,
            series: props.series
        }));
    }, []);

    useEffect(() => {
        setOption(prevOption => ({
            ...prevOption,
            dataset: props.dataset1,
            series: props.series
        }));
    }, [props.dataset, props.series]);

    return (
        <EchartsForReact
            option={option}
        />
    );
}

export default LineGraph;

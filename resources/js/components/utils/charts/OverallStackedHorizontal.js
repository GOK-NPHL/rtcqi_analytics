import React from 'react';
import EchartsForReact from 'echarts-for-react';


class OverallStackedHorizontal extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            option: {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // Use axis to trigger tooltip
                        type: 'shadow'        // 'shadow' as default; can also be 'line' or 'shadow'
                    }
                },
                legend: {
                    data: ['Level 0', 'Level 1 (50-59%)', 'Level 2 (60-79%)', 'Level 3 (80-89%)', 'Level 4 (>90%)']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'category',
                    data: ['baseline(Y1_Q4)', 'follow-up(Y2_Q1)', 'follow-up(Y2_Q1)', 'follow-up(Y2_Q1)']
                },
                color: ['#5470c6', '#91cc75', '#fac858','#d24dff', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
            }
        }
    }

    componentDidMount() {
        this.setState({
            option: {
                series: this.props.series,
                yAxis: {
                    data: this.props.category
                }
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.dataset != prevProps.dataset
            ||
            this.props.series != prevProps.series
        ) {
            console.log("load data 1");
            console.log(this.props.series);
            this.setState({
                option: {
                    series: this.props.series,
                    yAxis: {
                        data: this.props.category
                    }
                }
            });
        }

    }


    render() {
        return (

            <EchartsForReact
                option={this.state.option}
            />

        );
    }
}

export default OverallStackedHorizontal;

import React from 'react';
import EchartsForReact from 'echarts-for-react';


class StackedHorizontal extends React.Component {


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
                    data: ['Level 0 (<40%)', 'Level 1 (50-59%)', 'Level 2 (60-79%)', 'Level 3 (80-89%)', 'Level 4 (>90%)']
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
                series: ''
            }
        }
    }

    componentDidMount() {
        this.setState({
            option: {
                series: this.props.series
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.dataset != prevProps.dataset
            ||
            this.props.series != prevProps.series
        ) {
            this.setState({
                option: {
                    series: this.props.series
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

export default StackedHorizontal;

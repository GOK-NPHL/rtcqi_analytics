import React from 'react';
import EchartsForReact from 'echarts-for-react';


class StackedHorizontal extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            option: {
                // tooltip: {
                //     trigger: 'axis',
                //     axisPointer: {            // Use axis to trigger tooltip
                //         type: 'shadow'        // 'shadow' as default; can also be 'line' or 'shadow'
                //     }
                // },
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
                    // right: '4%',
                    // bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: []
                },
                yAxis: {
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
                height: this.props.minHeight-((30/100)*this.props.minHeight),
                color: ['#ff2d00', '#ffc100', '#fff000', '#73e502', '#5ba216', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
            }
        }
    }

    componentDidMount() {

        this.setState({
            option: {
                series: this.props.series,
                xAxis: {
                    data: this.props.category
                },
                legend: {
                    data: this.props.legend
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
                    xAxis: {
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

export default StackedHorizontal;

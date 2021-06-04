import React from 'react';
import EchartsForReact from 'echarts-for-react';


class AvgPerformanceSpider extends React.Component {


    constructor(props) {
        super(props);
        this.state =
        {
            option: {
                color: ['#5470c6', '#91cc75', '#fac858', '#d24dff', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
                // title: {
                //     text: 'chart title'
                // },
                // legend: {
                //     data:  this.props.legend //['Data C', 'Data D']
                // },
                tooltip: {
                    trigger: 'axis'
                },
                radar:
                {
                    // indicator: [
                    //     { text: 'one', max: 150 },
                    //     { text: 'two', max: 150 },
                    //     { text: 'three', max: 150 },
                    //     { text: 'Four', max: 120 },
                    //     { text: 'Five', max: 108 },
                    //     { text: 'Six', max: 72 }
                    // ],

                    // indicator: this.props.indicators,
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
                // series: this.props.series,
                series: [
                    {
                        name: 'one',
                        type: 'radar',
                        // data: [
                        //     {
                        //         value: [120, 118, 130, 100, 99, 70],
                        //         name: 'Data C',
                        //         symbol: 'rect',
                        //         symbolSize: 12,
                        //         label: {
                        //             show: true,
                        //             formatter: function (params) {
                        //                 return params.value;
                        //             }
                        //         }
                        //     },
                        //     {
                        //         value: [100, 93, 50, 90, 70, 60],
                        //         name: 'Data D',
                        //         label: {
                        //             show: true,
                        //             formatter: function (params) {
                        //                 return params.value;
                        //             }
                        //         }
                        //     }
                        // ]

                    }
                ]

            }
        }
    }

    componentDidMount() {

        this.setState({
            option: {
               
                series: [
                    {
                        name: 'one',
                        type: 'radar',
                        tooltip: {
                            trigger: 'item'
                        },
                        data: this.props.series
                    }
                ],
                legend: {
                    data: this.props.legend //['Data C', 'Data D']
                },
                radar: {
                    indicator: this.props.indicators
                }
                 
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.series != prevProps.series
            ||
            this.props.legend != prevProps.legend
            ||
            this.props.indicator != prevProps.indicator
        ) {
            console.log("updating..........");
            this.setState({
                option: {
                    series: [
                        {
                            name: 'one',
                            type: 'radar',
                            data: this.props.series
                        }
                    ],
                    legend: {
                        data: this.props.legend //['Data C', 'Data D']
                    },
                    indicator: this.props.indicators,
                }
            });
        }

    }


    render() {
        console.log("updating.......... 2");
        return (
            <EchartsForReact
                option={this.state.option}
            />

        );
    }
}

export default AvgPerformanceSpider;

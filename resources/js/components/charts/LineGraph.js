import React from 'react';
import EchartsForReact from 'echarts-for-react';


class LineGraph extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            option: {
                legend: {},
                tooltip: {},
                dataset: '',
                xAxis: { type: 'category' },
                yAxis: {},
                // Declare several bar series, each will be mapped
                // to a column of dataset.source by default.
                series: ''
            }
        }
    }

    componentDidMount() {
        this.setState({
            option: {
                dataset: this.props.dataset,
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
                    dataset: this.props.dataset1,
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

export default LineGraph;

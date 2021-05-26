import React from 'react';
import ReactDOM from 'react-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class OrgDate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date(),
            endData: null
        };
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);

    }

    onStartDateChange(date) {
        this.setState({
            startDate: date
        });
    }
    onEndDateChange(date) {
        this.setState({
            startDate: date
        });
    }

    render() {
        const marginLeft = {
            marginLeft: "16px",
        };
        return (
            <React.Fragment>
                <span style={marginLeft}>
                    Start Date: <DatePicker selected={this.state.startDate} onChange={this.onStartDateChange} />
                </span>
                
                <span style={marginLeft}>
                    End Date: <DatePicker selected={this.state.endData} onChange={this.onEndDateChange} />
                </span>
            </React.Fragment>
        );
    }

}

export default OrgDate;
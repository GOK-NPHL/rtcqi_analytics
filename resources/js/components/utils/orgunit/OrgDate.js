import React from 'react';
import ReactDOM from 'react-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class OrgDate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            startDate: null,
            endData: null,
            dateType: "text"
        };
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    onStartDateChange(event) {
        let date = event.target.value;
        this.setState({
            startDate: date
        });
        this.props.orgDateChangeHandler(
            date,
            this.state.endData
        );
    }
    onEndDateChange(event) {
        let date = event.target.value;
        this.setState({
            endData: date
        });
        this.props.orgDateChangeHandler(
            this.state.startDate,
            date
        );
    }

    onFocus() {
        this.setState({
            dateType: 'date'
        });
    }

    onBlur() {
        this.setState({
            dateType: 'text'
        });
    }


    render() {
        const marginLeft = {
            // marginLeft: "16px",
            paddingLeft: "0px"
        };
        const label = {
            paddingRight: "0px",
            marginRight: "0px",
            textAlign: "center"
        }
        // $(".react-datepicker__input-container>input").css("width", "100px");
        // $(".react-datepicker__input-container>input").addClass("form-control");
        // $(".react-datepicker__input-container").css("height", "100px");
        // $(".react-datepicker__input-container>input").css("height", "100px");
        // $( ".react-datepicker-wrapper").css("height", "100px");

        return (
            <React.Fragment>
                <div className="row">

                    <div className="col-sm-6">
                        <form>
                            <div className="form-group row  pr-1">
                                <input
                                    id="startDate"
                                    onChange={() => this.onStartDateChange(event)}
                                    type={this.state.dateType} placeholder="Start date"
                                    className="form-control form-control form-control-sm"
                                    onFocus={this.onFocus}
                                    onBlur={this.onBlur}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="col-sm-6">
                        <form>
                            <div className="form-group row">

                                <input
                                    id="endDate"
                                    onChange={() => this.onEndDateChange(event)}
                                    type={this.state.dateType} placeholder="End date"
                                    className="form-control form-control form-control-sm"
                                    onFocus={this.onFocus}
                                    onBlur={this.onBlur}
                                />
                            </div>
                        </form>
                    </div>

                </div>

            </React.Fragment>
        );
    }

}

export default OrgDate;
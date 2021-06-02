import React from 'react';
import ReactDOM from 'react-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class OrgDate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            startDate: null,
            endData: null
        };
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);

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
                            <div className="form-group row">
                                <label htmlFor="startDate" className="col-sm-3 col-form-label col-form-label-sm">Start date</label>
                                <div className="col-sm-9">
                                    <input onChange={() => this.onStartDateChange(event)} type="date"
                                        className="form-control form-control form-control-sm"
                                        id="startDate"
                                        placeholder="start date" />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="col-sm-6">
                        <form>
                            <div className="form-group row">
                                <label htmlFor="endDate"
                                    className="col-sm-3 col-form-label col-form-label-sm">End date</label>
                                <div className="col-sm-9">
                                    <input onChange={() => this.onEndDateChange(event)} type="date"
                                        className="form-control form-control form-control-sm"
                                        id="endDate"
                                        placeholder="end date" />
                                </div>
                            </div>
                        </form>
                    </div>

                </div>

            </React.Fragment>
        );
    }

}

export default OrgDate;
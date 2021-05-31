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
                                <label htmlFor="colFormLabelSm" className="col-sm-3 col-form-label col-form-label-sm">Start date</label>
                                <div className="col-sm-9">
                                    <input type="date"
                                        className="form-control form-control form-control-sm"
                                        id="colFormLabelSm"
                                        placeholder="start date" />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="col-sm-6">
                        <form>
                            <div className="form-group row">
                                <label htmlFor="colFormLabelSm"
                                    className="col-sm-3 col-form-label col-form-label-sm">End date</label>
                                <div className="col-sm-9">
                                    <input type="date" 
                                    className="form-control form-control form-control-sm" 
                                    id="colFormLabelSm"
                                     placeholder="start date" />
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
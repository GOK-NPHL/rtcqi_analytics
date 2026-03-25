import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function OrgDate(props) {
    const [startDate, setStartDate] = useState(null);
    const [endData, setEndData] = useState(null);
    const [dateType, setDateType] = useState("text");

    function onStartDateChange(event) {
        let date = event.target.value;
        setStartDate(date);
        props.orgDateChangeHandler(date, endData);
    }

    function onEndDateChange(event) {
        let date = event.target.value;
        setEndData(date);
        props.orgDateChangeHandler(startDate, date);
    }

    function onFocus() {
        setDateType('date');
    }

    function onBlur() {
        setDateType('text');
    }

    const marginLeft = {
        paddingLeft: "0px"
    };
    const label = {
        paddingRight: "0px",
        marginRight: "0px",
        textAlign: "center"
    };

    return (
        <React.Fragment>
            <div className="row">

                <div className="col-sm-6">
                    <form>
                        <div className="form-group row  pr-1">
                            <input
                                id="startDate"
                                onChange={(event) => onStartDateChange(event)}
                                type={dateType} placeholder="Start date"
                                className="form-control form-control form-control-sm"
                                onFocus={onFocus}
                                onBlur={onBlur}
                            />
                        </div>
                    </form>
                </div>

                <div className="col-sm-6">
                    <form>
                        <div className="form-group row">
                            <input
                                id="endDate"
                                onChange={(event) => onEndDateChange(event)}
                                type={dateType} placeholder="End date"
                                className="form-control form-control form-control-sm"
                                onFocus={onFocus}
                                onBlur={onBlur}
                            />
                        </div>
                    </form>
                </div>

            </div>
        </React.Fragment>
    );
}

export default OrgDate;

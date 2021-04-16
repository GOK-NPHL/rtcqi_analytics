import React from 'react';
import ReactDOM from 'react-dom';


class StatsLabel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <React.Fragment>
                <div className={`card  shadow h-100 py-2 ${this.props.borderStyling}`}>
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className={`text-xs font-weight-bold text-uppercase mb-1 ${this.props.textStyling}`}
                                    className="">
                                    {this.props.text}</div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{this.props.value}</div>
                            </div>
                            <div className="col-auto">
                                <i className={`fas fa-2x text-gray-300 ${this.props.faIcon}`}
                                ></i>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default StatsLabel;
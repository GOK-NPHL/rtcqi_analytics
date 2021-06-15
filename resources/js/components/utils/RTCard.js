import React from 'react';


class RTCard extends React.Component {


    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {

    }


    render() {
        let style =this.props.style;
        if(this.props.minHeight){
            style={"minHeight": this.props.minHeight}
        }

        return (

            <React.Fragment>
                <div className="card shadow mb-4">
                    {/* Card Header - Dropdown */}
                    <div
                        className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 className="m-0 font-weight-bold text-primary">{this.props.header}</h6>
                        <div className="dropdown no-arrow">
                            <a className="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i className="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                            </a>
                            <div className="dropdown-menu dropdown-menu-right shadow animated--fade-in"
                                aria-labelledby="dropdownMenuLink">
                                <div className="dropdown-header">Download:</div>
                                <a className="dropdown-item" href="#">Export SVG</a>
                                <a className="dropdown-item" href="#">Export PNG</a>
                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" href="#">Export PDF</a>
                            </div>
                        </div>
                    </div>
                    {/* Card Body */}
                    <div id="cardBody" style={style} className="card-body">
                        <div className="chart-area">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </React.Fragment>

        );
    }
}

export default RTCard;

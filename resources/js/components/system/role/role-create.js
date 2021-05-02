import React from 'react';
import ReactDOM from 'react-dom';

class RoleCreate extends React.Component {


    constructor(props) {
        super(props);

    }

    componentDidMount() {

    }

    render() {

        return (
            <React.Fragment>

                <div id="registration_form" className="card shadow mb-4">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary">Role Creation</h6>
                    </div>
                    <div className="card-body">

                        <div className="card mb-4 py-3 border-left-secondary">
                            <div className="card-body">
                                <form className="needs-validation" novalidate>
                                    <div className="form-row">
                                        <div className="col-md-12 mb-3">
                                            <label for="validationTooltip01">Role name</label>
                                            <input type="text" className="form-control" id="validationTooltip01" value="CMLC" required />
                                            <div className="valid-tooltip">Looks good!</div>
                                        </div>
                                    </div>

                                    <button className="btn btn-primary" type="submit">Save Role</button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default RoleCreate;

import React from 'react';
import ReactDOM from 'react-dom';

class Orgunit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        const imgStyle = {
            width: "100%"
        };

        const rowStle = {
            marginBottom: "5px"
        };

        return (
            <React.Fragment>

                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0 text-gray-500">Roles Management</h1>
                    <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-users fa-sm text-white-50"></i> Create Roles</a>
                </div>

            </React.Fragment>
        );
    }

}

export default Orgunit;

if (document.getElementById('roles')) {
    ReactDOM.render(<Orgunit/>, document.getElementById('roles'));
}
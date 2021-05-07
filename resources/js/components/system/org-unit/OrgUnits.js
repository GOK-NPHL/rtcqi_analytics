import React from 'react';
import ReactDOM from 'react-dom';
import TreeView from '../../utils/TreeView';


function Orgunit() {

    const imgStyle = {
        width: "100%"
    };

    const rowStle = {
        marginBottom: "5px"
    };


    return <React.Fragment>

        {/* Page Heading */}
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
            <h1 className="h4 mb-0 text-gray-500">Organisation Unit Management</h1>
            <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                className="fas fa-sitemap fa-sm text-white-50"></i> Create Organisation Unit</a>
        </div>
        <TreeView />

    </React.Fragment>
}

export default Orgunit;

if (document.getElementById('orgunits')) {
    ReactDOM.render(<Orgunit />, document.getElementById('orgunits'));
}
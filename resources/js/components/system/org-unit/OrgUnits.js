import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import TreeView from '../../utils/TreeView';
import OrgunitCreate from './CreateOrgunits';
import DataTable from "react-data-table-component";
import movies from "./movies";



function Orgunit() {

    const [showOrgunitLanding, setShowOrgunitLanding] = useState(true);


    const imgStyle = {
        width: "100%"
    };

    const rowStle = {
        marginBottom: "5px"
    };

    const columns = [
        {
            name: "Title",
            selector: "title",
            sortable: true
        },
        {
            name: "Directior",
            selector: "director",
            sortable: true
        },
        {
            name: "Runtime (m)",
            selector: "runtime",
            sortable: true,
            right: true
        }
    ];

    let pageContent = '';

    if (showOrgunitLanding) {
        pageContent = <React.Fragment>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h4 mb-0 text-gray-500">Organisation Unit Management</h1>
                <a href="#" onClick={() => setShowOrgunitLanding(false)} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-sitemap fa-sm text-white-50"></i> Create Organisation Unit</a>
            </div>
            <div className="row">
                <div className="col-sm-3">
                    <TreeView />
                </div>
                <div className="col-sm-9">
                    {/* <DataTable
                        title="Movies"
                        columns={columns}
                        data={movies}
                        defaultSortFieldId={1}
                        pagination
                        selectableRows
                    /> */}
                </div>
            </div>

        </React.Fragment>

    } else {
        pageContent = <OrgunitCreate
            setShowOrgunitLanding={setShowOrgunitLanding}
        />;
    }

    return <React.Fragment>
        {pageContent}
    </React.Fragment>
}

export default Orgunit;

if (document.getElementById('orgunits')) {
    ReactDOM.render(<Orgunit />, document.getElementById('orgunits'));
}
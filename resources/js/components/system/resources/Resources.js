import React from 'react';
import ReactDOM from 'react-dom';

import { exportToExcel, FetchUserAuthorities, FetchAllFiles, FetchPublicFiles, FetchPrivateFiles, SaveFile, DeleteFile } from '../../utils/Helpers'
import 'jspdf-autotable'
import Pagination from 'react-js-pagination';
import OrgDate from '../../utils/orgunit/OrgDate';


class ResourceFiles extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            auths: [],
            files: [],
            fileForUpload: null,
            fileForUploadPublic: "0",
            message: '',
            status: null,
        }
        this.uploadFile = this.uploadFile.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
    }

    componentDidMount() {
        (async () => {
            let returnedData = await FetchAllFiles();
            this.setState({
                files: returnedData,
            });

            FetchUserAuthorities().then((auths) => {
                this.setState({ auths: auths });
            }).catch((err) => {
                console.log(err);
            })

        })();

    }

    uploadFile(fl, isPub) {
        (async () => {
            let result = await SaveFile(fl, isPub);
            // console.log('uploadFile response:::: ', result);
            if (result.data.status === 'success') {
                this.setState({
                    files: result.data.data,
                    message: 'File uploaded successfully',
                    status: 200,
                });
            } else {
                this.setState({
                    message: result.data.message,
                    status: 500,
                });
            }
            document.getElementById('file_').value = '';
            $('#uploadModal').modal('hide');
        })();
    }

    deleteFile(id) {
        (async () => {
            let result = await DeleteFile(id);
            // console.log('deleteFile response:::: ', result);
            if (result.data.status === 'success') {
                this.setState({
                    files: result.data.data,
                    message: 'File deleted successfully',
                    status: 200,
                });
            } else {
                this.setState({
                    message: result.data.message,
                    status: 500,
                });
            }
        })();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true
        // if (prevState.showUserTable !== this.state.showUserTable) {
        //     // this.getUsers();
        // }
    }


    render() {

        return (

            <React.Fragment>

                {/* Page Heading */}
                {this.state.status && this.state.status != null && this.state.message && this.state.message != null && <div className="row">
                    <div className="col-lg-12">
                        <div className={"alert alert-" + (this.state.status == 200 ? "success" : "danger")}>
                            <button type="button" className="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                            <strong>
                                {this.state.status == 200 ? "Success" : "Error"}
                            </strong>
                            <p>{this.state.message}</p>
                        </div>
                    </div>
                </div>}

                {/* Filter bar */}
                <div className="row">
                    <div className="col-md-6">
                        <h1 className="h4 mb-0">Files</h1>
                    </div>
                    <div className="col-sm-6  col-lg-4 col-md-4 mb-sm-1 mb-1">
                        {this.state.auths && this.state.auths.includes('manage_resources') &&
                            <>&nbsp;&nbsp;<a className="btn btn-success" data-toggle="modal" href='#uploadModal'>Upload new file</a>&nbsp;&nbsp;</>
                        }
                    </div>
                </div>
                {/* end filter bar */}

                <div className="row">
                    <div className="col-md-12">
                        {/* <div className="col-md-12" style={{ backgroundColor: '#fff', color: 'black', padding: '7px', borderRadius: '6px', margin: '2em auto' }}>
                            <h6>
                                <details>
                                    <summary>this.state.files</summary>
                                    <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                                        <pre>
                                            {JSON.stringify(this.state.files, null, 1)}
                                        </pre>
                                    </div>
                                </details>
                            </h6><br />
                            <h6>Status: {this.state.status}</h6>
                            <h6>Message: {this.state.message}</h6>
                            <small>
                                <details>
                                    <summary>this.state.auths</summary>
                                    <div className='p-4' style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#cfffcf', border: '1px solid limegreen', borderRadius: '4px', fontFamily: 'monospace', color: 'black', fontWeight: 500 }}>
                                        <pre>
                                            {JSON.stringify(this.state.auths, null, 1)}
                                        </pre>
                                    </div>
                                </details>
                            </small><br />
                        </div> */}
                        <div className="table-responsive">
                            <table className='table table-striped table-condensed'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Size</th>
                                        <th>Is public?</th>
                                        {this.state.auths && this.state.auths.includes('manage_resources') && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.files && this.state.files.length > 0 ? this.state.files.map(fl => (
                                        <tr key={fl.id}>
                                            <td style={{ border: '1px solid #ccd6e3' }}>
                                                <a href={
                                                    window.location.origin + '/api/resources/files/download/' + fl['id']
                                                } target="_blank" download={fl['name']}>{fl['name']}</a>
                                            </td>
                                            <td style={{ border: '1px solid #ccd6e3' }}>{Intl.NumberFormat('en-GB').format(fl['size'] / 1000000) + "MB"}</td>
                                            <td style={{ border: '1px solid #ccd6e3' }}>{fl['is_public'] == "1" || fl['is_public'] === true ? <span title="Visible to the public" className="badge badge-success"><i className="fa fa-globe"></i> Yes</span> : <span title="Only visible to logged in users" className="badge badge-danger"><i className="fa fa-lock"></i> No</span>}</td>
                                            {this.state.auths && this.state.auths.includes('manage_resources') &&
                                                <td style={{ border: '1px solid #ccd6e3' }}>
                                                    {/* <a href={
                                                    window.location.origin + '/api/resources/files/download/' + fl['id']
                                                } target="_blank" download={fl['name']} className="btn btn-info btn-xs" style={{ padding: '3px 5px', fontSize: '0.7em', background: 'darkcyan', borderColor: 'transparent' }}>Download</a>
                                                &nbsp; &nbsp; &nbsp; */}
                                                    <button className="btn btn-danger btn-xs" style={{ padding: '3px 5px', fontSize: '0.7em' }} onClick={(ev) => {
                                                        ev.preventDefault();
                                                        window.confirm('Are you sure you want to delete this file?') && this.deleteFile(fl['id']);
                                                    }}>Delete</button>
                                                </td>
                                            }
                                        </tr>
                                    )) : <tr>
                                        <th colSpan={4}>No files at this moment. Check later.</th>
                                    </tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="uploadModal">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={(ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                // console.log('this.state.fileForUpload::: ', this.state.fileForUpload);
                                // console.log('t::: ', typeof this.state.fileForUpload);
                                if (this.state.fileForUpload && this.state.fileForUpload != null) {
                                    this.uploadFile(this.state.fileForUpload, this.state.fileForUploadPublic);
                                } else {
                                    this.setState({
                                        message: 'Please select a file to upload',
                                        status: 500,
                                    });
                                }
                            }}>
                                <div className="modal-header">
                                    <h5 className="modal-title text-center">UPLOAD NEW FILE</h5>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label htmlFor="file_">Pick a file</label>
                                        <input type="file" className="form-control" id="file_" name="file_" placeholder="Input field" onChange={(f) => {
                                            this.setState({
                                                fileForUpload: f.target.files[0]
                                            })
                                        }} />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor="public">Is this file public?</label>
                                        <br />
                                        <label>
                                            <input type="radio" name="public" value="1" onChange={(ev) => {
                                                this.setState({
                                                    fileForUploadPublic: ev.target.value
                                                })
                                            }} /> Yes
                                        </label>
                                        &nbsp; &nbsp; &nbsp; &nbsp;
                                        <label>
                                            <input type="radio" name="public" value="0" onChange={(ev) => {
                                                this.setState({
                                                    fileForUploadPublic: ev.target.value
                                                })
                                            }} /> No
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" id="dismissUpload" className="btn btn-link" data-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Upload</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default ResourceFiles;


if (document.getElementById('resourcefiles')) {
    let domValues = [];
    let domValuesMap = {};
    domValues.forEach(element => {
        for (const property in element) {
            domValuesMap[property] = element[property];
        }
    });

    const props = Object.assign({}, domValuesMap);
    ReactDOM.render(<ResourceFiles {...props} />, document.getElementById('resourcefiles'));
}

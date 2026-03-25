import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { FetchUserAuthorities, FetchAllFiles, SaveFile, DeleteFile } from '../../utils/Helpers';
import 'jspdf-autotable';

function ResourceFiles() {
    const [auths, setAuths] = useState([]);
    const [files, setFiles] = useState([]);
    const [fileForUpload, setFileForUpload] = useState(null);
    const [fileForUploadPublic, setFileForUploadPublic] = useState('0');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(null);

    useEffect(() => {
        (async () => {
            const data = await FetchAllFiles();
            setFiles(data);
        })();
        FetchUserAuthorities().then(setAuths).catch(console.error);
    }, []);

    const uploadFile = async (fl, isPub) => {
        const result = await SaveFile(fl, isPub);
        if (result.data.status === 'success') {
            setFiles(result.data.data);
            setMessage('File uploaded successfully');
            setStatus(200);
        } else {
            setMessage(result.data.message);
            setStatus(500);
        }
        document.getElementById('file_').value = '';
        $('#uploadModal').modal('hide');
    };

    const deleteFile = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        const result = await DeleteFile(id);
        if (result.data.status === 'success') {
            setFiles(result.data.data);
            setMessage('File deleted successfully');
            setStatus(200);
        } else {
            setMessage(result.data.message);
            setStatus(500);
        }
    };

    const canManage = auths?.includes('manage_resources');

    return (
        <React.Fragment>
            {status && message && (
                <div className="row">
                    <div className="col-lg-12">
                        <div className={`alert alert-${status === 200 ? 'success' : 'danger'}`}>
                            <button type="button" className="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                            <strong>{status === 200 ? 'Success' : 'Error'}</strong>
                            <p>{message}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col-md-6"><h1 className="h4 mb-0">Files</h1></div>
                <div className="col-sm-6 col-lg-4 col-md-4 mb-1">
                    {canManage && <a className="btn btn-success" data-toggle="modal" href="#uploadModal">Upload new file</a>}
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="table-responsive">
                        <table className="table table-striped table-condensed">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Is public?</th>
                                    {canManage && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {files?.length > 0 ? files.map(fl => (
                                    <tr key={fl.id}>
                                        <td style={{ border: '1px solid #ccd6e3' }}>
                                            <a href={window.location.origin + '/api/resources/files/download/' + fl['id']} target="_blank" download={fl['name']}>{fl['name']}</a>
                                        </td>
                                        <td style={{ border: '1px solid #ccd6e3' }}>{Intl.NumberFormat('en-GB').format(fl['size'] / 1000000)}MB</td>
                                        <td style={{ border: '1px solid #ccd6e3' }}>
                                            {fl['is_public'] == '1' || fl['is_public'] === true
                                                ? <span title="Visible to the public" className="badge badge-success"><i className="fa fa-globe"></i> Yes</span>
                                                : <span title="Only visible to logged in users" className="badge badge-danger"><i className="fa fa-lock"></i> No</span>}
                                        </td>
                                        {canManage && (
                                            <td style={{ border: '1px solid #ccd6e3' }}>
                                                <button className="btn btn-danger btn-xs" style={{ padding: '3px 5px', fontSize: '0.7em' }} onClick={() => deleteFile(fl['id'])}>Delete</button>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr><th colSpan={4}>No files at this moment. Check later.</th></tr>
                                )}
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
                            if (fileForUpload) uploadFile(fileForUpload, fileForUploadPublic);
                            else { setMessage('Please select a file to upload'); setStatus(500); }
                        }}>
                            <div className="modal-header">
                                <h5 className="modal-title text-center">UPLOAD NEW FILE</h5>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="file_">Pick a file</label>
                                    <input type="file" className="form-control" id="file_" name="file_" onChange={f => setFileForUpload(f.target.files[0])} />
                                </div>
                                <div className="form-group">
                                    <label>Is this file public?</label><br />
                                    <label><input type="radio" name="public" value="1" onChange={e => setFileForUploadPublic(e.target.value)} /> Yes</label>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <label><input type="radio" name="public" value="0" onChange={e => setFileForUploadPublic(e.target.value)} /> No</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-link" data-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-primary">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default ResourceFiles;

const el = document.getElementById('resourcefiles');
if (el) ReactDOM.createRoot(el).render(<ResourceFiles />);

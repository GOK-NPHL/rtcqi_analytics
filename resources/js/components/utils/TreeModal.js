import React from 'react';

function TreeModal(props) {
    return (
        <React.Fragment>
            <div className="modal fade" id="orgActionModal" tabIndex="-1" role="dialog" aria-labelledby="orgActionModalTitle" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Org Unit Action</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">

                            {/* Orgunit menu Action Tabs*/}
                            <section className="container">
                                <div className="row">
                                    <div className="col-sm-12">

                                        <ul id="tabs" className="nav nav-tabs">
                                            {props.allowedPermissions.includes('add_orgunit') ?
                                                <li className="nav-item" role="presentation">
                                                    <a className="nav-link active" id="home-tab"
                                                        data-toggle="tab" href="#home1" role="tab" aria-controls="home"
                                                        aria-selected="true"
                                                        onClick={() => {
                                                            props.updateOrgActionStatus('Add');
                                                        }}>
                                                        Add Sub-Orgunit
                                                    </a>
                                                </li> :
                                                ''
                                            }
                                            {props.allowedPermissions.includes('edit_orgunit') ?
                                                <li className="nav-item" role="presentation">
                                                    <a className={`nav-link ${!props.allowedPermissions.includes('add_orgunit') ? 'active' : ''}`} id="profile-tab"
                                                        data-toggle="tab" href="#profile1" role="tab"
                                                        aria-controls="profile"
                                                        aria-selected="false"
                                                        onClick={() => {
                                                            props.updateOrgActionStatus('Edit');
                                                        }}
                                                    >Edit Orgunit</a>
                                                </li>
                                                :
                                                ''
                                            }
                                            {props.allowedPermissions.includes('delete_orgunit') ?
                                                <li className="nav-item" role="presentation">
                                                    <a className={`nav-link ${!props.allowedPermissions.includes('delete_orgunit') ? 'active' : ''}`} id="delete_org-tab"
                                                        data-toggle="tab" href="#delete_org" role="tab"
                                                        aria-controls="delete_org"
                                                        aria-selected="false"
                                                        onClick={() => {
                                                            props.updateOrgActionStatus('Delete');
                                                        }}
                                                    >Delete</a>
                                                </li>
                                                :
                                                ''
                                            }
                                        </ul>
                                        <br />
                                        <div id="tabsContent" className="tab-content">
                                            <div id="home1"
                                                className={`tab-pane fade ${props.allowedPermissions.includes('add_orgunit') ? 'active  show' : ''}`}>
                                                <h6 className="text-left">Add a sub-orgunit to selected orgunit</h6>
                                                <br />
                                                Orgunit name <input type="text" onChange={(event) => {
                                                    props.setNewOrgUnitName(event.target.value);
                                                }} />

                                            </div>
                                            <div id="profile1"
                                                className={`tab-pane fade ${!props.allowedPermissions.includes('add_orgunit') ? 'active  show' : ''}`} >
                                                <h6 className="text-left">Edit selected orgunit</h6>
                                                <br />
                                                Orgunit name <input type="text"
                                                    defaultValue={props.currentSelectedOrg ? props.currentSelectedOrg.name : ''}
                                                    onChange={event => {
                                                        props.setNewEditOrgUnitName(event.target.value);
                                                    }}
                                                />
                                            </div>
                                            <div id="delete_org"
                                                className={`tab-pane fade ${!props.allowedPermissions.includes('edit_orgunit')
                                                    &&
                                                    !props.allowedPermissions.includes('add_orgunit')
                                                    ? 'active  show' : ''}`} >
                                                <strong>CliCk Save to delete {props.currentSelectedOrg ? props.currentSelectedOrg.name : 'error'}</strong>
                                                <p>Deleting organisation units will detach users from assigned org units, proceed?</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button"
                                onClick={() => {
                                    props.saveOrgUnitAction();
                                    $('#orgActionModal').modal('toggle');
                                }}
                                className="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default TreeModal;

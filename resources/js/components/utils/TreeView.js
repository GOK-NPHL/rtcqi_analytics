import React, { useState, useEffect } from 'react';

import '../../../css/TreeView.css';
import { AddSubOrg, FetchUserAuthorities, DeleteOrg } from './Helpers';
import { v4 as uuidv4 } from 'uuid';
import TreeModal from './TreeModal';
import Tree from './Tree';

function TreeView(props) {
    const [orgUnitAction, setOrgUnitAction] = useState('Add');
    const [currentSelectedOrg, setCurrentSelectedOrgState] = useState(null);
    const [newOrgUnitName, setNewOrgUnitNameState] = useState(null);
    const [newEditOrgUnitName, setNewEditOrgUnitNameState] = useState('');
    const [allowedPermissions, setAllowedPermissions] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);

    useEffect(() => {
        (async () => {
            let perms = await FetchUserAuthorities();
            setAllowedPermissions(perms);

            if (!perms.includes('add_orgunit')) {
                setOrgUnitAction('Edit');
            }
        })();
    }, []);

    function updateOrgActionStatus(status) {
        setOrgUnitAction(status);
    }

    function saveOrgUnitAction() {
        if (orgUnitAction == 'Add') {
            (async () => {
                let response = await AddSubOrg(currentSelectedOrg, newOrgUnitName);
                setAlertMessage(response.data.Message);
                $('#alertMessageModal').modal('toggle');
            })();
        } else if (orgUnitAction == 'Edit') {
            props.updateOrg(
                currentSelectedOrg['id'],
                newEditOrgUnitName);
        } else if (orgUnitAction == 'Delete') {
            (async () => {
                let orgUnitToDelete = currentSelectedOrg;
                orgUnitToDelete['org_unit_id'] = orgUnitToDelete['id'];
                let returnedData = await DeleteOrg(orgUnitToDelete);
                localStorage.removeItem('orgunitList');
                localStorage.removeItem("treeStruc");
                localStorage.removeItem("orgunitTableStruc");
                let message = returnedData.data.Message + ". Your brower might freeze as the tree is refreshed";
                setAlertMessage(message);
                $('#alertMessageModal').modal('toggle');
            })();
        }
    }

    function setNewOrgUnitName(name) {
        setNewOrgUnitNameState(name);
    }

    function setNewEditOrgUnitName(name) {
        setNewEditOrgUnitNameState(name);
    }

    function setcurrentSelectedOrg(org) {
        setCurrentSelectedOrgState(org);
        try {
            props.setcurrentSelectedOrg(org);
        } catch (err) {
        }
    }

    return (
        <React.Fragment>
            <Tree
                assignedOrgUnits={props.assignedOrgUnits ? props.assignedOrgUnits : []}
                addCheckBox={props.addCheckBox}
                clickHandler={props.clickHandler}
                orgUnits={props.orgUnits}
                isHooks={props.isHooks ? true : false}
                setcurrentSelectedOrg={setcurrentSelectedOrg}
                setNewEditOrgUnitName={setNewEditOrgUnitName}
            ></Tree>

            {(allowedPermissions.length > 0) &&
                (allowedPermissions.includes('edit_orgunit') ||
                    allowedPermissions.includes('add_orgunit')
                ) ?
                <TreeModal
                    allowedPermissions={allowedPermissions}
                    setNewOrgUnitName={setNewOrgUnitName}
                    currentSelectedOrg={currentSelectedOrg}
                    setNewEditOrgUnitName={setNewEditOrgUnitName}
                    newEditOrgUnitName={newEditOrgUnitName}
                    saveOrgUnitAction={saveOrgUnitAction}
                    updateOrgActionStatus={updateOrgActionStatus}
                >
                </TreeModal>
                : undefined
            }

            {/* Alert message modal*/}
            <div className="modal fade" id="alertMessageModal" tabIndex="-1" role="dialog" aria-labelledby="alertMessageModalTitle" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Notice!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>{alertMessage}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button"
                                onClick={() => {
                                    $('#alertMessageModal').modal('toggle');
                                    setAlertMessage(null);
                                }}
                                className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default TreeView;

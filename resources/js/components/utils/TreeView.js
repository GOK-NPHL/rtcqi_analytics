import React from 'react';

import '../../../css/TreeView.css';
import { AddSubOrg, FetchUserAuthorities } from './Helpers';
import { v4 as uuidv4 } from 'uuid';
import TreeModal from './TreeModal';
import Tree from './Tree';

class TreeView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnitAction: 'Add',
            currentSelectedOrg: null,
            newOrgUnitName: null,
            newEditOrgUnitName: '',
            allowedPermissions: []
        }
        this.getXYCoordinates = this.getXYCoordinates.bind(this);
        this.updateOrgActionStatus = this.updateOrgActionStatus.bind(this);
        this.saveOrgUnitAction = this.saveOrgUnitAction.bind(this);
        this.setNewOrgUnitName = this.setNewOrgUnitName.bind(this);
        this.setNewEditOrgUnitName = this.setNewEditOrgUnitName.bind(this);
        this.setcurrentSelectedOrg = this.setcurrentSelectedOrg.bind(this);
    }

    componentDidMount() {
        (async () => {
            let allowedPermissions = await FetchUserAuthorities();
            this.setState({
                allowedPermissions: allowedPermissions
            });

            if (!allowedPermissions.includes('add_orgunit')) {
                this.setState({
                    orgUnitAction: 'Edit'
                });
            }

        })();
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     if (
    //         nextProps.orgUnitAction !== nextProps.orgUnitAction ||
    //         nextProps.alertMessage !== nextProps.alertMessage ||
    //         nextState.newOrgUnitName != this.state.newOrgUnitName ||
    //         nextState.currentSelectedOrg != this.state.currentSelectedOrg ||
    //         this.state.newOrgUnitName != null ||
    //         this.state.currentSelectedOrg != null
    //     ) {
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }

    organisationUnitOnclick(event) {
        // event.stopPropagation();

        let el = event.target.nextElementSibling;
        while (el) {
            el.classList.toggle("nested");
            el = el.nextElementSibling;
        }
        event.target.classList.toggle("caret-down");
    }

    getXYCoordinates(event) {
        event.preventDefault();
        this.setState({
            xPos: event.clientX,
            yPos: event.clientY,
            showMenu: true
        });

    }

    updateOrgActionStatus(status) {
        this.setState({
            orgUnitAction: status
        });
    }

    saveOrgUnitAction() {
        if (this.state.orgUnitAction == 'Add') {
            (async () => {
                let response = await AddSubOrg(this.state.currentSelectedOrg, this.state.newOrgUnitName);
                this.setState({
                    alertMessage: response.data.Message
                });
                $('#alertMessageModal').modal('toggle');
            })();
        } else if (this.state.orgUnitAction == 'Edit') {
            this.props.updateOrg(
                this.state.currentSelectedOrg['id'],
                this.state.newEditOrgUnitName);
        }
        // localStorage.removeItem('orgunitList');
    }

    setNewOrgUnitName(newOrgUnitName) { //for new sub org unit
        this.setState({
            newOrgUnitName: newOrgUnitName
        });
    }

    setNewEditOrgUnitName(newEditOrgUnitName) { //for update
        this.setState({
            newEditOrgUnitName: newEditOrgUnitName
        });
    }

    setcurrentSelectedOrg(currentSelectedOrg) {

        this.setState({
            currentSelectedOrg: currentSelectedOrg
        });
    }

    render() {

        let index = 0;
        return (

            <React.Fragment>

                {/* {treeStruc} */}
                <Tree
                    addCheckBox={this.props.addCheckBox}
                    clickHandler={this.props.clickHandler}
                    orgUnits={this.props.orgUnits}
                    setcurrentSelectedOrg={this.setcurrentSelectedOrg}
                     setNewEditOrgUnitName={this.setNewEditOrgUnitName}
                ></Tree>


                {(this.state.allowedPermissions.length > 0) &&
                    (this.state.allowedPermissions.includes('edit_orgunit') ||
                        this.state.allowedPermissions.includes('add_orgunit')
                    ) ?
                    <TreeModal
                        allowedPermissions={this.state.allowedPermissions}
                        setNewOrgUnitName={this.setNewOrgUnitName}
                        currentSelectedOrg={this.state.currentSelectedOrg}
                        setNewEditOrgUnitName={this.setNewEditOrgUnitName}
                        newEditOrgUnitName={this.state.newEditOrgUnitName}
                        saveOrgUnitAction={this.saveOrgUnitAction}
                        updateOrgActionStatus={this.updateOrgActionStatus}
                    >
                    </TreeModal>

                    : undefined //else if not permssions undefined
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
                                <p>{this.state.alertMessage}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button"
                                    onClick={() => {
                                        $('#alertMessageModal').modal('toggle');
                                        this.setState({
                                            alertMessage: null
                                        });
                                    }}
                                    className="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>

        );
    }
}

export default TreeView;

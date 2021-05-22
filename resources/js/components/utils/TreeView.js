import React from 'react';

import '../../../css/TreeView.css';
import { AddSubOrg } from './Helpers';

class TreeView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orgUnitAction: '',
            currentSelectedOrg: null,
            newOrgUnitName: '',
            newEditOrgUnitName: ''
        }
        this.getXYCoordinates = this.getXYCoordinates.bind(this);
        this.updateOrgActionStatus = this.updateOrgActionStatus.bind(this);
        this.orgUnitAction = this.orgUnitAction.bind(this);
    }

    componentDidMount() {
        console.log("loding component");
    }

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevState.pokemons !== this.state.pokemons) {
    //         console.log('pokemons state has changed.')
    //     }
    // }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            nextProps.orgUnitAction !== nextProps.orgUnitAction ||
            nextProps.currentSelectedOrg !== nextProps.currentSelectedOrg ||
            nextProps.alertMessage !== nextProps.alertMessage
        ) {
            return false;
        } else {
            return true;
        }
    }

    organisationUnitOnclick(event) {
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

    orgUnitAction() {
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
                this.state.newEditOrgUnitName,
                this.props.setNewOrgToName,
                this.props.setOrgToEdit);
        }

    }

    render() {

        let arrayUIparser = (arr) => {
            const res = [];
            arr.map((item, index) => {
                let { name, children } = arr[index];
                if (children.length > 0) {
                    res.push(
                        <li key={`${index}__${name}`} >
                            {this.props.addCheckBox ?
                                <input style={{ "marginRight": "2px" }} type="checkbox" onClick={() => this.props.clickHandler(item)} />
                                : ''
                            }<span onClick={() => this.organisationUnitOnclick(event)} onContextMenu={(event) => {
                                event.preventDefault();
                                this.setState({
                                    currentSelectedOrg: item,
                                    newOrgUnitName: item.name
                                });
                                $('#orgActionModal').modal('toggle');
                            }} className="caret">{name}</span>

                            {children.map((item) => {
                                return <ul key={`${index}__${name}_${item.name}`} className={`${item.level > 2 ? "nested" : ""}`}>
                                    <li>
                                        {this.props.addCheckBox ?
                                            <input style={{ "marginRight": "2px" }} type="checkbox" onClick={() => this.props.clickHandler(item)} />
                                            : ''
                                        }<span onClick={() => this.organisationUnitOnclick(event)} onContextMenu={(event) => {
                                            event.preventDefault();
                                            this.setState({
                                                currentSelectedOrg: item,
                                                newOrgUnitName: item.name
                                            });
                                            $('#orgActionModal').modal('toggle');
                                        }} className="caret">{item.name}</span>

                                        {arrayUIparser(item.children)}
                                    </li>
                                </ul>

                            })}
                        </li>);
                } else {
                    res.push(<li key={index} >
                        {this.props.addCheckBox ?
                            <input style={{ "marginRight": "2px" }} type="checkbox" onClick={() => this.props.clickHandler(item)} />
                            : ''
                        }<span onClick={() => this.organisationUnitOnclick(event)} onContextMenu={(event) => {
                            event.preventDefault();
                            this.setState({
                                currentSelectedOrg: item,
                                newOrgUnitName: item.name
                            });
                            $('#orgActionModal').modal('toggle');
                        }}>{item.name}</span>

                    </li>);
                }
            });

            return <ul >{res}</ul>;
        }
        let treeStruc = [
            {
                id: 0,
                name: "No Orgunits Defined",
                level: 0,
                children: []
            }
        ];
        if (this.props.orgUnits) {
            if (this.props.orgUnits.length != 0) {
                treeStruc = arrayUIparser(this.props.orgUnits);
            } else {
                treeStruc = arrayUIparser(treeStruc);
            }
        } else {
            treeStruc = arrayUIparser(treeStruc);
        }
        let index = 0;

        return (

            <React.Fragment>

                {treeStruc}
                {/* Contenxt menu modal*/}
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
                                                <li className="nav-item"><a href="" onClick={() => this.updateOrgActionStatus('Add')} data-target="#home1" data-toggle="tab"
                                                    className="nav-link small text-uppercase active">Add Sub-Orgunit</a></li>
                                                <li className="nav-item"><a href="" onClick={() => this.updateOrgActionStatus('Edit')} data-target="#profile1" data-toggle="tab"
                                                    className="nav-link small text-uppercase ">Edit Orgunit</a></li>
                                                <li className="nav-item"><a href="" onClick={() => this.updateOrgActionStatus('Delete')} data-target="#messages1" data-toggle="tab"
                                                    className="nav-link small text-uppercase">Delete Orgunit</a></li>
                                            </ul>
                                            <br />
                                            <div id="tabsContent" className="tab-content">
                                                <div id="home1" className="tab-pane active show fade">
                                                    <h6 className="text-left">Add a sub-orgunit to selected orgunit</h6>
                                                    <br />
                                                    Orgunit name <input type="text" onChange={(event) => {
                                                        this.setState({
                                                            newOrgUnitName: event.target.value
                                                        });
                                                    }} />

                                                </div>
                                                <div id="profile1" className="tab-pane fade ">
                                                    <h6 className="text-left">Edit orgunit</h6>
                                                    <br />
                                                    Orgunit name <input type="text"
                                                        defaultValue={this.state.currentSelectedOrg ? this.state.currentSelectedOrg.name : ''}
                                                        onChange={event => {
                                                            this.setState({
                                                                newEditOrgUnitName: event.target.value
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div id="messages1" className="tab-pane fade">
                                                    Delete Orgunit
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
                                        this.orgUnitAction();
                                        $('#orgActionModal').modal('toggle');
                                    }}
                                    className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>

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

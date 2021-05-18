import React from 'react';

import '../../../css/TreeView.css';
import AddOrgUnit from '../system/org-unit/AddOrgUnit';

class TreeView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
        this.getXYCoordinates = this.getXYCoordinates.bind(this);
    }

    componentDidMount() {

    }

    // componentDidUpdate(prevProps) {

    // }

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


    render() {

        let selectedAction = <>

        </>;

        <AddOrgUnit />;

        let arrayUIparser = (arr) => {
            const res = [];
            arr.map((item, index) => {
                let { name, children } = arr[index];
                if (children.length > 0) {
                    res.push(
                        <li key={`${index}__${name}`} >
                            <span onClick={() => this.organisationUnitOnclick(event)} onContextMenu={(event) => {
                                event.preventDefault();
                                $('#editOrgModal').modal('toggle');
                            }} className="caret">{name}</span>

                            {children.map((item) => {
                                return <ul key={`${index}__${name}_${item.name}`} className={`${item.level > 2 ? "nested" : ""}`}>
                                    <li>
                                        <span onClick={() => this.organisationUnitOnclick(event)} onContextMenu={(event) => {
                                            event.preventDefault();
                                            $('#editOrgModal').modal('toggle');
                                        }} className="caret">{item.name}</span>

                                        {arrayUIparser(item.children)}
                                    </li>
                                </ul>

                            })}
                        </li>);
                } else {
                    res.push(<li key={index} >
                        <span onClick={() => this.organisationUnitOnclick(event)} onContextMenu={(event) => {
                            event.preventDefault();
                            $('#editOrgModal').modal('toggle');
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
            treeStruc = arrayUIparser(this.props.orgUnits);
        } else {
            treeStruc = arrayUIparser(treeStruc);
        }
        let index = 0;

        return (

            <React.Fragment>

                {treeStruc}

                <div className="modal fade" id="editOrgModal" tabIndex="-1" role="dialog" aria-labelledby="editOrgModalTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Org Unit Action</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                {/* Orgunit menu */}
                                <section className="container">
                                    <div className="row">
                                        <div className="col-sm-12">

                                            <ul id="tabs" className="nav nav-tabs">
                                                <li className="nav-item"><a href="" data-target="#home1" data-toggle="tab"
                                                    className="nav-link small text-uppercase">Home</a></li>
                                                <li className="nav-item"><a href="" data-target="#profile1" data-toggle="tab"
                                                    className="nav-link small text-uppercase active">Profile</a></li>
                                                <li className="nav-item"><a href="" data-target="#messages1" data-toggle="tab"
                                                    className="nav-link small text-uppercase">Messages</a></li>
                                            </ul>
                                            <br />
                                            <div id="tabsContent" className="tab-content">
                                                <div id="home1" className="tab-pane fade">
                                                    home
                                                </div>
                                                <div id="profile1" className="tab-pane fade active show">
                                                    profile
                                                </div>
                                                <div id="messages1" className="tab-pane fade">
                                                    message
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
                                        updateOrg(orgToEdit, setOrgToEdit);
                                        $('#editOrgModal').modal('toggle');
                                    }}
                                    className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>

            </React.Fragment>

        );
    }
}

export default TreeView;

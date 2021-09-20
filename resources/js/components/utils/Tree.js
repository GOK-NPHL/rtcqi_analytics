import React from 'react';
import '../../../css/TreeView.css';
import { v4 as uuidv4 } from 'uuid';


class Tree extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            allowedPermissions: [],
            currentlySelectedOrgUnit: null
        }
        this.organisationUnitOnclick = this.organisationUnitOnclick.bind(this);
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }


    shouldComponentUpdate(nextProps, nextState) {
        if (
            nextProps.orgUnits != this.props.orgUnits
        ) {
            return true;
        } else {
            return false;
        }
    }

    organisationUnitOnclick(event) {
        // event.stopPropagation();
        if (this.state.currentlySelectedOrgUnit != null) {
            this.state.currentlySelectedOrgUnit.style.color = "black";
        }

        event.target.style.color = "orange";

        console.log(event.target);
        let el = event.target.nextElementSibling;

        while (el) {
            el.classList.toggle("nested");
            el = el.nextElementSibling;
        }
        event.target.classList.toggle("caret-down");
        this.setState({
            currentlySelectedOrgUnit: event.target
        });
    }

    render() {
        console.log("render")
        let arrayUIparser = (arr) => {
            const res = [];
            arr.map((item, index) => {

                let { name, children } = item;//arr[index];
                if (children.length > 0) {
                    res.push(
                        <li key={uuidv4()} >
                            {/* Add parent org unit as a li */}
                            {this.props.addCheckBox ?
                                this.props.assignedOrgUnits.includes(item.id) ?
                                    <input defaultChecked={true} style={{ "marginRight": "2px" }} type="checkbox" onClick={() => this.props.clickHandler(item)} />
                                    :
                                    <input style={{ "marginRight": "2px" }} type="checkbox" onClick={() => this.props.clickHandler(item)} />
                                : ''
                            }<span onClick={() => this.organisationUnitOnclick(event)} onContextMenu={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                this.props.setcurrentSelectedOrg(item);
                                this.props.setNewEditOrgUnitName(item.name);
                                $('#orgActionModal').modal('toggle');
                            }} className="caret orgUnit">{name}</span>
                            {/* Add children org unit for the above added org as a ul*/}
                            {children.map((item) => {
                                return <ul key={uuidv4()} className="nested"//{`${item.level > 2 ? "nested" : ""}`}
                                >
                                    <li>
                                        {this.props.addCheckBox ?
                                            this.props.assignedOrgUnits.includes(item.id) ?
                                                <input defaultChecked={true} style={{ "marginRight": "2px" }} type="checkbox" onClick={() => this.props.clickHandler(item)} />
                                                :
                                                <input style={{ "marginRight": "2px" }} type="checkbox" onClick={() => this.props.clickHandler(item)} />
                                            : ''
                                        }<span onClick={() => this.organisationUnitOnclick(event)}

                                            onContextMenu={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                this.props.setcurrentSelectedOrg(item);
                                                this.props.setNewEditOrgUnitName(item.name);
                                                $('#orgActionModal').modal('toggle');
                                            }}
                                            className={`${item.children.length > 0 ? "caret" : ""}`}>{item.name}</span>

                                        {arrayUIparser(item.children)}
                                    </li>
                                </ul>

                            })}
                        </li>);
                } else {
                    res.push(<li key={uuidv4()} >
                        {this.props.addCheckBox ?
                            this.props.assignedOrgUnits.includes(item.id) ?
                                <input defaultChecked={true} style={{ "marginRight": "2px" }} type="checkbox" onClick={() => this.props.clickHandler(item)} />
                                :
                                <input style={{ "marginRight": "2px" }} type="checkbox" onClick={() => this.props.clickHandler(item)} />
                            : ''
                        }<span onClick={() => this.organisationUnitOnclick(event)}
                            onContextMenu={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                this.props.setcurrentSelectedOrg(item);
                                this.props.setNewEditOrgUnitName(item.name);
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

                treeStruc = localStorage.getItem("treeStruc");
                if (treeStruc == null) {
                    treeStruc = arrayUIparser(this.props.orgUnits);
                    //localStorage.setItem("treeStruc", treeStruc);
                }
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

            </React.Fragment>

        );
    }
}

export default Tree;

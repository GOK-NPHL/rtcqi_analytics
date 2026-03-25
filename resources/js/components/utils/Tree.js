import React, { useState } from 'react';
import '../../../css/TreeView.css';
import { v4 as uuidv4 } from 'uuid';

function Tree(props) {
    const [currentlySelectedOrgUnit, setCurrentlySelectedOrgUnit] = useState(null);

    function organisationUnitOnclick(event, item) {
        if (currentlySelectedOrgUnit != null) {
            currentlySelectedOrgUnit.style.color = "#858796";
        }

        event.target.style.color = "orange";

        try {
            let el = event.target.nextElementSibling;

            while (el) {
                el.classList.toggle("nested");

                try {
                    if (props.addCheckBox) {
                        if (el.children.length > 1) {
                            let elementsToHide = el.children;
                            for (element in elementsToHide) {
                                for (node in element.children) {
                                    node.classList.remove("nested");
                                    node.classList.add("nested");
                                }
                            }
                        } else {
                            el.children[0].children[2].classList.remove("nested");
                            el.children[0].children[2].classList.add("nested");
                        }
                    } else {
                        if (el.children.length > 1) {
                            let elementsToHide = el.children;
                            for (element in elementsToHide) {
                                for (node in element.children) {
                                    node.classList.remove("nested");
                                    node.classList.add("nested");
                                }
                            }
                        } else {
                            el.children[0].children[1].classList.remove("nested");
                            el.children[0].children[1].classList.add("nested");
                        }
                    }
                } catch (err) {
                }

                el = el.nextElementSibling;
            }
            event.target.classList.toggle("caret-down");
        } catch (err) {
        }

        setCurrentlySelectedOrgUnit(event.target);
        props.setcurrentSelectedOrg(item);
    }

    let arrayUIparser = (arr) => {
        const res = [];
        arr.map((item, index) => {
            let { name, children } = item;
            if (children.length > 0) {
                res.push(
                    <li key={uuidv4()} >
                        {props.addCheckBox ?
                            props.assignedOrgUnits.includes(item.id) ?
                                <input defaultChecked={true} style={{ "marginRight": "2px" }} type="checkbox" onClick={() => props.clickHandler(item)} />
                                :
                                <input style={{ "marginRight": "2px" }} type="checkbox" onClick={() => props.clickHandler(item)} />
                            : ''
                        }<span onClick={(event) => organisationUnitOnclick(event, item)} onContextMenu={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            props.setcurrentSelectedOrg(item);
                            props.setNewEditOrgUnitName(item.name);
                            $('#orgActionModal').modal('toggle');
                        }} className="caret orgUnit">{name}</span>
                        {children.map((item) => {
                            let returnElement = <ul key={uuidv4()} className="nested">
                                <li>
                                    {props.addCheckBox ?
                                        props.assignedOrgUnits.includes(item.id) ?
                                            <input defaultChecked={true} style={{ "marginRight": "2px" }} type="checkbox" onClick={() => props.clickHandler(item)} />
                                            :
                                            <input style={{ "marginRight": "2px" }} type="checkbox" onClick={() => props.clickHandler(item)} />
                                        : ''
                                    }<span onClick={(event) => organisationUnitOnclick(event, item)}
                                        onContextMenu={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            props.setcurrentSelectedOrg(item);
                                            props.setNewEditOrgUnitName(item.name);
                                            $('#orgActionModal').modal('toggle');
                                        }}
                                        className={`${item.children.length > 0 ? "caret" : ""}`}>{item.name}</span>
                                    {arrayUIparser(item.children)}
                                </li>
                            </ul>;
                            return returnElement;
                        })}
                    </li>);
            } else {
                res.push(<li key={uuidv4()} >
                    {props.addCheckBox ?
                        props.assignedOrgUnits.includes(item.id) ?
                            <input defaultChecked={true} style={{ "marginRight": "2px" }} type="checkbox" onClick={() => props.clickHandler(item)} />
                            :
                            <input style={{ "marginRight": "2px" }} type="checkbox" onClick={() => props.clickHandler(item)} />
                        : ''
                    }<span onClick={(event) => organisationUnitOnclick(event, item)}
                        onContextMenu={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            props.setcurrentSelectedOrg(item);
                            props.setNewEditOrgUnitName(item.name);
                            $('#orgActionModal').modal('toggle');
                        }}>{item.name}</span>
                </li>);
            }
        });

        return <ul>{res}</ul>;
    };

    let treeStruc = [
        {
            id: 0,
            name: "No Orgunits Defined",
            level: 0,
            children: []
        }
    ];
    if (props.orgUnits) {
        if (props.orgUnits.length != 0) {
            treeStruc = localStorage.getItem("treeStruc");
            if (treeStruc == null) {
                treeStruc = arrayUIparser(props.orgUnits);
            }
        } else {
            treeStruc = arrayUIparser(treeStruc);
        }
    } else {
        treeStruc = arrayUIparser(treeStruc);
    }

    return (
        <React.Fragment>
            {treeStruc}
        </React.Fragment>
    );
}

export default Tree;

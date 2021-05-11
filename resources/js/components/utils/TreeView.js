import React from 'react';

import '../../../css/TreeView.css';

class TreeView extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            // orgUnits: [
            //     {
            //         id: 0,
            //         name: "Kenya",
            //         level: 1,
            //         children: [
            //             {
            //                 id: 1,
            //                 name: "Nairobi",
            //                 level: 2,
            //                 children: [
            //                     {
            //                         id: 5,
            //                         name: "sub Nai 1",
            //                         level: 3,
            //                         children: [

            //                         ]
            //                     }, {
            //                         id: 6,
            //                         name: "sub Nai 2",
            //                         level: 3,
            //                         children: [

            //                         ]
            //                     }
            //                 ]
            //             },
            //             {
            //                 id: 2,
            //                 name: "Kisumu",
            //                 level: 2,
            //                 children: [
            //                     {
            //                         id: 7,
            //                         name: "sub kisumu 1",
            //                         level: 3,
            //                         children: [

            //                         ]
            //                     }, {
            //                         id: 8,
            //                         name: "sub kisumu 2",
            //                         level: 3,
            //                         children: [

            //                         ]
            //                     }
            //                 ]
            //             }, {
            //                 id: 3,
            //                 name: "Nakuru",
            //                 level: 2,
            //                 children: [
            //                     {
            //                         id: 9,
            //                         name: "sub Naks 1",
            //                         level: 3,
            //                         children: [

            //                         ]
            //                     }, {
            //                         id: 10,
            //                         name: "sub Naks 2",
            //                         level: 3,
            //                         children: [

            //                         ]
            //                     }
            //                 ]
            //             }, {
            //                 id: 4,
            //                 name: "Kakamega",
            //                 level: 2,
            //                 children: [
            //                     {
            //                         id: 11,
            //                         name: "sub kaka 1",
            //                         level: 3,
            //                         children: [

            //                         ]
            //                     }, {
            //                         id: 12,
            //                         name: "sub kaka 2",
            //                         level: 3,
            //                         children: [
            //                             {
            //                                 id: 12,
            //                                 name: "sub kaka 21",
            //                                 level: 3,
            //                                 children: [
            //                                     {
            //                                         id: 12,
            //                                         name: "sub kaka 22-a",
            //                                         level: 3,
            //                                         children: [

            //                                         ]
            //                                     },
            //                                     {
            //                                         id: 12,
            //                                         name: "sub kaka 22-b",
            //                                         level: 3,
            //                                         children: [

            //                                         ]
            //                                     }
            //                                 ]
            //                             }
            //                         ]
            //                     }
            //                 ]
            //             }
            //         ]
            //     }
            // ]
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {

    }

    organisationUnitOnclick(event) {
        let el = event.target.nextElementSibling;
        while (el) {
            console.log(el);
            el.classList.toggle("nested");
            el = el.nextElementSibling;
        }
        event.target.classList.toggle("caret-down");
    }

    render() {

        let arrayUIparser = (arr) => {
            const res = [];
            arr.map((item, index) => {
                let { name, children } = arr[index];
                if (children.length > 0) {
                    res.push(
                        <li key={`${index}__${name}`} ><span onClick={() => this.organisationUnitOnclick(event)} className="caret">{name}</span>
                            {children.map((item) => {
                                return <ul key={`${index}__${name}_${item.name}`} className={`${item.level > 2 ? "nested" : ""}`}>
                                    <li>
                                        <span onClick={() => this.organisationUnitOnclick(event)} className="caret">{item.name}</span>
                                        {arrayUIparser(item.children)}
                                    </li>
                                </ul>

                            })}
                        </li>);
                } else {
                    res.push(<li key={index} ><span onClick={() => this.organisationUnitOnclick(event)} >{item.name}</span></li>);
                }
            });

            return <ul >{res}</ul>;
        }
        let treeStruc = [
            {
                id: 0,
                name: "No Orgunit Defined",
                level: 0,
                children: []
            }
        ];
        if (this.props.orgUnits) {
            treeStruc = arrayUIparser(this.props.orgUnits);
        }else{
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

export default TreeView;

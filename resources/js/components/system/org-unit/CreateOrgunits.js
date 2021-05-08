import React from 'react';
import ReactDOM from 'react-dom';
import { FetchAuthorities, SaveRole, UpdateRole } from '../../utils/Helpers';
import DualListBox from 'react-dual-listbox';


class OrgunitCreate extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            selected: [],
        };
    }

    componentDidMount() {

    }


    render() {

        return (
            <React.Fragment>
                create orgs
            </React.Fragment>
        );
    }

}

export default OrgunitCreate;

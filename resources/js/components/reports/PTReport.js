import React from 'react';
import ReactDOM from 'react-dom';
import LineGraph from '../charts/LineGraph';
import StackedHorizontal from '../charts/StackedHorizontal'
import OrguntiDrillDown from '../utils/OrguntiDrillDown'

class PTReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <React.Fragment>

                {/* Page Heading */}
                <OrguntiDrillDown/>
                


            </React.Fragment>
        );
    }

}

export default PTReport;

if (document.getElementById('PTReport')) {
    ReactDOM.render(<PTReport />, document.getElementById('PTReport'));
}
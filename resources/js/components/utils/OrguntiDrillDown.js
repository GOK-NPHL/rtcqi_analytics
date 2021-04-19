import React from 'react';


class OrguntiDrillDown extends React.Component {


    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {

    }


    render() {
        return (

            <div className="row">
                <div className="col-md-4 col-sm-4 col-xl-4 col-xs-4">
                    <form>
                        <div className="form-group">
                            {/* <label for="exampleFormControlSelect1">Example select</label> */}
                            <select className="form-control" id="exampleFormControlSelect1">
                                <option disabled selected>Select county</option>
                                <option>National</option>
                                <option>Kakamega</option>
                                <option>Nairobi</option>
                                <option>Kisumu</option>
                                <option>Eldoret</option>
                            </select>
                        </div>
                    </form>
                </div>

                <div className="col-md-4 col-sm-4 col-xl-4 col-xs-4">
                    <form>
                        <div className="form-group">
                            {/* <label for="exampleFormControlSelect1">Example select</label> */}
                            <select className="form-control" id="exampleFormControlSelect1">
                                <option disabled selected>Select subcounty</option>
                                <option>Butere</option>
                                <option>Ikolomani</option>
                                <option>kamukunji</option>
                                <option>Kasarani</option>
                                <option>Kisumu central</option>
                            </select>
                        </div>
                    </form>
                </div>


                <div className="col-md-4 col-sm-4 col-xl-4 col-xs-4">
                    <form>
                        <div className="form-group">
                            {/* <label for="exampleFormControlSelect1">Example select</label> */}
                            <select className="form-control" id="exampleFormControlSelect1">
                                <option disabled selected>Select site</option>
                                <option>National</option>
                                <option>site 1</option>
                                <option>site 2</option>
                                <option>site 3</option>
                                <option>site 4</option>
                                <option>site 5</option>
                            </select>
                        </div>
                    </form>
                </div>

            </div>

        );
    }
}

export default OrguntiDrillDown;

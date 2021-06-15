import React from 'react';
import ReactDOM from 'react-dom';
import { updateUser, FetchUserProfile } from '../../utils/Helpers';


class Profile extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            profile: {},
            message: '',
            name: '',
            lastName: '',
            email: '',
            password: '',
            orgunits: []
        };

        this.updateProfile = this.updateProfile.bind(this);
        this.firstNameOnChange = this.firstNameOnChange.bind(this);
        this.lastNameOnChange = this.lastNameOnChange.bind(this);
        this.emailOnChange = this.emailOnChange.bind(this);
        this.passwordOnChange = this.passwordOnChange.bind(this);

    }

    componentDidMount() {
        (async () => {
            let profile = await FetchUserProfile();
            this.setState({
                profile: profile,
                name: profile.first_name,
                lastName: profile.last_name,
                email: profile.email,
                orgunits: profile.orgunits
            });
            console.log(profile);
        })();
    }

    updateProfile() {

        (async () => {

            let response = await updateUser(
                this.state.first_name,
                this.state.last_name,
                this.state.email,
                this.state.password,
                this.state.selectedOrgs,
                this.state.role
            );
            if (response) {
                this.setState({
                    message: response.data.Message
                });
                $('#saveUserModal').modal('toggle');
            }

        })();
    }

    firstNameOnChange(event) {
        this.setState({ name: event.target.value });
    };
    lastNameOnChange(event) {
        this.setState({ lastName: event.target.value });
    };
    emailOnChange(event) {
        this.setState({ email: event.target.value });
    };
    passwordOnChange(event) {
        this.setState({ password: event.target.value });
    };

    // shouldComponentUpdate(nextProps, nextState) {
    //     if (
    //         this.state.name != nextState.name ||
    //         this.state.lastName != nextState.lastName ||
    //         this.state.email != nextState.email ||
    //         this.state.password != nextState.password
    //     ) {
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }

    render() {

        return (
            <React.Fragment>
                <div className="container rounded bg-white mt-5 mb-5">
                    <div className="row">
                        <div className="col-md-3 border-right">
                            <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                                {/* <img class="img-profile rounded-circle" src="{{ asset('images/undraw_profile.svg') }}" /> */}
                                <span><i style={{ "color": "#00c9e8" }} className="fas fa-user-circle fa-7x"></i></span>
                                <span className="font-weight-bold">{this.state.name}</span>
                                <span className="text-black-50">{this.state.email}</span>
                                <span> </span>
                            </div>
                        </div>
                        <div className="col-md-5 border-right">
                            <div className="p-3 py-5">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="text-right">My Profile</h4>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-md-6"><label className="labels">Name <span style={{ "color": "red" }}>*</span></label>
                                        <input type="text" className="form-control"
                                            onChange={() => this.firstNameOnChange(event)}
                                            value={this.state.name ? this.state.name : ''} /></div>
                                    <div className="col-md-6"><label className="labels">Last Name</label>
                                        <input type="text"
                                            onChange={() => this.lastNameOnChange(event)}
                                            className="form-control"
                                            value={this.state.lastName ? this.state.lastName : ''} />
                                    </div>
                                </div>
                                <div className="row mt-3">

                                    <div className="col-md-12"><label className="labels">Email <span style={{ "color": "red" }}>*</span></label>
                                        <input type="email" className="form-control" onChange={() => this.emailOnChange(event)} value={this.state.email} />
                                    </div>

                                    <div className="col-md-12" style={{ "marginTop": "5px" }}><label className="labels">Password</label>
                                        <input type="password" className="form-control" onChange={() => this.passwordOnChange(event)} placeholder="********" />
                                    </div>

                                </div>

                                <div className="mt-5 text-center"><button className="btn btn-primary profile-button" type="button">Update Profile</button></div>
                            </div>
                        </div>

                        <div className="col-md-4 p-3 py-5">
                            <div className="row">
                                <div className="col-sm-6">
                                    <span><i className="far fa-star"></i> <i className="far fa-star"></i> Role</span>
                                </div>
                                <div className="col-sm-6">
                                    Role Name
                                </div>
                            </div>
                            <hr />
                            <div className="row">
                                <div className="col-sm-12">
                                    <h4 style={{ "marginBottom": "25px" }}>Organisation units</h4>
                                </div>

                                <div className="col-sm-6">
                                    <span><i className="far fa-star"></i> <i className="far fa-star"></i> Role</span>
                                </div>
                                <div className="col-sm-6">
                                    Role Name
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </React.Fragment>
        );
    }

}

export default Profile;


if (document.getElementById('profile-page')) {
    ReactDOM.render(<Profile />, document.getElementById('profile-page'));
}
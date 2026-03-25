import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { updateUserProfile, FetchUserProfile } from '../../utils/Helpers';
import { v4 as uuidv4 } from 'uuid';

function Profile({ toggleDisplay }) {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleName, setRoleName] = useState('');
    const [orgunits, setOrgunits] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        (async () => {
            const profile = await FetchUserProfile();
            setName(profile.first_name);
            setLastName(profile.last_name);
            setEmail(profile.email);
            setOrgunits(profile.orgunits);
            setRoleName(profile.role_name);
        })();
    }, []);

    const toggleShowPassword = () => {
        if (password.length === 0) setShowPassword(false);
        else setShowPassword(prev => !prev);
    };

    const updateProfile = async () => {
        if (!name || !email || name.length === 0 || email.length === 0) {
            setMessage('Please fill in required fields');
            $('#updateUserModal').modal('toggle');
            return;
        }
        const response = await updateUserProfile(name, lastName, email, password);
        if (response) {
            setMessage(response.data.Message);
            $('#updateUserModal').modal('toggle');
        }
    };

    const orgunitsDisplay = orgunits.map(orgUnit => (
        <span style={{ color: '#085c1f' }} key={uuidv4()}>
            <i className="far fa-star"></i> {orgUnit['odk_unit_name']}
        </span>
    ));

    return (
        <React.Fragment>
            <div className="container rounded bg-white mt-5 mb-5">
                <div className="row">
                    <div className="col-md-3 border-right">
                        <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                            <span><i style={{ color: '#00c9e8' }} className="fas fa-user-circle fa-7x"></i></span>
                            <span className="font-weight-bold">{name}</span>
                            <span className="text-black-50">{email}</span>
                        </div>
                    </div>
                    <div className="col-md-5 border-right">
                        <div className="p-3 py-5">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="text-right">My Profile</h4>
                            </div>
                            <div className="row mt-2">
                                <div className="col-md-6">
                                    <label className="labels">Name <span style={{ color: 'red' }}>*</span></label>
                                    <input required type="text" className="form-control" onChange={e => setName(e.target.value)} value={name ?? ''} />
                                </div>
                                <div className="col-md-6">
                                    <label className="labels">Last Name</label>
                                    <input type="text" className="form-control" onChange={e => setLastName(e.target.value)} value={lastName ?? ''} />
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-md-12">
                                    <label className="labels">Email <span style={{ color: 'red' }}>*</span></label>
                                    <input required type="email" className="form-control" onChange={e => setEmail(e.target.value)} value={email} />
                                </div>
                                <div className="col-md-12" style={{ marginTop: '5px' }}>
                                    <label className="labels">Password</label>
                                    <input type={showPassword ? 'text' : 'password'} className="form-control" onChange={e => setPassword(e.target.value)} placeholder="********" />
                                    <input onClick={toggleShowPassword} type="checkbox" /> Show password
                                </div>
                            </div>
                            <div className="mt-5 text-center">
                                <button onClick={updateProfile} className="btn btn-primary profile-button" type="button">Update Profile</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 p-3 py-5">
                        <div className="row">
                            <div className="col-sm-6">
                                <span style={{ color: '#085c1f' }}><i className="far fa-star"></i> <i className="far fa-star"></i> Role</span>
                            </div>
                            <div className="col-sm-6">{roleName}</div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-12"><h4 style={{ marginBottom: '25px' }}>Organisation units</h4></div>
                            <div className="col-sm-6">{orgunitsDisplay}</div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="updateUserModal" tabIndex="-1" role="dialog" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Notice!</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            </div>
                            <div className="modal-body"><p>{message}</p></div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => toggleDisplay && toggleDisplay()} className="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Profile;

const el = document.getElementById('profile-page');
if (el) ReactDOM.createRoot(el).render(<Profile />);

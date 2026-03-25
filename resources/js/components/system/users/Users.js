import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Register from './Register';
import Pagination from 'react-js-pagination';
import { FetchUsers, DeleteUser, FetchUserAuthorities } from '../../utils/Helpers';

function User() {
    const [showUserTable, setShowUserTable] = useState(true);
    const [users, setUsers] = useState([]);
    const [allTableElements, setAllTableElements] = useState([]);
    const [currUsersTableEl, setCurrUsersTableEl] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [allowedPermissions, setAllowedPermissions] = useState([]);
    const [userActionState, setUserActionState] = useState('userList');
    const [startTableData, setStartTableData] = useState(0);
    const [endeTableData, setEndeTableData] = useState(10);
    const [activePage, setActivePage] = useState(1);
    const [responseMessage, setResponseMessage] = useState('');

    const getUsers = async () => {
        const data = await FetchUsers();
        setUsers(data);
        setAllTableElements([]);
    };

    useEffect(() => {
        (async () => {
            const [data, perms] = await Promise.all([FetchUsers(), FetchUserAuthorities()]);
            setUsers(data);
            setAllowedPermissions(perms);
        })();
    }, []);

    const toggleDisplay = async () => {
        if (!showUserTable) {
            await getUsers();
            setShowUserTable(true);
            setUserActionState('userList');
        } else {
            setShowUserTable(false);
        }
    };

    const deleteUser = async () => {
        const response = await DeleteUser(selectedUser);
        setResponseMessage(response.data.Message);
        $('#deleteUserModal').modal('toggle');
        getUsers();
    };

    const handlePageChange = (pageNumber) => {
        const pgNumber = pageNumber * 10 + 1;
        setStartTableData(pgNumber - 11);
        setEndeTableData(pgNumber - 1);
        setActivePage(pageNumber);
    };

    const canEdit = allowedPermissions.includes('edit_user');
    const canDelete = allowedPermissions.includes('delete_user');
    const canAdd = allowedPermissions.includes('add_user');

    let tableElements = [];
    if (users.length > 0) {
        tableElements = users.map((user, index) => (
            <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.role_name}</td>
                <td>{user.org_units?.length > 0 ? [...new Set(user.org_units.map(ou => ou.name))].join(', ') : ''}</td>
                {(canEdit || canDelete) && (
                    <td>
                        {canEdit && (
                            <a onClick={() => { toggleDisplay(); setUserActionState('edit'); setSelectedUser(user); }} style={{ marginRight: '5px' }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                <i className="fas fa-user-edit"></i>
                            </a>
                        )}
                        {canDelete && (
                            <a onClick={() => { setSelectedUser(user); $('#deleteConfirmModal').modal('toggle'); }} className="d-none d-sm-inline-block btn btn-sm btn-danger shadow-sm">
                                <i className="fas fa-user-times"></i>
                            </a>
                        )}
                    </td>
                )}
            </tr>
        ));
    }

    // Sync allTableElements once on first load
    useEffect(() => {
        if (tableElements.length > 0 && allTableElements.length === 0) {
            setAllTableElements(tableElements);
            setCurrUsersTableEl(tableElements);
        }
    }, [users]);

    let pageContent = null;
    if (showUserTable && allowedPermissions.includes('view_user')) {
        pageContent = (
            <div id="user_table" className="row">
                <div className="col-sm-12 col-md-12">
                    <div className="form-group mb-2">
                        <input
                            type="text"
                            onChange={(e) => {
                                const val = e.target.value.trim().toLowerCase();
                                const filtered = allTableElements.filter(row =>
                                    (row?.props?.children?.[1]?.props?.children?.[0] ?? '').toLowerCase().includes(val) ||
                                    (row?.props?.children?.[2]?.props?.children ?? '').toLowerCase().includes(val)
                                );
                                setCurrUsersTableEl(filtered);
                                setActivePage(1); setStartTableData(0); setEndeTableData(10);
                            }}
                            className="form-control" placeholder="search user"
                        />
                    </div>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Role</th>
                                <th scope="col">Organisation Units</th>
                                {(canEdit || canDelete) && <th scope="col">Action</th>}
                            </tr>
                        </thead>
                        <tbody>{currUsersTableEl.slice(startTableData, endeTableData)}</tbody>
                    </table>
                    <br />
                    <Pagination itemClass="page-item" linkClass="page-link" activePage={activePage} itemsCountPerPage={10} totalItemsCount={currUsersTableEl.length} pageRangeDisplayed={5} onChange={handlePageChange} />
                </div>
            </div>
        );
    } else if (!showUserTable && canAdd) {
        pageContent = <Register selectedUser={selectedUser} allowedPermissions={allowedPermissions} userActionState={userActionState} toggleDisplay={toggleDisplay} />;
    }

    let createUsers = null;
    if (canAdd && userActionState === 'userList') {
        createUsers = (
            <a href="#" onClick={() => { toggleDisplay(); setUserActionState('create'); }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-user fa-sm text-white-50"></i> Create Users
            </a>
        );
    } else if (userActionState !== 'userList') {
        createUsers = (
            <a href="#" onClick={() => { toggleDisplay(); setUserActionState('userList'); }} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-arrow-left"></i> Back
            </a>
        );
    }

    return (
        <React.Fragment>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h4 mb-0 text-gray-500">Users Management</h1>
                {createUsers}
            </div>
            {pageContent}

            <div className="modal fade" id="deleteConfirmModal" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Notice!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">Delete {selectedUser?.first_name}?</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" onClick={() => { deleteUser(); $('#deleteConfirmModal').modal('toggle'); }} className="btn btn-primary">Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="deleteUserModal" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Notice!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">{responseMessage}</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default User;

const el = document.getElementById('users');
if (el) ReactDOM.createRoot(el).render(<User />);

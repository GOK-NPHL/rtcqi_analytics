import React from 'react';

function SheetSelect({ workbook, setSheetWithOrgs }) {
    const sheets = workbook.length !== 0
        ? workbook.SheetNames.map((value, index) => (
            <tr key={index}>
                <td scope="row">{index + 1}</td>
                <td>{value}</td>
                <td>
                    <div className="custom-control custom-radio">
                        <input
                            onClick={(e) => setSheetWithOrgs(e)}
                            type="radio"
                            id={`sheet_${value}`}
                            value={value}
                            name="sheetsRadio"
                            className="custom-control-input"
                        />
                        <label className="custom-control-label" htmlFor={`sheet_${value}`}></label>
                    </div>
                </td>
            </tr>
        ))
        : [];

    return (
        <React.Fragment>
            <br />
            <hr />
            <div className="row">
                <div className="col-sm-4">
                    <p style={{ fontWeight: '700' }}>Select sheet with org units</p>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Sheet name</th>
                                <th scope="col">Contains orgunits</th>
                            </tr>
                        </thead>
                        <tbody>{sheets}</tbody>
                    </table>
                </div>
            </div>
        </React.Fragment>
    );
}

export default SheetSelect;

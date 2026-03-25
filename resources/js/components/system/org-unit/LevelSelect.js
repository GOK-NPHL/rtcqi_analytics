import React, { useState } from 'react';
import XLSX from 'xlsx';

function LevelSelect({ sheetWithOrgs, workbook, setOrgunitExcelFileHierachy }) {
    const [columnHierarchy, setColumnHierarchy] = useState({});
    const [minLevel, setMinLevel] = useState(2);
    const [maxLevel, setMaxLevel] = useState(2);

    const columnHierarchyOrderHandler = (event) => {
        const col = event.target.dataset.column;
        const hierValue = event.target.value;
        const updated = { ...columnHierarchy, [col]: hierValue };
        setColumnHierarchy(updated);
        setMinLevel(prev => prev + 1);
        setMaxLevel(prev => prev + 1);
        setOrgunitExcelFileHierachy(updated);
    };

    window.$('.inputLevel').keypress((evt) => evt.preventDefault());

    let sheetHeaders = {};
    let sheetDataPreview = [];

    if (sheetWithOrgs) {
        const sheet = workbook.Sheets[sheetWithOrgs];
        const range = XLSX.utils.decode_range(sheet['!ref']);
        let previewMaxRowsCounter = 0;

        for (let R = range.s.r; R <= range.e.r; ++R) {
            if (previewMaxRowsCounter <= 12 && R > 2) sheetDataPreview.push([]);
            const previewArrLength = sheetDataPreview.length;

            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellref = XLSX.utils.encode_cell({ c: C, r: R });
                if (!sheet[cellref]) continue;
                const cell = sheet[cellref];
                if (R === 1) sheetHeaders[C] = cell.v;
                if (previewMaxRowsCounter <= 12 && R > 2) sheetDataPreview[previewArrLength - 1].push(cell.v);
                if (previewMaxRowsCounter === 12) break;
            }
            previewMaxRowsCounter++;
        }
    }

    let count = 1;
    const colHeaders = [];
    const tablePreviewElHeaders = [];

    for (const [key, value] of Object.entries(sheetHeaders)) {
        colHeaders.push(
            <tr key={key}>
                <th scope="row">{count}</th>
                <td>{value}</td>
                <td>
                    <input
                        data-column={key}
                        onInput={columnHierarchyOrderHandler}
                        type="number"
                        size="3"
                        min={minLevel}
                        max={maxLevel}
                        className="inputLevel"
                    />
                </td>
            </tr>
        );
        tablePreviewElHeaders.push(
            key == 0
                ? <th key={key} scope="col">#</th>
                : <th key={key} scope="col">{value}</th>
        );
        count++;
    }

    const tablePreviewEl = sheetDataPreview.map((row, x) => (
        <tr key={x}>
            {row.map((cell, y) =>
                y === 0
                    ? <th key={y} scope="row">{x + 1}</th>
                    : <td key={y}>{cell}</td>
            )}
        </tr>
    ));

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-sm-3">
                    <p>Set orgunit hierarchy</p>
                    <table className="table table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Column Name</th>
                                <th scope="col">Level</th>
                            </tr>
                        </thead>
                        <tbody>{colHeaders}</tbody>
                    </table>
                </div>
                <div className="col-sm-9">
                    <p>Data Preview</p>
                    <table className="table table-bordered">
                        <thead className="thead-dark">
                            <tr>{tablePreviewElHeaders}</tr>
                        </thead>
                        <tbody>{tablePreviewEl}</tbody>
                    </table>
                </div>
            </div>
        </React.Fragment>
    );
}

export default LevelSelect;

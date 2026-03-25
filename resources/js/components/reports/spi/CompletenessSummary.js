import React from 'react'
import ReactJson from 'react-json-view';
import { exportToExcel } from '../../utils/Helpers';

function CompletenessSummary({ data }) {
    const [completenessData, setCompletenessData] = React.useState([]);
    const [sites, setSites] = React.useState([]);

    React.useEffect(() => {
        let mtd = true;
        if (mtd) {
            if (data && data.length > 0) {
                setCompletenessData(data);
            }
        }
        return () => {
            mtd = false;
        }
    }, [data]);
    return (
        <>
            <React.Fragment>
                <button type="button" className="hidden" data-toggle="modal" data-target="#sitesList" id="siteListTrigger">&nbsp;</button>
                <div className="modal fade" id="sitesList" tabIndex="-1" role="dialog" aria-labelledby="sitesListTitle" aria-hidden="true" >
                    <div className="modal-dialog modal-lg modal-scrollable" role="document" data-bs-backdrop="static" data-bs-keyboard="false">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }} id="sitesListTitle">
                                    <h5>Sites</h5>
                                    <button type="button" className="btn btn-success btn-sm mx-1" onClick={() => {
                                        if (sites.length > 0) {
                                            exportToExcel(
                                                Array.from(sites, j => {
                                                    return {
                                                        facility: (j?.facility ? j?.facility : ''),
                                                        mfl: (j?.mfl ? j?.mfl : ''),
                                                        site: (j?.site ? j?.site.split('_').join(' ') : ''),
                                                    }
                                                }),
                                                'Sites'
                                            );
                                        } else {
                                            console.error('No data to export');
                                            alert('No data to export')
                                        }
                                    }}>
                                        <i className='fa fa-download'></i>&nbsp;
                                        Excel/CSV
                                    </button>
                                </div>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={ev => {
                                    setSites([])
                                }}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                    {/* <ReactJson src={sites} displayDataTypes={false} indentWidth={4} /> */}
                                    <table className="table table-striped table-bordered table-hover table-condensed">
                                        <thead>
                                            <tr>
                                                <th>Facility</th>
                                                <th>MFL Code</th>
                                                <th>Site</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sites && sites.length > 0 && sites.map((j, k) => {
                                                return (
                                                    <tr key={k}>
                                                        <td className='text-capitalize'>{j?.facility ? j?.facility : ''}</td>
                                                        <td>{j?.mfl ? j?.mfl : ''}</td>
                                                        <td className='text-capitalize'>{j?.site ? j?.site.split('_').join(' ') : ''}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={ev => {
                                    setSites([])
                                }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div >
            </React.Fragment>

            <div className='card mb-4'>
                <div className='card-header'>
                    <h3 className='card-title'>Completeness Summary</h3>
                </div>
                <div className='card-body'>
                    <table className='table table-bordered' style={{ tableLayout: 'fixed' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ color: '#333' }} className='text-black text-uppercase text-center'>Followup</th>
                                <th style={{ color: '#333' }} className='text-black text-uppercase text-center'># Sites</th>
                                <th style={{ color: '#333' }} className='text-black text-uppercase text-center'># Sites Found in lower levels <br /> (Completeness rate)</th>
                                <th style={{ color: '#333' }} className='text-black text-uppercase text-center'># Sites <b>Not</b> found in lower levels</th>
                                <th style={{ color: '#333' }} className='text-black text-uppercase text-center'># Sites <b>Not</b> received followup assessment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completenessData.map((d, i) => {
                                let baseline_sites = completenessData[completenessData.length-1]?.sites.length || 0;
                                return (
                                    <tr key={i}>
                                        <td className='text-capitalize text-center' style={{ fontWeight: '600' }}>{d.followup}</td>
                                        <td className='text-justify'>
                                            <span style={{ cursor: 'pointer' }} onClick={ev => {
                                                setSites(d?.sites);
                                                if (typeof window !== "undefined") {
                                                    document.getElementById("siteListTrigger").click()
                                                }
                                            }}>
                                                {Intl.NumberFormat().format(d?.sites.length || 0)}
                                            </span>
                                        </td>
                                        <td className='text-justify'>
                                            <span style={{ cursor: 'pointer' }} onClick={ev => {
                                                setSites(d?.fl_sites_found_in_lower_levels);
                                                if (typeof window !== "undefined") {
                                                    document.getElementById("siteListTrigger").click()
                                                }
                                            }}>
                                                {Intl.NumberFormat().format(d?.fl_sites_found_in_lower_levels.length)} {
                                                    d?.fl_sites_found_in_lower_levels.length > 0 &&
                                                    " (" + parseInt(d?.fl_sites_found_in_lower_levels.length / d?.sites.length * 100) + '%)'
                                                }
                                            </span>
                                        </td>
                                        <td className='text-justify'>
                                            <span style={{ cursor: 'pointer' }} onClick={ev => {
                                                setSites(d?.fl_sites_not_found_in_lower_levels);
                                                if (typeof window !== "undefined") {
                                                    document.getElementById("siteListTrigger").click()
                                                }
                                            }}>
                                                {Intl.NumberFormat().format(d?.fl_sites_not_found_in_lower_levels.length)} {
                                                    d?.fl_sites_not_found_in_lower_levels.length > 0 &&
                                                    " (" + parseInt(d?.fl_sites_not_found_in_lower_levels.length / d?.sites.length * 100) + '%)'
                                                }
                                            </span>
                                        </td>
                                        <td>
                                            {Intl.NumberFormat().format( baseline_sites - d?.fl_sites_found_in_lower_levels.length )} {" (" + parseInt((baseline_sites - d?.fl_sites_found_in_lower_levels.length) / baseline_sites * 100) + '%)'}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default CompletenessSummary

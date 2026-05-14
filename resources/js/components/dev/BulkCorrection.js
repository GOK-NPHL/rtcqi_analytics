import React from 'react';
import ReactDOM from 'react-dom';

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function statsBadges({ matched, mismatches, soft_deletes, total }) {
    return (
        <>
            <span className="badge badge-secondary mr-1" title="Total records">{total}</span>
            {matched > 0   && <span className="badge badge-success mr-1">{matched} ok</span>}
            {mismatches > 0 && <span className="badge badge-warning mr-1">{mismatches} mismatch</span>}
            {soft_deletes > 0 && <span className="badge badge-danger mr-1">{soft_deletes} near-dup</span>}
        </>
    );
}

function StageBadge({ stage }) {
    if (!stage) return <span className="badge badge-secondary">—</span>;
    if (stage === 'baseline') return <span className="badge badge-primary">{stage}</span>;
    if (stage === 'other')    return <span className="badge badge-dark">{stage}</span>;
    return <span className="badge badge-info">{stage}</span>;
}

// Collect fixes/deletes from a county node
function collectCountyActions(county) {
    const fixes = [], deletes = [];
    for (const sub of county.subcounties) {
        for (const fac of sub.facilities) {
            for (const r of fac.mismatch_records)    fixes.push({ uuid: r.uuid, target_stage: r.effective_stage });
            for (const r of fac.soft_delete_records) deletes.push(r.uuid);
        }
    }
    return { fixes, deletes };
}

function collectSubcountyActions(sub) {
    const fixes = [], deletes = [];
    for (const fac of sub.facilities) {
        for (const r of fac.mismatch_records)    fixes.push({ uuid: r.uuid, target_stage: r.effective_stage });
        for (const r of fac.soft_delete_records) deletes.push(r.uuid);
    }
    return { fixes, deletes };
}

function collectFacilityActions(fac) {
    return {
        fixes:   fac.mismatch_records.map(r => ({ uuid: r.uuid, target_stage: r.effective_stage })),
        deletes: fac.soft_delete_records.map(r => r.uuid),
    };
}

// -----------------------------------------------------------------------
// Mismatch records table (shown when a facility row is expanded)
// -----------------------------------------------------------------------

function RecordRows({ records, label }) {
    if (!records || records.length === 0) return null;
    return (
        <>
            <tr>
                <td colSpan={7} style={{ paddingLeft: 72, paddingTop: 4, paddingBottom: 0, background: '#f8f9fa', fontSize: 11 }}>
                    <strong className="text-muted text-uppercase">{label}</strong>
                </td>
            </tr>
            {records.map((rec, i) => (
                <tr key={i} style={{ background: rec.is_soft_delete_candidate ? '#fde8e8' : '#fff8e1', fontSize: 12 }}>
                    <td style={{ paddingLeft: 72 }}>{rec.submission_date || '—'}</td>
                    <td colSpan={2}>
                        <StageBadge stage={rec.reported_stage} />
                        {' → '}
                        <StageBadge stage={rec.effective_stage} />
                        {rec.has_override && <span className="badge badge-dark ml-1" style={{ fontSize: 9 }}>override</span>}
                    </td>
                    <td colSpan={4}><code style={{ fontSize: 10 }}>{rec.uuid}</code></td>
                </tr>
            ))}
        </>
    );
}

// -----------------------------------------------------------------------
// Action buttons: Fix / Delete / both
// -----------------------------------------------------------------------

function ActionButtons({ fixes, deletes, scopeKey, applying, applyResults, onApply }) {
    const isApplying = applying[scopeKey];
    const result     = applyResults[scopeKey];

    if (result) {
        return (
            <span style={{ fontSize: 11 }}>
                {result.fixed > 0   && <span className="badge badge-success mr-1">Fixed {result.fixed}</span>}
                {result.deleted > 0 && <span className="badge badge-secondary mr-1">Deleted {result.deleted}</span>}
                {result.errors.length > 0 && (
                    <span className="badge badge-danger mr-1" title={result.errors.join('\n')}>
                        {result.errors.length} error{result.errors.length > 1 ? 's' : ''}
                    </span>
                )}
            </span>
        );
    }

    return (
        <>
            {fixes.length > 0 && (
                <button
                    className="btn btn-xs btn-warning mr-1"
                    style={{ fontSize: 11, padding: '1px 6px' }}
                    disabled={isApplying}
                    onClick={() => onApply(scopeKey, fixes, [])}
                >
                    {isApplying ? '…' : `Fix ${fixes.length}`}
                </button>
            )}
            {deletes.length > 0 && (
                <button
                    className="btn btn-xs btn-outline-danger mr-1"
                    style={{ fontSize: 11, padding: '1px 6px' }}
                    disabled={isApplying}
                    onClick={() => onApply(scopeKey, [], deletes)}
                    title="Soft-delete near-duplicate records (< 87 days before next visit)"
                >
                    {isApplying ? '…' : `Del ${deletes.length}`}
                </button>
            )}
            {fixes.length > 0 && deletes.length > 0 && (
                <button
                    className="btn btn-xs btn-danger"
                    style={{ fontSize: 11, padding: '1px 6px' }}
                    disabled={isApplying}
                    onClick={() => onApply(scopeKey, fixes, deletes)}
                >
                    {isApplying ? '…' : `All ${fixes.length + deletes.length}`}
                </button>
            )}
        </>
    );
}

// -----------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------

class BulkCorrection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            countyFilter: '',
            counties: [],
            loadedAt: null,
            loading: false,
            loadError: null,
            expanded: new Set(),
            applying: {},
            applyResults: {},
            fetchStatus: null,
        };
    }

    async loadSummary() {
        const { countyFilter } = this.state;
        this.setState({ loading: true, loadError: null, counties: [], loadedAt: null, applyResults: {}, fetchStatus: null, expanded: new Set() });
        try {
            const resp = await axios.post('/api/dev/mismatch_summary', { county: countyFilter || undefined });
            this.setState({ counties: resp.data.counties, loadedAt: resp.data.loaded_at });
        } catch (e) {
            this.setState({ loadError: e.response?.data?.error || e.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    toggle(key) {
        this.setState(prev => {
            const next = new Set(prev.expanded);
            next.has(key) ? next.delete(key) : next.add(key);
            return { expanded: next };
        });
    }

    async applyFixes(scopeKey, fixes, deletes, county) {
        if (!fixes.length && !deletes.length) return;
        this.setState(prev => ({ applying: { ...prev.applying, [scopeKey]: true } }));

        try {
            const resp = await axios.post('/api/dev/bulk_apply_fixes', { fixes, deletes });
            this.setState(prev => ({
                applying:     { ...prev.applying, [scopeKey]: false },
                applyResults: { ...prev.applyResults, [scopeKey]: resp.data },
            }));

            if (resp.data.fixed > 0 || resp.data.deleted > 0) {
                if (county) {
                    try {
                        const fr = await axios.post('/api/dev/trigger_odk_fetch', { county, checklist: 'spi' });
                        this.setState({ fetchStatus: { county, ok: true, message: fr.data.message } });
                    } catch (e) {
                        this.setState({ fetchStatus: { county, ok: false, message: e.response?.data?.message || e.message } });
                    }
                }
                await this.loadSummary();
            }
        } catch (e) {
            this.setState(prev => ({
                applying:     { ...prev.applying, [scopeKey]: false },
                applyResults: { ...prev.applyResults, [scopeKey]: { fixed: 0, deleted: 0, errors: [e.response?.data?.message || e.message] } },
            }));
        }
    }

    renderTotals() {
        const { counties } = this.state;
        let total = 0, matched = 0, mismatches = 0, soft_deletes = 0;
        for (const c of counties) {
            total       += c.stats.total;
            matched     += c.stats.matched;
            mismatches  += c.stats.mismatches;
            soft_deletes += c.stats.soft_deletes;
        }
        return (
            <div className="mb-3">
                <span className="badge badge-secondary mr-2">{counties.length} counties</span>
                <span className="badge badge-secondary mr-2">{total} records</span>
                <span className="badge badge-success mr-2">{matched} matched</span>
                {mismatches > 0  && <span className="badge badge-warning mr-2">{mismatches} stage mismatches</span>}
                {soft_deletes > 0 && <span className="badge badge-danger mr-2">{soft_deletes} near-duplicates</span>}
            </div>
        );
    }

    render() {
        const { countyFilter, counties, loadedAt, loading, loadError, expanded, applying, applyResults, fetchStatus } = this.state;

        return (
            <div className="p-4">
                <h4 className="mb-1">Bulk Timeline Stage Correction</h4>
                <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                    Summary of SPI stage mismatches across all counties. Apply bulk fixes at county, sub-county, or facility level.
                    Near-duplicates (records &lt; 87 days before the next visit for the same site) are flagged separately.
                </p>

                <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ maxWidth: 240 }}
                        placeholder="Filter by county (optional)"
                        value={countyFilter}
                        onChange={e => this.setState({ countyFilter: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && this.loadSummary()}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => this.loadSummary()} disabled={loading}>
                        {loading ? 'Loading…' : 'Load Summary'}
                    </button>
                    {loadedAt && <small className="text-muted">Loaded {new Date(loadedAt).toLocaleTimeString()}</small>}
                </div>

                {loadError && <div className="alert alert-danger py-2">{loadError}</div>}

                {fetchStatus && (
                    <div className={`alert alert-${fetchStatus.ok ? 'info' : 'warning'} d-flex justify-content-between align-items-center py-2 mb-3`} style={{ fontSize: 13 }}>
                        <span>
                            {fetchStatus.ok
                                ? <><strong>ODK fetch triggered</strong> — {fetchStatus.message}. Data will refresh in the background.</>
                                : <><strong>ODK fetch failed</strong>: {fetchStatus.message}</>}
                        </span>
                        <button className="close ml-3" style={{ fontSize: 16 }} onClick={() => this.setState({ fetchStatus: null })}>
                            <span>&times;</span>
                        </button>
                    </div>
                )}

                {counties.length > 0 && (
                    <>
                        {this.renderTotals()}
                        <table className="table table-sm table-bordered" style={{ fontSize: 12 }}>
                            <thead className="thead-dark">
                                <tr>
                                    <th style={{ width: 260 }}>Location</th>
                                    <th>Stats</th>
                                    <th style={{ width: 200 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {counties.map(county => {
                                    const ck = county.county;
                                    const isExpanded = expanded.has(ck);
                                    const { fixes, deletes } = collectCountyActions(county);
                                    const hasIssues = county.stats.mismatches > 0 || county.stats.soft_deletes > 0;

                                    return (
                                        <React.Fragment key={ck}>
                                            {/* County row */}
                                            <tr style={{ background: hasIssues ? '#fffbf0' : '#f0fff4' }}>
                                                <td>
                                                    <button
                                                        className="btn btn-link btn-sm p-0 mr-2"
                                                        style={{ fontSize: 13, textDecoration: 'none' }}
                                                        onClick={() => this.toggle(ck)}
                                                    >
                                                        {isExpanded ? '▼' : '▶'}
                                                    </button>
                                                    <strong className="text-capitalize">{county.county}</strong>
                                                </td>
                                                <td>{statsBadges(county.stats)}</td>
                                                <td>
                                                    <ActionButtons
                                                        fixes={fixes} deletes={deletes}
                                                        scopeKey={ck}
                                                        applying={applying} applyResults={applyResults}
                                                        onApply={(k, f, d) => this.applyFixes(k, f, d, county.county)}
                                                    />
                                                </td>
                                            </tr>

                                            {isExpanded && county.subcounties.map(sub => {
                                                const sk = ck + '|' + sub.subcounty;
                                                const isSubExp = expanded.has(sk);
                                                const { fixes: sf, deletes: sd } = collectSubcountyActions(sub);
                                                const subHasIssues = sub.stats.mismatches > 0 || sub.stats.soft_deletes > 0;

                                                return (
                                                    <React.Fragment key={sk}>
                                                        {/* Subcounty row */}
                                                        <tr style={{ background: subHasIssues ? '#fffdf0' : '#f9fffe' }}>
                                                            <td style={{ paddingLeft: 28 }}>
                                                                <button
                                                                    className="btn btn-link btn-sm p-0 mr-2"
                                                                    style={{ fontSize: 12, textDecoration: 'none' }}
                                                                    onClick={() => this.toggle(sk)}
                                                                >
                                                                    {isSubExp ? '▼' : '▶'}
                                                                </button>
                                                                <span className="text-capitalize">{sub.subcounty}</span>
                                                            </td>
                                                            <td>{statsBadges(sub.stats)}</td>
                                                            <td>
                                                                <ActionButtons
                                                                    fixes={sf} deletes={sd}
                                                                    scopeKey={sk}
                                                                    applying={applying} applyResults={applyResults}
                                                                    onApply={(k, f, d) => this.applyFixes(k, f, d, county.county)}
                                                                />
                                                            </td>
                                                        </tr>

                                                        {isSubExp && sub.facilities.map(fac => {
                                                            const fk = sk + '|' + fac.facility + '|' + fac.site;
                                                            const isFacExp = expanded.has(fk);
                                                            const { fixes: ff, deletes: fd } = collectFacilityActions(fac);
                                                            const facHasIssues = fac.stats.mismatches > 0 || fac.stats.soft_deletes > 0;

                                                            return (
                                                                <React.Fragment key={fk}>
                                                                    {/* Facility row */}
                                                                    <tr style={{ background: facHasIssues ? '#fffff8' : '#ffffff' }}>
                                                                        <td style={{ paddingLeft: 52 }}>
                                                                            {(fac.mismatch_records.length > 0 || fac.soft_delete_records.length > 0) && (
                                                                                <button
                                                                                    className="btn btn-link btn-sm p-0 mr-2"
                                                                                    style={{ fontSize: 11, textDecoration: 'none' }}
                                                                                    onClick={() => this.toggle(fk)}
                                                                                >
                                                                                    {isFacExp ? '▼' : '▶'}
                                                                                </button>
                                                                            )}
                                                                            <span>{fac.mfl}</span>
                                                                            <span className="text-muted mx-1">/</span>
                                                                            <span className="text-uppercase">{fac.site}</span>
                                                                            {fac.facility && (
                                                                                <span className="text-muted ml-1" style={{ fontSize: 10 }}>
                                                                                    {fac.facility.split('_').slice(1).join(' ')}
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td>{statsBadges(fac.stats)}</td>
                                                                        <td>
                                                                            <ActionButtons
                                                                                fixes={ff} deletes={fd}
                                                                                scopeKey={fk}
                                                                                applying={applying} applyResults={applyResults}
                                                                                onApply={(k, f, d) => this.applyFixes(k, f, d, county.county)}
                                                                            />
                                                                        </td>
                                                                    </tr>

                                                                    {/* Individual mismatch + soft-delete records */}
                                                                    {isFacExp && (
                                                                        <>
                                                                            <RecordRows records={fac.mismatch_records} label="Stage mismatches" />
                                                                            <RecordRows records={fac.soft_delete_records} label="Near-duplicates (soft delete candidates)" />
                                                                        </>
                                                                    )}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        );
    }
}

if (document.getElementById('BulkCorrection')) {
    ReactDOM.render(<BulkCorrection />, document.getElementById('BulkCorrection'));
}

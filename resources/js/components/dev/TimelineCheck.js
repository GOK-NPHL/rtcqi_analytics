import React from 'react';
import ReactDOM from 'react-dom';

// Per-row action: 'fix' = stage correction, 'delete' = soft delete, false = no action
function defaultAction(row) {
    if (!row.uuid || row.match) return false;
    return row.soft_delete_candidate ? 'delete' : 'fix';
}

class TimelineCheck extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mfl: '',
            rows: [],
            count: null,
            loading: false,
            error: null,
            // uuid → 'fix' | 'delete' | false
            actions: {},
            confirmSite: null,
            applying: {},    // site key → true while in-flight
            applyErrors: {}, // uuid → error string
        };
    }

    async fetchData() {
        const { mfl } = this.state;
        if (!mfl.trim()) return;

        this.setState({ loading: true, error: null, rows: [], count: null, actions: {}, applyErrors: {} });
        try {
            const resp = await axios.post('/api/dev/facility_timeline', { mfl: mfl.trim() });
            const rows = resp.data.data;
            const actions = {};
            rows.forEach(row => { actions[row.uuid] = defaultAction(row); });
            this.setState({ rows, count: resp.data.count, actions });
        } catch (e) {
            const msg = e.response?.data?.error || e.message;
            this.setState({ error: msg });
        } finally {
            this.setState({ loading: false });
        }
    }

    handleKey(e) {
        if (e.key === 'Enter') { e.preventDefault(); this.fetchData(); }
    }

    // Cycle through: default → false → default (toggle on/off)
    toggleAction(row) {
        const def = defaultAction(row);
        this.setState(prev => ({
            actions: {
                ...prev.actions,
                [row.uuid]: prev.actions[row.uuid] ? false : def,
            },
        }));
    }

    openConfirm(siteKey) {
        this.setState({ confirmSite: siteKey });
    }

    closeConfirm() {
        this.setState({ confirmSite: null });
    }

    async applyCorrections(siteRows) {
        const { actions, mfl } = this.state;
        const toFix    = siteRows.filter(r => actions[r.uuid] === 'fix');
        const toDelete = siteRows.filter(r => actions[r.uuid] === 'delete');
        if (!toFix.length && !toDelete.length) return;

        const siteKey = siteRows[0].mysites_facility + '|' + siteRows[0].mysites;
        this.setState(prev => ({
            confirmSite: null,
            applying: { ...prev.applying, [siteKey]: true },
        }));

        const errors = {};

        for (const row of toFix) {
            try {
                await axios.post('/api/dev/fix_submission_stage', {
                    uuid:             row.uuid,
                    target_stage:     row.computed_stage,
                    previous_stage:   row.reported_stage,
                    mfl:              mfl.trim(),
                    mysites_facility: row.mysites_facility,
                    mysites:          row.mysites,
                });
            } catch (e) {
                errors[row.uuid] = e.response?.data?.error || e.message;
            }
        }

        for (const row of toDelete) {
            try {
                await axios.post('/api/dev/soft_delete_submission', {
                    uuid:             row.uuid,
                    previous_stage:   row.reported_stage,
                    mfl:              mfl.trim(),
                    mysites_facility: row.mysites_facility,
                    mysites:          row.mysites,
                });
            } catch (e) {
                errors[row.uuid] = e.response?.data?.error || e.message;
            }
        }

        this.setState(prev => ({
            applying: { ...prev.applying, [siteKey]: false },
            applyErrors: { ...prev.applyErrors, ...errors },
        }));

        await this.fetchData();
    }

    renderBadge(stage) {
        if (!stage) return <span className="badge badge-secondary">—</span>;
        if (stage === 'baseline') return <span className="badge badge-primary">{stage}</span>;
        if (stage === 'other')    return <span className="badge badge-warning">{stage}</span>;
        return <span className="badge badge-info">{stage}</span>;
    }

    renderConfirmModal(siteRows) {
        const { actions, confirmSite } = this.state;
        if (!confirmSite) return null;

        const key = siteRows[0].mysites_facility + '|' + siteRows[0].mysites;
        if (confirmSite !== key) return null;

        const toFix    = siteRows.filter(r => actions[r.uuid] === 'fix');
        const toDelete = siteRows.filter(r => actions[r.uuid] === 'delete');
        const total    = toFix.length + toDelete.length;
        const mflCode  = siteRows[0].mysites_facility.split('_')[0];
        const siteName = siteRows[0].mysites_facility.split('_').slice(1).join(' ');

        return (
            <div style={{ display: 'block', background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
                <div className="modal-dialog" style={{ marginTop: 60 }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm corrections</h5>
                            <button type="button" className="close" onClick={() => this.closeConfirm()}><span>&times;</span></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <p className="mb-2">
                                <strong>{mflCode}</strong> — {siteName} / <span className="text-uppercase">{siteRows[0].mysites}</span>
                            </p>

                            {toFix.length > 0 && (
                                <>
                                    <p className="mb-1 font-weight-bold" style={{ fontSize: 12 }}>Stage corrections ({toFix.length})</p>
                                    <table className="table table-sm table-bordered mb-3" style={{ fontSize: 12 }}>
                                        <thead className="thead-light">
                                            <tr><th>Date</th><th>Reported</th><th>→ Set to</th><th>UUID</th></tr>
                                        </thead>
                                        <tbody>
                                            {toFix.map((row, i) => (
                                                <tr key={i}>
                                                    <td style={{ whiteSpace: 'nowrap' }}>{row.start ? row.start.split('T')[0] : '—'}</td>
                                                    <td>{this.renderBadge(row.reported_stage)}</td>
                                                    <td>{this.renderBadge(row.computed_stage)}</td>
                                                    <td><code style={{ fontSize: 10 }}>{row.uuid ? row.uuid.slice(0, 18) + '…' : '—'}</code></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {toDelete.length > 0 && (
                                <>
                                    <p className="mb-1 font-weight-bold text-danger" style={{ fontSize: 12 }}>
                                        Soft deletions ({toDelete.length}) — these records are &lt; 10 days from the next visit
                                    </p>
                                    <table className="table table-sm table-bordered mb-2" style={{ fontSize: 12 }}>
                                        <thead className="thead-light">
                                            <tr><th>Date</th><th>Reported stage</th><th>Next record date</th><th>UUID</th></tr>
                                        </thead>
                                        <tbody>
                                            {toDelete.map((row, i) => {
                                                // Find the next record for this site
                                                const siteRows2 = siteRows;
                                                const idx = siteRows2.findIndex(r => r.uuid === row.uuid);
                                                const nextRow = idx >= 0 && idx + 1 < siteRows2.length ? siteRows2[idx + 1] : null;
                                                return (
                                                    <tr key={i}>
                                                        <td style={{ whiteSpace: 'nowrap' }}>{row.start ? row.start.split('T')[0] : '—'}</td>
                                                        <td>{this.renderBadge(row.reported_stage)}</td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>
                                                            {nextRow && nextRow.start ? nextRow.start.split('T')[0] : '—'}
                                                        </td>
                                                        <td><code style={{ fontSize: 10 }}>{row.uuid ? row.uuid.slice(0, 18) + '…' : '—'}</code></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <p className="text-muted" style={{ fontSize: 11 }}>
                                        Soft delete sets <code>submissions.deletedAt</code> in ODK Central. This is not easily reversible.
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary btn-sm" onClick={() => this.closeConfirm()}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={() => this.applyCorrections(siteRows)}>
                                Apply {total} change{total !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { mfl, rows, count, loading, error, actions, applying, applyErrors, confirmSite } = this.state;

        const siteGroups = {};
        rows.forEach(row => {
            const key = row.mysites_facility + '|' + row.mysites;
            if (!siteGroups[key]) siteGroups[key] = [];
            siteGroups[key].push(row);
        });

        const matchCount    = rows.filter(r => r.match).length;
        const mismatchCount = rows.filter(r => !r.match).length;
        const deleteCount   = rows.filter(r => r.soft_delete_candidate).length;

        return (
            <div className="p-4">
                {confirmSite && Object.values(siteGroups).map((sr, i) => (
                    <React.Fragment key={i}>{this.renderConfirmModal(sr)}</React.Fragment>
                ))}

                <h4 className="mb-1">Timeline Stage Bench-Check</h4>
                <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                    Compares the <strong>computed</strong> time-based followup stage against the
                    <strong> reported</strong> stage entered in the ODK form, for a given facility MFL code.
                </p>

                <div className="input-group mb-3" style={{ maxWidth: 400 }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="MFL code (e.g. 14607)"
                        value={mfl}
                        onChange={e => this.setState({ mfl: e.target.value })}
                        onKeyDown={e => this.handleKey(e)}
                    />
                    <div className="input-group-append">
                        <button className="btn btn-primary" onClick={() => this.fetchData()} disabled={loading}>
                            {loading ? 'Loading…' : 'Check'}
                        </button>
                    </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {count !== null && (
                    <div className="mb-3">
                        <span className="badge badge-secondary mr-2">{count} records</span>
                        <span className="badge badge-success mr-2">{matchCount} match</span>
                        {mismatchCount > 0 && <span className="badge badge-danger mr-2">{mismatchCount} mismatch</span>}
                        {deleteCount > 0 && (
                            <span className="badge badge-dark mr-2" title="Mismatched records < 10 days before the next visit — candidates for soft deletion">
                                {deleteCount} near-duplicate
                            </span>
                        )}
                    </div>
                )}

                {Object.keys(siteGroups).map(key => {
                    const siteRows   = siteGroups[key];
                    const first      = siteRows[0];
                    const siteName   = first.mysites_facility.split('_').slice(1).join(' ');
                    const mflCode    = first.mysites_facility.split('_')[0];
                    const pendingCount = siteRows.filter(r => actions[r.uuid]).length;
                    const isApplying = applying[key];

                    return (
                        <div key={key} className="card mb-3">
                            <div className="card-header py-2 d-flex align-items-center justify-content-between">
                                <span>
                                    <strong>{mflCode}</strong>{' — '}{siteName}{' / '}
                                    <span className="text-uppercase">{first.mysites}</span>
                                    <span className="text-muted ml-2" style={{ fontSize: 12 }}>
                                        ({first.mysites_county} › {first.mysites_subcounty})
                                    </span>
                                </span>
                                {pendingCount > 0 && (
                                    <button
                                        className="btn btn-sm btn-outline-danger ml-3"
                                        style={{ whiteSpace: 'nowrap' }}
                                        disabled={isApplying}
                                        onClick={() => this.openConfirm(key)}
                                    >
                                        {isApplying ? 'Applying…' : `Save changes (${pendingCount})`}
                                    </button>
                                )}
                            </div>
                            <div className="card-body p-0">
                                <table className="table table-sm table-bordered mb-0" style={{ fontSize: 12 }}>
                                    <thead className="thead-light">
                                        <tr>
                                            <th style={{ width: 28 }} title="Toggle action"></th>
                                            <th>#</th>
                                            <th>Submission Date</th>
                                            <th>Start Date</th>
                                            <th>Computed</th>
                                            <th>Reported</th>
                                            <th>baselinefollowup</th>
                                            <th>followup</th>
                                            <th>otherFollowup</th>
                                            <th>Match?</th>
                                            <th>UUID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {siteRows.map((row, i) => {
                                            const action   = actions[row.uuid];
                                            const rowError = applyErrors[row.uuid];
                                            const isDelete = row.soft_delete_candidate;
                                            const bgColor  = row.match
                                                ? ''
                                                : (isDelete ? '#fde8e8' : '#fff3cd');

                                            return (
                                                <tr key={i} style={{ background: bgColor }}>
                                                    <td className="text-center">
                                                        {!row.match && row.uuid && (
                                                            <input
                                                                type="checkbox"
                                                                checked={!!action}
                                                                onChange={() => this.toggleAction(row)}
                                                                title={isDelete
                                                                    ? 'Soft delete (< 10 days from next record)'
                                                                    : 'Fix reported stage to computed stage'}
                                                            />
                                                        )}
                                                    </td>
                                                    <td>{i + 1}</td>
                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                        {row?.SubmissionDate ? row?.SubmissionDate.split('T')[0] : '—'}
                                                    </td>
                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                        {row.start ? new Date(row.start).toLocaleTimeString('en-GB') : '—'}
                                                    </td>
                                                    <td>{this.renderBadge(row.computed_stage)}</td>
                                                    <td>{this.renderBadge(row.reported_stage)}</td>
                                                    <td><code>{row.reported_baselinefollowup || '—'}</code></td>
                                                    <td><code>{row.reported_followup || '—'}</code></td>
                                                    <td><code>{row.reported_otherFollowup || '—'}</code></td>
                                                    <td>
                                                        {row.match
                                                            ? <span className="text-success">✓</span>
                                                            : isDelete
                                                                ? <span className="text-danger" title="Near-duplicate: < 10 days before next record">⊗</span>
                                                                : <span className="text-danger font-weight-bold">✗</span>
                                                        }
                                                        {action === 'delete' && (
                                                            <span className="badge badge-danger ml-1" style={{ fontSize: 9 }}>del</span>
                                                        )}
                                                        {action === 'fix' && (
                                                            <span className="badge badge-warning ml-1" style={{ fontSize: 9 }}>fix</span>
                                                        )}
                                                        {rowError && (
                                                            <span className="text-danger ml-1" title={rowError} style={{ fontSize: 10 }}>⚠ {rowError}</span>
                                                        )}
                                                    </td>
                                                    <td><code>{row.uuid || '—'}</code></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

if (document.getElementById('TimelineCheck')) {
    ReactDOM.render(<TimelineCheck />, document.getElementById('TimelineCheck'));
}

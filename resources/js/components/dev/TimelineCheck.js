import React from 'react';
import ReactDOM from 'react-dom';

class TimelineCheck extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mfl: '',
            rows: [],
            count: null,
            loading: false,
            error: null,
        };
    }

    async fetchData() {
        const { mfl } = this.state;
        if (!mfl.trim()) return;

        this.setState({ loading: true, error: null, rows: [], count: null });
        try {
            const resp = await axios.post('/api/dev/facility_timeline', { mfl: mfl.trim() });
            this.setState({ rows: resp.data.data, count: resp.data.count });
        } catch (e) {
            const msg = e.response?.data?.error || e.message;
            this.setState({ error: msg });
        } finally {
            this.setState({ loading: false });
        }
    }

    handleKey(e) {
        if (e.key === 'Enter') this.fetchData();
    }

    renderBadge(stage) {
        if (!stage) return <span className="badge badge-secondary">—</span>;
        if (stage === 'baseline') return <span className="badge badge-primary">{stage}</span>;
        if (stage === 'other')    return <span className="badge badge-warning">{stage}</span>;
        return <span className="badge badge-info">{stage}</span>;
    }

    render() {
        const { mfl, rows, count, loading, error } = this.state;

        // Group rows by site for display
        const siteGroups = {};
        rows.forEach(row => {
            const key = row.mysites_facility + '|' + row.mysites;
            if (!siteGroups[key]) siteGroups[key] = [];
            siteGroups[key].push(row);
        });

        const matchCount  = rows.filter(r => r.match).length;
        const mismatchCount = rows.filter(r => !r.match).length;

        return (
            <div className="p-4">
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
                        onKeyPress={e => this.handleKey(e)}
                    />
                    <div className="input-group-append">
                        <button
                            className="btn btn-primary"
                            onClick={() => this.fetchData()}
                            disabled={loading}
                        >
                            {loading ? 'Loading…' : 'Check'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {count !== null && (
                    <div className="mb-3">
                        <span className="badge badge-secondary mr-2">{count} records</span>
                        <span className="badge badge-success mr-2">{matchCount} match</span>
                        {mismatchCount > 0 && (
                            <span className="badge badge-danger mr-2">{mismatchCount} mismatch</span>
                        )}
                    </div>
                )}

                {Object.keys(siteGroups).map(key => {
                    const siteRows = siteGroups[key];
                    const first = siteRows[0];
                    const facilityName = first.mysites_facility.split('_').slice(1).join(' ');
                    return (
                        <div key={key} className="card mb-3">
                            <div className="card-header py-2">
                                <strong>{first.mysites_facility.split('_')[0]}</strong>
                                {' — '}
                                {facilityName}
                                {' / '}
                                <span className="text-uppercase">{first.mysites}</span>
                                <span className="text-muted ml-2" style={{ fontSize: 12 }}>
                                    ({first.mysites_county} › {first.mysites_subcounty})
                                </span>
                            </div>
                            <div className="card-body p-0">
                                <table className="table table-sm table-bordered mb-0" style={{ fontSize: 12 }}>
                                    <thead className="thead-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Submission date</th>
                                            <th>Computed stage</th>
                                            <th>Reported stage</th>
                                            <th>baselinefollowup</th>
                                            <th>followup</th>
                                            <th>otherFollowup</th>
                                            <th>Match?</th>
                                            <th>UUID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {siteRows.map((row, i) => (
                                            <tr key={i} style={{ background: row.match ? '' : '#fff3cd' }}>
                                                <td>{i + 1}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    {row.start ? row.start.split('T')[0] : '—'}
                                                </td>
                                                <td>{this.renderBadge(row.computed_stage)}</td>
                                                <td>{this.renderBadge(row.reported_stage)}</td>
                                                <td><code>{row.reported_baselinefollowup || '—'}</code></td>
                                                <td><code>{row.reported_followup || '—'}</code></td>
                                                <td><code>{row.reported_otherFollowup || '—'}</code></td>
                                                <td>
                                                    {row.match
                                                        ? <span className="text-success">✓</span>
                                                        : <span className="text-danger font-weight-bold">✗</span>
                                                    }
                                                </td>
                                                <td><code>{row.uuid || '—'}</code></td>
                                            </tr>
                                        ))}
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

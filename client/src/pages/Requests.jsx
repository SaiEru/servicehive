import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Requests() {
	const [incoming, setIncoming] = useState([]);
	const [outgoing, setOutgoing] = useState([]);

	const load = async () => {
		const { data } = await api.get('/api/swap-requests');
		setIncoming(data.incoming);
		setOutgoing(data.outgoing);
	};

	useEffect(() => { load(); }, []);

	const respond = async (id, action) => {
		try {
			await api.post(`/api/swap-response/${id}`, { action });
			load();
		} catch (e) {
			alert(e?.response?.data?.message || 'Failed to respond');
		}
	};

	return (
		<div className="container">
			<h2 style={{ margin: '16px 0' }}>Swap Requests</h2>
			<h3>Incoming</h3>
			<ul className="list">
				{incoming.map((r) => (
					<li key={r._id} className="list-item">
						<div><strong>Status:</strong> <span className={`badge ${r.status === 'PENDING' ? 'badge-pending' : r.status === 'REJECTED' ? 'badge-rejected' : 'badge-swappable'}`}>{r.status}</span></div>
						<div><strong>From:</strong> {r.requester?.name} — {r.fromEvent?.title}</div>
						<div><strong>To:</strong> You — {r.toEvent?.title}</div>
						{r.status === 'PENDING' && (
							<div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
								<button className="btn-primary" onClick={() => respond(r._id, 'ACCEPT')}>Accept</button>
								<button className="btn-danger" onClick={() => respond(r._id, 'REJECT')}>Reject</button>
							</div>
						)}
					</li>
				))}
			</ul>
			<h3>Outgoing</h3>
			<ul className="list">
				{outgoing.map((r) => (
					<li key={r._id} className="list-item">
						<div><strong>Status:</strong> <span className={`badge ${r.status === 'PENDING' ? 'badge-pending' : r.status === 'REJECTED' ? 'badge-rejected' : 'badge-swappable'}`}>{r.status}</span></div>
						<div><strong>You offered:</strong> {r.fromEvent?.title} → {r.toEvent?.title}</div>
					</li>
				))}
			</ul>
		</div>
	);
}



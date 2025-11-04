import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Marketplace() {
	const [slots, setSlots] = useState([]);
	const [myEvents, setMyEvents] = useState([]);
	const [selectedMyEvent, setSelectedMyEvent] = useState('');

	const load = async () => {
		const [{ data: swappable }, { data: events }] = await Promise.all([
			api.get('/api/swappable-slots'),
			api.get('/api/events'),
		]);
		setSlots(swappable);
		const mine = events.filter(e => e.status === 'SWAPPABLE');
		setMyEvents(mine);
		if (mine.length) {
			// keep current selection if still valid; otherwise pick first
			if (!selectedMyEvent || !mine.some(e => e._id === selectedMyEvent)) {
				setSelectedMyEvent(mine[0]._id);
			}
		} else {
			setSelectedMyEvent('');
		}
	};

	useEffect(() => { load(); }, []);

	const requestSwap = async (targetId) => {
		try {
			if (!selectedMyEvent) return alert('Select one of your swappable events first');
			await api.post('/api/swap-request', { myEventId: selectedMyEvent, targetEventId: targetId });
			load();
		} catch (e) {
			alert(e?.response?.data?.message || 'Swap request failed');
		}
	};

	return (
		<div className="container">
			<h2 style={{ margin: '16px 0' }}>Marketplace</h2>
			<div className="card" style={{ marginBottom: 12 }}>
				<label style={{ marginRight: 8 }}>Offer with my swappable event:</label>
				<select value={selectedMyEvent} onChange={(e) => setSelectedMyEvent(e.target.value)}>
					{!myEvents.length && <option value="" disabled>No swappable events</option>}
					{myEvents.map(ev => (
						<option key={ev._id} value={ev._id}>{ev.title} ({new Date(ev.startTime).toLocaleString()})</option>
					))}
				</select>
			</div>
			<ul className="list">
				{slots.map(slot => (
					<li key={slot._id} className="list-item">
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<div>
								<div><strong>{slot.title}</strong> — {slot.owner?.name} ({slot.owner?.email})</div>
								<div>{new Date(slot.startTime).toLocaleString()} → {new Date(slot.endTime).toLocaleString()}</div>
							</div>
							<button className="btn-primary" disabled={!selectedMyEvent} onClick={() => requestSwap(slot._id)}>Request swap</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}



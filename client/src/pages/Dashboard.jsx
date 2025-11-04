import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
	const [events, setEvents] = useState([]);
	const [title, setTitle] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');

	const load = async () => {
		const { data } = await api.get('/api/events');
		setEvents(data);
	};

	useEffect(() => { load(); }, []);

	const create = async (e) => {
		e.preventDefault();
		await api.post('/api/events', { title, startTime, endTime });
		setTitle(''); setStartTime(''); setEndTime('');
		load();
	};

	const toggleSwappable = async (id, swappable) => {
		await api.post(`/api/events/${id}/swappable`, { swappable });
		load();
	};

	const remove = async (id) => {
		await api.delete(`/api/events/${id}`);
		load();
	};

	return (
		<div className="container">
			<h2 style={{ margin: '16px 0' }}>My Events</h2>
			<form onSubmit={create} className="card" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
				<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
				<input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="datetime-local" required />
				<input value={endTime} onChange={(e) => setEndTime(e.target.value)} type="datetime-local" required />
				<button type="submit" className="btn-primary">Add</button>
			</form>
			<table className="table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Start</th>
						<th>End</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{events.map(ev => (
						<tr key={ev._id}>
							<td>{ev.title}</td>
							<td>{new Date(ev.startTime).toLocaleString()}</td>
							<td>{new Date(ev.endTime).toLocaleString()}</td>
							<td>
								<span className={`badge ${ev.status === 'SWAPPABLE' ? 'badge-swappable' : ev.status === 'SWAP_PENDING' ? 'badge-pending' : 'badge-busy'}`}>{ev.status}</span>
							</td>
							<td style={{ display: 'flex', gap: 8 }}>
								<button className="btn-ghost" onClick={() => toggleSwappable(ev._id, ev.status !== 'SWAPPABLE')}>{ev.status === 'SWAPPABLE' ? 'Unset Swappable' : 'Make Swappable'}</button>
								<button className="btn-danger" onClick={() => remove(ev._id)}>Delete</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}



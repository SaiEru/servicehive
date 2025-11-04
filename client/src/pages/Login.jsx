import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');
		try {
			await login(email, password);
			navigate('/');
		} catch (err) {
			setError('Invalid credentials');
		}
	};

	return (
		<div className="container" style={{ maxWidth: 480 }}>
			<h2 style={{ margin: '16px 0' }}>Login</h2>
			<form onSubmit={onSubmit} className="card">
				<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required style={{ width: '100%', marginBottom: 8 }} />
				<input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required style={{ width: '100%', marginBottom: 8 }} />
				<button className="btn-primary" type="submit">Login</button>
			</form>
			{error && <p className="badge badge-rejected">{error}</p>}
			<p>New here? <Link to="/signup">Sign up</Link></p>
		</div>
	);
}



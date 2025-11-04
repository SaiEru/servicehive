import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Signup() {
	const { signup } = useAuth();
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');
		try {
			await signup(name, email, password);
			navigate('/');
		} catch (err) {
			setError('Sign up failed');
		}
	};

	return (
		<div className="container" style={{ maxWidth: 480 }}>
			<h2 style={{ margin: '16px 0' }}>Sign Up</h2>
			<form onSubmit={onSubmit} className="card">
				<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required style={{ width: '100%', marginBottom: 8 }} />
				<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required style={{ width: '100%', marginBottom: 8 }} />
				<input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required style={{ width: '100%', marginBottom: 8 }} />
				<button className="btn-primary" type="submit">Create account</button>
			</form>
			{error && <p className="badge badge-rejected">{error}</p>}
			<p>Have an account? <Link to="/login">Log in</Link></p>
		</div>
	);
}


